// Helper route functions for group projects
const { db } = require('../db');

function registerProjectRoutes(app, { requireRole }) {
  // 1. Get subjects & assigned faculty
  app.get('/api/faculty/subjects', (req, res) => {
    try {
      const subjects = db.prepare('SELECT id, faculty_id, faculty_name, subject, department FROM faculty_subject_assignments ORDER BY subject ASC').all();
      const faculty = db.prepare("SELECT id, full_name, email, department, avatar FROM users WHERE role = 'faculty' ORDER BY full_name ASC").all();
      res.json({ success: true, subjects, faculty });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Get eligible students for group formation
  app.get('/api/students/eligible', (req, res) => {
    try {
      const q = req.query.q ? String(req.query.q).toLowerCase().trim() : '';
      let students;
      if (q) {
        students = db.prepare(`
          SELECT id, full_name, email, roll_no, department
          FROM users
          WHERE role = 'student'
            AND (LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(roll_no) LIKE ?)
          ORDER BY full_name ASC
          LIMIT 20
        `).all(`%${q}%`, `%${q}%`, `%${q}%`);
      } else {
        students = db.prepare(`
          SELECT id, full_name, email, roll_no, department
          FROM users
          WHERE role = 'student'
          ORDER BY full_name ASC
          LIMIT 50
        `).all();
      }
      res.json({ success: true, students });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Create Group Project (Student)
  app.post('/api/projects', (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return res.status(401).json({ success: false, error: 'Authentication required to create a group project.' });
      }

      const {
        title,
        subject,
        domain,
        problem_statement,
        objectives,
        description,
        tech_stack,
        deliverables,
        start_date,
        target_date,
        proposal_doc_url,
        team_name,
        leader_id,
        mentor_id,
        members = [],
        is_draft = false
      } = req.body;

      // Basic validations
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Project title is required.' });
      }
      if (!subject || !subject.trim()) {
        return res.status(400).json({ success: false, error: 'Subject selection is required.' });
      }
      if (!domain || !domain.trim()) {
        return res.status(400).json({ success: false, error: 'Domain/category is required.' });
      }
      if (!description || !description.trim()) {
        return res.status(400).json({ success: false, error: 'Proposed solution/description is required.' });
      }
      if (!team_name || !team_name.trim()) {
        return res.status(400).json({ success: false, error: 'Team name is required.' });
      }

      // Member normalization and validation: min 2, max 5 distinct student members
      // Ensure creator is included
      let rawMembers = Array.isArray(members) ? [...members] : [];
      // Normalize members list into student IDs
      let memberIds = new Set();
      for (const m of rawMembers) {
        const id = typeof m === 'object' && m !== null ? (m.student_id || m.id) : m;
        if (id) memberIds.add(String(id).trim());
      }
      // Add currentUser.id if not present
      memberIds.add(String(currentUser.id).trim());

      const memberIdArray = Array.from(memberIds);

      // Validate team size: min 2, max 5
      if (memberIdArray.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Team size invalid: A group project requires a minimum of 2 distinct student members (including the team leader).'
        });
      }
      if (memberIdArray.length > 5) {
        return res.status(400).json({
          success: false,
          error: 'Team size invalid: A group project allows a maximum of 5 student members.'
        });
      }

      // Verify each member is a real registered student in the database
      const verifiedStudents = [];
      for (const sid of memberIdArray) {
        const studentUser = db.prepare("SELECT id, full_name, email, roll_no, role FROM users WHERE id = ?").get(sid);
        if (!studentUser) {
          return res.status(400).json({
            success: false,
            error: `Student account with ID '${sid}' does not exist in StudyFlow AI.`
          });
        }
        if (studentUser.role !== 'student') {
          return res.status(400).json({
            success: false,
            error: `User '${studentUser.full_name}' (${studentUser.email}) is a ${studentUser.role}, not a student. Only student accounts can join project teams.`
          });
        }
        verifiedStudents.push(studentUser);
      }

      // Determine Team Leader (must be in verified members)
      const designatedLeaderId = leader_id && memberIdArray.includes(String(leader_id).trim())
        ? String(leader_id).trim()
        : currentUser.id;
      const leaderUser = verifiedStudents.find(s => s.id === designatedLeaderId) || verifiedStudents[0];

      // Proposed Mentor check
      let mentorUser = null;
      if (mentor_id) {
        mentorUser = db.prepare("SELECT id, full_name, email, role FROM users WHERE id = ? AND role = 'faculty'").get(mentor_id);
      }

      // Subject-based Faculty Matching:
      // Look up who is authorized for this subject in faculty_subject_assignments
      const subjectAssignment = db.prepare("SELECT faculty_id, faculty_name FROM faculty_subject_assignments WHERE subject = ?").get(subject.trim());

      let approver_id = null;
      let approver_name = null;
      let status = is_draft ? 'Draft' : 'Pending Subject Faculty Approval';
      let approval_status = 'Pending';

      if (subjectAssignment) {
        approver_id = subjectAssignment.faculty_id;
        approver_name = subjectAssignment.faculty_name;
      } else {
        // If no matching faculty found, retain status as Submitted for Approval without approver
        status = is_draft ? 'Draft' : 'Submitted for Approval';
      }

      const newProjectId = 'proj_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
      const createdDate = new Date().toISOString().replace('T', ' ').slice(0, 19);

      // Perform atomic database transaction
      const createTx = db.transaction(() => {
        // 1. Insert into group_projects
        db.prepare(`
          INSERT INTO group_projects (
            id, title, subject, domain, problem_statement, objectives, description,
            tech_stack, deliverables, start_date, target_date, proposal_doc_url,
            team_name, leader_id, leader_name, created_by,
            mentor_id, mentor_name, mentor_status,
            approver_id, approver_name, status, approval_status,
            progress_pct, current_milestone, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?,
            0, '1. Problem definition and requirements', ?, ?
          )
        `).run(
          newProjectId,
          title.trim(),
          subject.trim(),
          domain.trim(),
          (problem_statement || '').trim(),
          (objectives || '').trim(),
          description.trim(),
          (tech_stack || '').trim(),
          (deliverables || '').trim(),
          start_date || new Date().toISOString().slice(0, 10),
          target_date || null,
          proposal_doc_url || null,
          team_name.trim(),
          leaderUser.id,
          leaderUser.full_name,
          currentUser.id,
          mentorUser ? mentorUser.id : null,
          mentorUser ? mentorUser.full_name : null,
          mentorUser ? 'Pending' : 'Not Assigned',
          approver_id,
          approver_name,
          status,
          approval_status,
          createdDate,
          createdDate
        );

        // 2. Insert members into project_members
        const insertMember = db.prepare(`
          INSERT INTO project_members (id, project_id, student_id, student_name, roll_no, email, role, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?)
        `);

        for (const s of verifiedStudents) {
          const memId = 'pm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
          const role = s.id === leaderUser.id ? 'Leader' : 'Member';
          insertMember.run(memId, newProjectId, s.id, s.full_name, s.roll_no || '', s.email, role, createdDate);
        }

        // 3. Notify designated subject faculty if assigned
        if (approver_id && !is_draft) {
          db.prepare(`
            INSERT INTO notifications (id, user_id, target_role, category, type, title, message, date, action_url)
            VALUES (?, ?, 'faculty', 'Projects', 'info', ?, ?, 'Just now', ?)
          `).run(
            'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
            approver_id,
            `New Project Proposal: ${title.trim()}`,
            `Team '${team_name.trim()}' submitted a capstone proposal for ${subject.trim()}. Requires your subject-faculty approval.`,
            '#/faculty/submissions'
          );
        }

        // 4. Audit Log
        db.prepare(`
          INSERT INTO audit_logs (id, action, user_role, user_name, target, details)
          VALUES (?, 'PROJECT_CREATED', ?, ?, ?, ?)
        `).run(
          'aud_' + Date.now().toString(36),
          currentUser.role,
          currentUser.fullName || currentUser.email,
          newProjectId,
          `Group project '${title.trim()}' created by ${currentUser.fullName} with ${verifiedStudents.length} members. Assigned to approver: ${approver_name || 'Pending assignment'}.`
        );
      });

      createTx();

      // Fetch created project with members to return
      const createdProj = db.prepare('SELECT * FROM group_projects WHERE id = ?').get(newProjectId);
      const membersList = db.prepare('SELECT * FROM project_members WHERE project_id = ?').all(newProjectId);

      res.status(201).json({
        success: true,
        message: approver_name
          ? `Project submitted successfully. Designated subject faculty ${approver_name} has been notified for review.`
          : 'Project submitted. Pending subject faculty assignment.',
        project: {
          ...createdProj,
          members: membersList
        }
      });
    } catch (err) {
      console.error('[Create Project Error]:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. List Projects (Role-based access)
  app.get('/api/projects', (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return res.status(401).json({ success: false, error: 'Authentication required.' });
      }

      let projects = [];
      if (currentUser.role === 'student') {
        // Students see projects they belong to or created
        projects = db.prepare(`
          SELECT p.*
          FROM group_projects p
          WHERE p.created_by = ?
             OR p.leader_id = ?
             OR p.id IN (SELECT project_id FROM project_members WHERE student_id = ?)
          ORDER BY p.created_at DESC
        `).all(currentUser.id, currentUser.id, currentUser.id);
      } else if (currentUser.role === 'faculty') {
        // Faculty see projects they are designated approver, mentor, or projects in subjects they are assigned to
        projects = db.prepare(`
          SELECT DISTINCT p.*
          FROM group_projects p
          WHERE p.approver_id = ?
             OR p.mentor_id = ?
             OR p.subject IN (SELECT subject FROM faculty_subject_assignments WHERE faculty_id = ?)
          ORDER BY p.created_at DESC
        `).all(currentUser.id, currentUser.id, currentUser.id);
      } else if (currentUser.role === 'officer') {
        // Officer sees all department projects
        projects = db.prepare(`
          SELECT * FROM group_projects ORDER BY created_at DESC
        `).all();
      }

      // Attach members and updates count for each project
      const getMembers = db.prepare('SELECT student_id, student_name, roll_no, email, role, status FROM project_members WHERE project_id = ?');
      const getUpdatesCount = db.prepare('SELECT COUNT(*) as count FROM project_updates WHERE project_id = ?');

      const enriched = projects.map(p => ({
        ...p,
        members: getMembers.all(p.id),
        updates_count: getUpdatesCount.get(p.id)?.count || 0
      }));

      res.json({ success: true, projects: enriched });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Get Project Details
  app.get('/api/projects/:id', (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return res.status(401).json({ success: false, error: 'Authentication required.' });
      }

      const { id } = req.params;
      const project = db.prepare('SELECT * FROM group_projects WHERE id = ?').get(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found.' });
      }

      // Authorization check
      const members = db.prepare('SELECT student_id, student_name, roll_no, email, role, status FROM project_members WHERE project_id = ?').all(id);
      const isMember = members.some(m => m.student_id === currentUser.id) || project.created_by === currentUser.id;
      const isFacultySupervisor = currentUser.role === 'faculty' && (
        project.approver_id === currentUser.id ||
        project.mentor_id === currentUser.id ||
        Boolean(db.prepare('SELECT id FROM faculty_subject_assignments WHERE faculty_id = ? AND subject = ?').get(currentUser.id, project.subject))
      );
      const isOfficer = currentUser.role === 'officer';

      if (!isMember && !isFacultySupervisor && !isOfficer) {
        return res.status(403).json({ success: false, error: 'Access denied: You are not authorized to view this project.' });
      }

      const updates = db.prepare('SELECT * FROM project_updates WHERE project_id = ? ORDER BY created_at DESC').all(id);

      res.json({
        success: true,
        project: {
          ...project,
          members,
          updates
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Resubmit / Update Proposal (Student leader/creator)
  app.put('/api/projects/:id', (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return res.status(401).json({ success: false, error: 'Authentication required.' });
      }

      const { id } = req.params;
      const project = db.prepare('SELECT * FROM group_projects WHERE id = ?').get(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found.' });
      }

      if (project.created_by !== currentUser.id && project.leader_id !== currentUser.id) {
        return res.status(403).json({ success: false, error: 'Only the project creator or team leader can edit or resubmit the proposal.' });
      }

      if (project.approval_status === 'Approved' || project.status === 'Completed') {
        return res.status(400).json({ success: false, error: 'Approved or completed projects cannot be modified through the proposal editor.' });
      }

      const {
        title,
        subject,
        domain,
        problem_statement,
        objectives,
        description,
        tech_stack,
        deliverables,
        target_date,
        proposal_doc_url,
        is_resubmitting = true
      } = req.body;

      const newSubject = (subject || project.subject).trim();
      const subjectAssignment = db.prepare("SELECT faculty_id, faculty_name FROM faculty_subject_assignments WHERE subject = ?").get(newSubject);

      const approver_id = subjectAssignment ? subjectAssignment.faculty_id : project.approver_id;
      const approver_name = subjectAssignment ? subjectAssignment.faculty_name : project.approver_name;

      const newStatus = is_resubmitting ? 'Pending Subject Faculty Approval' : project.status;
      const newApprovalStatus = is_resubmitting ? 'Pending' : project.approval_status;

      db.prepare(`
        UPDATE group_projects SET
          title = COALESCE(?, title),
          subject = ?,
          domain = COALESCE(?, domain),
          problem_statement = COALESCE(?, problem_statement),
          objectives = COALESCE(?, objectives),
          description = COALESCE(?, description),
          tech_stack = COALESCE(?, tech_stack),
          deliverables = COALESCE(?, deliverables),
          target_date = COALESCE(?, target_date),
          proposal_doc_url = COALESCE(?, proposal_doc_url),
          approver_id = ?,
          approver_name = ?,
          status = ?,
          approval_status = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        title?.trim() || null,
        newSubject,
        domain?.trim() || null,
        problem_statement?.trim() || null,
        objectives?.trim() || null,
        description?.trim() || null,
        tech_stack?.trim() || null,
        deliverables?.trim() || null,
        target_date || null,
        proposal_doc_url || null,
        approver_id,
        approver_name,
        newStatus,
        newApprovalStatus,
        id
      );

      // Re-notify faculty if resubmitted
      if (is_resubmitting && approver_id) {
        db.prepare(`
          INSERT INTO notifications (id, user_id, target_role, category, type, title, message, date, action_url)
          VALUES (?, ?, 'faculty', 'Projects', 'info', ?, ?, 'Just now', ?)
        `).run(
          'notif_' + Date.now().toString(36),
          approver_id,
          `Revised Project Proposal: ${title || project.title}`,
          `Team '${project.team_name}' submitted a revised proposal addressing feedback for ${newSubject}.`,
          '#/faculty/submissions'
        );
      }

      res.json({ success: true, message: 'Project proposal updated and resubmitted for faculty approval.' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Approve Project (Authorized Subject Faculty only)
  app.post('/api/projects/:id/approve', requireRole(['faculty']), (req, res) => {
    try {
      const { id } = req.params;
      const { feedback } = req.body;
      const facultyId = req.user.id;
      const facultyName = req.user.fullName || req.user.email;

      const project = db.prepare('SELECT * FROM group_projects WHERE id = ?').get(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found.' });
      }

      // Backend authorization: Must be the designated approver or assigned faculty for that subject!
      const isDesignatedApprover = project.approver_id === facultyId;
      const isSubjectFaculty = Boolean(db.prepare('SELECT id FROM faculty_subject_assignments WHERE faculty_id = ? AND subject = ?').get(facultyId, project.subject));

      if (!isDesignatedApprover && !isSubjectFaculty) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: You are not authorized to approve proposals for '${project.subject}'. Only the assigned subject faculty can approve this project.`
        });
      }

      const approveTx = db.transaction(() => {
        db.prepare(`
          UPDATE group_projects SET
            status = 'Development in Progress',
            approval_status = 'Approved',
            reviewed_by = ?,
            approver_id = ?,
            approver_name = ?,
            reviewed_at = datetime('now'),
            faculty_feedback = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(
          facultyId,
          facultyId,
          facultyName,
          feedback || 'Project proposal approved. Team may proceed to development.',
          id
        );

        // Notify all team members
        const members = db.prepare('SELECT student_id FROM project_members WHERE project_id = ?').all(id);
        const notifyStmt = db.prepare(`
          INSERT INTO notifications (id, user_id, target_role, category, type, title, message, date, action_url)
          VALUES (?, ?, 'student', 'Projects', 'success', ?, ?, 'Just now', ?)
        `);

        for (const m of members) {
          notifyStmt.run(
            'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
            m.student_id,
            `Project Approved: ${project.title}`,
            `Congratulations! ${facultyName} has approved your group project '${project.title}'. You may now submit milestone progress reports.`,
            '#/student/projects'
          );
        }

        // Audit log
        db.prepare(`
          INSERT INTO audit_logs (id, action, user_role, user_name, target, details)
          VALUES (?, 'PROJECT_APPROVED', 'faculty', ?, ?, ?)
        `).run(
          'aud_' + Date.now().toString(36),
          facultyName,
          id,
          `Subject faculty ${facultyName} approved group project '${project.title}' (${project.subject}).`
        );
      });

      approveTx();

      res.json({ success: true, message: `Project '${project.title}' approved successfully. Development workspace enabled.` });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Reject Project (Authorized Subject Faculty only, requires reason)
  app.post('/api/projects/:id/reject', requireRole(['faculty']), (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const facultyId = req.user.id;
      const facultyName = req.user.fullName || req.user.email;

      if (!reason || !reason.trim()) {
        return res.status(400).json({ success: false, error: 'Rejection reason is required.' });
      }

      const project = db.prepare('SELECT * FROM group_projects WHERE id = ?').get(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found.' });
      }

      const isDesignatedApprover = project.approver_id === facultyId;
      const isSubjectFaculty = Boolean(db.prepare('SELECT id FROM faculty_subject_assignments WHERE faculty_id = ? AND subject = ?').get(facultyId, project.subject));

      if (!isDesignatedApprover && !isSubjectFaculty) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: You are not authorized to evaluate proposals for '${project.subject}'.`
        });
      }

      const rejectTx = db.transaction(() => {
        db.prepare(`
          UPDATE group_projects SET
            status = 'Rejected',
            approval_status = 'Rejected',
            reviewed_by = ?,
            reviewed_at = datetime('now'),
            rejection_reason = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(facultyId, reason.trim(), id);

        // Notify team members
        const members = db.prepare('SELECT student_id FROM project_members WHERE project_id = ?').all(id);
        const notifyStmt = db.prepare(`
          INSERT INTO notifications (id, user_id, target_role, category, type, title, message, date, action_url)
          VALUES (?, ?, 'student', 'Projects', 'danger', ?, ?, 'Just now', ?)
        `);

        for (const m of members) {
          notifyStmt.run(
            'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
            m.student_id,
            `Project Rejected: ${project.title}`,
            `Proposal was not approved by ${facultyName}. Reason: ${reason.trim()}`,
            '#/student/projects'
          );
        }
      });

      rejectTx();
      res.json({ success: true, message: `Project proposal rejected.` });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. Request Changes (Authorized Subject Faculty only, requires feedback)
  app.post('/api/projects/:id/request-changes', requireRole(['faculty']), (req, res) => {
    try {
      const { id } = req.params;
      const { feedback } = req.body;
      const facultyId = req.user.id;
      const facultyName = req.user.fullName || req.user.email;

      if (!feedback || !feedback.trim()) {
        return res.status(400).json({ success: false, error: 'Feedback detailing requested changes is required.' });
      }

      const project = db.prepare('SELECT * FROM group_projects WHERE id = ?').get(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found.' });
      }

      const isDesignatedApprover = project.approver_id === facultyId;
      const isSubjectFaculty = Boolean(db.prepare('SELECT id FROM faculty_subject_assignments WHERE faculty_id = ? AND subject = ?').get(facultyId, project.subject));

      if (!isDesignatedApprover && !isSubjectFaculty) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: You are not authorized to evaluate proposals for '${project.subject}'.`
        });
      }

      const changesTx = db.transaction(() => {
        db.prepare(`
          UPDATE group_projects SET
            status = 'Changes Requested',
            approval_status = 'Changes Requested',
            reviewed_by = ?,
            reviewed_at = datetime('now'),
            faculty_feedback = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(facultyId, feedback.trim(), id);

        const members = db.prepare('SELECT student_id FROM project_members WHERE project_id = ?').all(id);
        const notifyStmt = db.prepare(`
          INSERT INTO notifications (id, user_id, target_role, category, type, title, message, date, action_url)
          VALUES (?, ?, 'student', 'Projects', 'warning', ?, ?, 'Just now', ?)
        `);

        for (const m of members) {
          notifyStmt.run(
            'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
            m.student_id,
            `Changes Requested: ${project.title}`,
            `${facultyName} requested revisions to your project proposal: "${feedback.trim()}"`,
            '#/student/projects'
          );
        }
      });

      changesTx();
      res.json({ success: true, message: 'Feedback sent. Project status set to Changes Requested.' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10. Submit Development Update (Team members only)
  app.post('/api/projects/:id/updates', (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return res.status(401).json({ success: false, error: 'Authentication required.' });
      }

      const { id } = req.params;
      const project = db.prepare('SELECT * FROM group_projects WHERE id = ?').get(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found.' });
      }

      // Check membership
      const isMember = Boolean(db.prepare('SELECT id FROM project_members WHERE project_id = ? AND student_id = ?').get(id, currentUser.id)) || project.created_by === currentUser.id;
      if (!isMember) {
        return res.status(403).json({ success: false, error: 'Forbidden: Only confirmed team members can submit development updates.' });
      }

      // Project must be approved
      if (project.approval_status !== 'Approved' && project.status !== 'Development in Progress') {
        return res.status(400).json({
          success: false,
          error: `Cannot submit development updates while project status is '${project.status}'. Only approved projects can record development updates.`
        });
      }

      const {
        stage_milestone,
        progress_pct,
        summary,
        tasks_completed,
        tasks_remaining,
        challenges_blockers,
        next_steps,
        github_url,
        attachments_url
      } = req.body;

      if (!summary || !summary.trim()) {
        return res.status(400).json({ success: false, error: 'Update summary is required.' });
      }

      const pct = Number(progress_pct);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        return res.status(400).json({ success: false, error: 'Progress percentage must be a number between 0 and 100.' });
      }

      // Completion check: student cannot self-mark completed without faculty evaluation
      const newStatus = pct === 100 ? (project.status === 'Completed' ? 'Completed' : 'Development in Progress') : 'Development in Progress';

      const updateId = 'prup_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

      const updateTx = db.transaction(() => {
        db.prepare(`
          INSERT INTO project_updates (
            id, project_id, author_id, author_name, stage_milestone,
            progress_pct, summary, tasks_completed, tasks_remaining,
            challenges_blockers, next_steps, github_url, attachments_url, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          updateId,
          id,
          currentUser.id,
          currentUser.fullName || currentUser.email,
          stage_milestone || project.current_milestone,
          pct,
          summary.trim(),
          tasks_completed?.trim() || null,
          tasks_remaining?.trim() || null,
          challenges_blockers?.trim() || null,
          next_steps?.trim() || null,
          github_url?.trim() || project.github_url,
          attachments_url || null,
          nowStr
        );

        db.prepare(`
          UPDATE group_projects SET
            progress_pct = ?,
            current_milestone = COALESCE(?, current_milestone),
            github_url = COALESCE(?, github_url),
            status = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(
          pct,
          stage_milestone || null,
          github_url?.trim() || null,
          newStatus,
          id
        );

        // Notify faculty supervisor
        if (project.approver_id) {
          db.prepare(`
            INSERT INTO notifications (id, user_id, target_role, category, type, title, message, date, action_url)
            VALUES (?, ?, 'faculty', 'Projects', 'info', ?, ?, 'Just now', ?)
          `).run(
            'notif_' + Date.now().toString(36),
            project.approver_id,
            `Milestone Update: ${project.title}`,
            `${currentUser.fullName} submitted a development report for milestone: ${stage_milestone || project.current_milestone} (${pct}% complete).`,
            '#/faculty/submissions'
          );
        }
      });

      updateTx();

      res.status(201).json({
        success: true,
        message: 'Development update recorded successfully.',
        update_id: updateId
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 11. Faculty Supervision Feedback
  app.post('/api/projects/:id/feedback', requireRole(['faculty']), (req, res) => {
    try {
      const { id } = req.params;
      const { feedback, update_id } = req.body;
      const facultyId = req.user.id;
      const facultyName = req.user.fullName || req.user.email;

      if (!feedback || !feedback.trim()) {
        return res.status(400).json({ success: false, error: 'Supervision feedback cannot be empty.' });
      }

      const project = db.prepare('SELECT * FROM group_projects WHERE id = ?').get(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found.' });
      }

      const isSupervisor = project.approver_id === facultyId || project.mentor_id === facultyId ||
        Boolean(db.prepare('SELECT id FROM faculty_subject_assignments WHERE faculty_id = ? AND subject = ?').get(facultyId, project.subject));

      if (!isSupervisor) {
        return res.status(403).json({ success: false, error: 'Forbidden: You are not authorized to supervise this project.' });
      }

      const fbTx = db.transaction(() => {
        db.prepare(`
          UPDATE group_projects SET
            faculty_feedback = ?,
            reviewed_by = ?,
            reviewed_at = datetime('now'),
            updated_at = datetime('now')
          WHERE id = ?
        `).run(feedback.trim(), facultyId, id);

        if (update_id) {
          db.prepare(`
            UPDATE project_updates SET
              faculty_feedback = ?,
              faculty_id = ?,
              faculty_name = ?,
              reviewed_at = datetime('now')
            WHERE id = ? AND project_id = ?
          `).run(feedback.trim(), facultyId, facultyName, update_id, id);
        }

        // Notify team members
        const members = db.prepare('SELECT student_id FROM project_members WHERE project_id = ?').all(id);
        const notifyStmt = db.prepare(`
          INSERT INTO notifications (id, user_id, target_role, category, type, title, message, date, action_url)
          VALUES (?, ?, 'student', 'Projects', 'info', ?, ?, 'Just now', ?)
        `);

        for (const m of members) {
          notifyStmt.run(
            'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
            m.student_id,
            `Supervisor Feedback: ${project.title}`,
            `${facultyName} provided guidance: "${feedback.trim()}"`,
            '#/student/projects'
          );
        }
      });

      fbTx();
      res.json({ success: true, message: 'Supervision feedback submitted to student team.' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 12. Final Evaluation & Completion
  app.post('/api/projects/:id/grade', requireRole(['faculty']), (req, res) => {
    try {
      const { id } = req.params;
      const { final_grade, evaluation_notes } = req.body;
      const facultyId = req.user.id;
      const facultyName = req.user.fullName || req.user.email;

      if (!final_grade || !final_grade.trim()) {
        return res.status(400).json({ success: false, error: 'Final grade / evaluation mark is required.' });
      }

      const project = db.prepare('SELECT * FROM group_projects WHERE id = ?').get(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found.' });
      }

      const isSupervisor = project.approver_id === facultyId || project.mentor_id === facultyId ||
        Boolean(db.prepare('SELECT id FROM faculty_subject_assignments WHERE faculty_id = ? AND subject = ?').get(facultyId, project.subject));

      if (!isSupervisor) {
        return res.status(403).json({ success: false, error: 'Forbidden: You are not authorized to grade this project.' });
      }

      const gradeTx = db.transaction(() => {
        db.prepare(`
          UPDATE group_projects SET
            final_grade = ?,
            final_evaluation_notes = ?,
            status = 'Completed',
            progress_pct = 100,
            reviewed_by = ?,
            reviewed_at = datetime('now'),
            updated_at = datetime('now')
          WHERE id = ?
        `).run(
          final_grade.trim(),
          evaluation_notes?.trim() || null,
          facultyId,
          id
        );

        // Notify team
        const members = db.prepare('SELECT student_id FROM project_members WHERE project_id = ?').all(id);
        const notifyStmt = db.prepare(`
          INSERT INTO notifications (id, user_id, target_role, category, type, title, message, date, action_url)
          VALUES (?, ?, 'student', 'Projects', 'success', ?, ?, 'Just now', ?)
        `);

        for (const m of members) {
          notifyStmt.run(
            'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
            m.student_id,
            `Project Completed & Graded: ${project.title}`,
            `Final evaluation completed by ${facultyName}. Grade: ${final_grade.trim()}`,
            '#/student/projects'
          );
        }
      });

      gradeTx();
      res.json({ success: true, message: `Project evaluated and marked Completed with grade ${final_grade.trim()}.` });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}

module.exports = { registerProjectRoutes };
