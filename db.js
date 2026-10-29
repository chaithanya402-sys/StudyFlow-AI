const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'studyflow.db');
const db = new Database(DB_PATH);

// Enable WAL mode and foreign key enforcement
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    -- 1. Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'faculty', 'officer')),
      full_name TEXT NOT NULL,
      roll_no TEXT,
      department TEXT DEFAULT 'CSE',
      phone TEXT,
      avatar TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

    -- 2. Sessions Table
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

    -- 3. Student Profiles Table
    CREATE TABLE IF NOT EXISTS student_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      college TEXT,
      degree TEXT DEFAULT 'B.Tech',
      branch TEXT DEFAULT 'Computer Science & Engineering',
      specialization TEXT DEFAULT 'CSE (AI & ML)',
      semester TEXT DEFAULT '7th Semester',
      current_year TEXT DEFAULT '3rd Year (Current)',
      admission_year INTEGER DEFAULT 2022,
      grad_year INTEGER DEFAULT 2026,
      city TEXT DEFAULT 'Hyderabad',
      state TEXT DEFAULT 'Telangana',
      cgpa REAL DEFAULT NULL,
      tenth_pct REAL DEFAULT NULL,
      tenth_year INTEGER DEFAULT NULL,
      tenth_board TEXT DEFAULT NULL,
      tenth_school TEXT,
      twelfth_pct REAL DEFAULT NULL,
      twelfth_year INTEGER DEFAULT NULL,
      twelfth_board TEXT DEFAULT NULL,
      twelfth_college TEXT,
      twelfth_stream TEXT DEFAULT NULL,
      backlogs INTEGER DEFAULT 0,
      historical_backlogs INTEGER DEFAULT 0,
      affiliation TEXT DEFAULT 'JNTUK',
      aptitude_score INTEGER DEFAULT NULL,
      technical_score INTEGER DEFAULT NULL,
      resume_score INTEGER DEFAULT NULL,
      placement_probability INTEGER DEFAULT NULL,
      prediction_status TEXT DEFAULT 'Pending Setup',
      placement_status TEXT DEFAULT 'In Process',
      placed_company TEXT,
      placed_package REAL,
      mentor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      mentor_name TEXT DEFAULT NULL,
      skills_json TEXT DEFAULT '[]',
      internships_json TEXT DEFAULT '[]',
      work_exp_json TEXT DEFAULT '[]',
      projects_json TEXT DEFAULT '[]',
      certifications_json TEXT DEFAULT '[]',
      recent_activities_json TEXT DEFAULT '[]',
      resume_json TEXT DEFAULT '{}',
      academic_profile_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 4. Assignments Table (All categories: faculty, lab, learning, practice, group_projects)
    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, -- 'faculty', 'lab', 'learning', 'practice', 'group_projects'
      title TEXT NOT NULL,
      subject TEXT,
      category TEXT,
      professor TEXT,
      department TEXT DEFAULT 'Computer Science & Engineering',
      target_class TEXT,
      description TEXT,
      instructions TEXT,
      due_date TEXT,
      due_time TEXT DEFAULT '23:59',
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Published',
      max_marks REAL DEFAULT 50,
      marks TEXT,
      feedback TEXT,
      student_status TEXT DEFAULT 'Assigned',
      student_marks REAL,
      submission_url TEXT,
      submitted_date TEXT,
      student_remarks TEXT,
      strengths TEXT,
      improvements TEXT,
      next_steps TEXT,
      is_revision_requested INTEGER DEFAULT 0,
      graded_date TEXT,
      meta_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_assignments_type ON assignments(type);
    CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

    -- 5. Submissions Table
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      assignment_type TEXT NOT NULL,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_name TEXT NOT NULL,
      roll_no TEXT,
      submitted_date TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT DEFAULT 'Submitted',
      is_late INTEGER DEFAULT 0,
      file_url TEXT,
      file_name TEXT,
      file_size INTEGER DEFAULT 0,
      remarks TEXT,
      marks REAL,
      feedback TEXT,
      strengths TEXT,
      improvements TEXT,
      next_steps TEXT,
      is_revision_requested INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1,
      graded_date TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(assignment_id, student_id)
    );
    CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);

    -- 6. Mentor Tasks Table
    CREATE TABLE IF NOT EXISTS mentor_tasks (
      id TEXT PRIMARY KEY,
      mentor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      due_date TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Completed')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_mentor_tasks_student ON mentor_tasks(student_id);
    CREATE INDEX IF NOT EXISTS idx_mentor_tasks_mentor ON mentor_tasks(mentor_id);

    -- 7. Mentor Notes Table
    CREATE TABLE IF NOT EXISTS mentor_notes (
      id TEXT PRIMARY KEY,
      mentor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_name TEXT,
      date TEXT NOT NULL,
      topic TEXT NOT NULL,
      notes TEXT,
      recommendations TEXT,
      next_meeting TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_mentor_notes_student ON mentor_notes(student_id);

    -- 8. Faculty Interventions Table
    CREATE TABLE IF NOT EXISTS faculty_interventions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_name TEXT NOT NULL,
      roll_no TEXT,
      mentor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      mentor_name TEXT,
      date TEXT NOT NULL,
      risk_level TEXT DEFAULT 'High Risk',
      action_type TEXT NOT NULL,
      status TEXT DEFAULT 'Under Review',
      notes TEXT,
      follow_up_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_interventions_student ON faculty_interventions(student_id);

    -- 9. Placement Drives Table
    CREATE TABLE IF NOT EXISTS placement_drives (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      role_title TEXT NOT NULL,
      package_lpa REAL NOT NULL,
      min_cgpa REAL DEFAULT 6.5,
      max_backlogs INTEGER DEFAULT 0,
      allowed_branches_json TEXT DEFAULT '["CSE", "IT"]',
      deadline TEXT NOT NULL,
      openings INTEGER DEFAULT 10,
      status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Upcoming', 'Closed')),
      location TEXT,
      drive_date TEXT,
      created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 10. Drive Applications Table
    CREATE TABLE IF NOT EXISTS drive_applications (
      id TEXT PRIMARY KEY,
      drive_id TEXT NOT NULL REFERENCES placement_drives(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_name TEXT NOT NULL,
      roll_no TEXT,
      branch TEXT DEFAULT 'CSE',
      cgpa REAL DEFAULT NULL,
      status TEXT DEFAULT 'Applied' CHECK(status IN ('Applied', 'Shortlisted', 'Interview Scheduled', 'Offered', 'Rejected')),
      applied_date TEXT NOT NULL DEFAULT (datetime('now')),
      notes TEXT,
      UNIQUE(drive_id, student_id)
    );
    CREATE INDEX IF NOT EXISTS idx_applications_drive ON drive_applications(drive_id);
    CREATE INDEX IF NOT EXISTS idx_applications_student ON drive_applications(student_id);

    -- 11. Notifications Table
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      target_role TEXT DEFAULT 'all',
      category TEXT DEFAULT 'System',
      type TEXT DEFAULT 'info',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      date TEXT,
      read INTEGER DEFAULT 0,
      action_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_role ON notifications(target_role);

    -- 12. Audit Logs Table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      user_role TEXT,
      user_name TEXT,
      target TEXT,
      details TEXT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 13. ML Predictions Table
    CREATE TABLE IF NOT EXISTS ml_predictions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      model_name TEXT NOT NULL,
      model_version TEXT NOT NULL,
      predicted_score REAL NOT NULL,
      predicted_grade TEXT NOT NULL,
      confidence_min REAL,
      confidence_max REAL,
      mae REAL,
      rmse REAL,
      r2_score REAL,
      inputs_json TEXT NOT NULL,
      contributions_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_predictions_student ON ml_predictions(student_id);

    -- 14. Student Marksheets Table
    CREATE TABLE IF NOT EXISTS student_marksheets (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      semester TEXT NOT NULL,
      academic_year TEXT,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      mime_type TEXT,
      status TEXT DEFAULT 'Verified',
      extracted_marks_json TEXT DEFAULT '[]',
      verified_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_marksheets_student ON student_marksheets(student_id);

    -- 15. Student Subject Marks Table
    CREATE TABLE IF NOT EXISTS student_subject_marks (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      semester TEXT NOT NULL,
      subject_code TEXT,
      subject_name TEXT NOT NULL,
      marks_obtained REAL NOT NULL,
      max_marks REAL NOT NULL DEFAULT 100,
      grade TEXT,
      credits REAL DEFAULT 3.0,
      is_verified INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_subject_marks_student ON student_subject_marks(student_id);

    -- 16. Student Attendance Records Table
    CREATE TABLE IF NOT EXISTS student_attendance_records (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      semester TEXT NOT NULL,
      subject_name TEXT,
      classes_attended INTEGER NOT NULL,
      classes_conducted INTEGER NOT NULL,
      attendance_pct REAL NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_attendance_student ON student_attendance_records(student_id);

    -- 17. Student Assessment Records Table
    CREATE TABLE IF NOT EXISTS student_assessment_records (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      semester TEXT NOT NULL,
      assessment_type TEXT NOT NULL,
      title TEXT NOT NULL,
      marks_obtained REAL NOT NULL,
      max_marks REAL NOT NULL DEFAULT 100,
      date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_assessment_student ON student_assessment_records(student_id);

    -- 18. Faculty Subject Assignments Table
    CREATE TABLE IF NOT EXISTS faculty_subject_assignments (
      id TEXT PRIMARY KEY,
      faculty_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      faculty_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      department TEXT DEFAULT 'Computer Science & Engineering',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(faculty_id, subject)
    );
    CREATE INDEX IF NOT EXISTS idx_fac_subj_faculty ON faculty_subject_assignments(faculty_id);
    CREATE INDEX IF NOT EXISTS idx_fac_subj_subject ON faculty_subject_assignments(subject);

    -- 19. Group Projects Table
    CREATE TABLE IF NOT EXISTS group_projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      domain TEXT NOT NULL,
      problem_statement TEXT NOT NULL,
      objectives TEXT NOT NULL,
      description TEXT NOT NULL,
      tech_stack TEXT NOT NULL,
      deliverables TEXT NOT NULL,
      start_date TEXT,
      target_date TEXT,
      proposal_doc_url TEXT,
      team_name TEXT NOT NULL,
      leader_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      leader_name TEXT NOT NULL,
      created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      mentor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      mentor_name TEXT,
      mentor_status TEXT DEFAULT 'Pending' CHECK(mentor_status IN ('Pending', 'Confirmed', 'Not Assigned')),
      approver_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      approver_name TEXT,
      status TEXT NOT NULL DEFAULT 'Submitted for Approval' CHECK(status IN ('Draft', 'Submitted for Approval', 'Pending Subject Faculty Approval', 'Approved', 'Changes Requested', 'Rejected', 'Development in Progress', 'Completed')),
      approval_status TEXT NOT NULL DEFAULT 'Pending' CHECK(approval_status IN ('Pending', 'Approved', 'Rejected', 'Changes Requested')),
      faculty_feedback TEXT,
      rejection_reason TEXT,
      reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      reviewed_at TEXT,
      progress_pct INTEGER DEFAULT 0 CHECK(progress_pct >= 0 AND progress_pct <= 100),
      current_milestone TEXT DEFAULT '1. Problem definition and requirements',
      github_url TEXT,
      final_grade TEXT,
      final_evaluation_notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_group_projects_status ON group_projects(status);
    CREATE INDEX IF NOT EXISTS idx_group_projects_subject ON group_projects(subject);
    CREATE INDEX IF NOT EXISTS idx_group_projects_leader ON group_projects(leader_id);
    CREATE INDEX IF NOT EXISTS idx_group_projects_approver ON group_projects(approver_id);

    -- 20. Project Team Members Table
    CREATE TABLE IF NOT EXISTS project_members (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES group_projects(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_name TEXT NOT NULL,
      roll_no TEXT,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Member' CHECK(role IN ('Leader', 'Member')),
      status TEXT NOT NULL DEFAULT 'Confirmed' CHECK(status IN ('Confirmed', 'Invited', 'Declined')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(project_id, student_id)
    );
    CREATE INDEX IF NOT EXISTS idx_project_members_proj ON project_members(project_id);
    CREATE INDEX IF NOT EXISTS idx_project_members_student ON project_members(student_id);

    -- 21. Project Development Updates & Milestones Table
    CREATE TABLE IF NOT EXISTS project_updates (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES group_projects(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      stage_milestone TEXT NOT NULL,
      progress_pct INTEGER NOT NULL CHECK(progress_pct >= 0 AND progress_pct <= 100),
      summary TEXT NOT NULL,
      tasks_completed TEXT,
      tasks_remaining TEXT,
      challenges_blockers TEXT,
      next_steps TEXT,
      github_url TEXT,
      attachments_url TEXT,
      faculty_feedback TEXT,
      faculty_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      faculty_name TEXT,
      reviewed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_project_updates_proj ON project_updates(project_id);

    -- 22. ML Prediction Log Table (for monitoring and audit trail)
    CREATE TABLE IF NOT EXISTS ml_prediction_log (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      prediction_type TEXT NOT NULL CHECK(prediction_type IN ('exam_score', 'placement_outcome')),
      inputs_json TEXT NOT NULL,
      output_json TEXT NOT NULL,
      model_version TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      metadata_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_ml_prediction_log_student ON ml_prediction_log(student_id);
    CREATE INDEX IF NOT EXISTS idx_ml_prediction_log_timestamp ON ml_prediction_log(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_ml_prediction_log_type ON ml_prediction_log(prediction_type);
  `);

  // Safe runtime column migrations for student_profiles
  const existingCols = db.prepare('PRAGMA table_info(student_profiles)').all().map(c => c.name);
  const newCols = [
    { name: 'institution', def: 'TEXT DEFAULT NULL' },
    { name: 'prev_year_cgpa', def: 'REAL DEFAULT NULL' },
    { name: 'marks_average', def: 'REAL DEFAULT NULL' },
    { name: 'attendance_pct', def: 'REAL DEFAULT NULL' },
    { name: 'classes_attended', def: 'INTEGER DEFAULT NULL' },
    { name: 'classes_conducted', def: 'INTEGER DEFAULT NULL' },
    { name: 'quiz_avg', def: 'REAL DEFAULT NULL' },
    { name: 'internal_avg', def: 'REAL DEFAULT NULL' },
    { name: 'technical_skills_json', def: "TEXT DEFAULT '[]'" },
    { name: 'communication_skills_json', def: "TEXT DEFAULT '[]'" },
    { name: 'verified_report_card', def: 'TEXT DEFAULT NULL' },
    { name: 'is_profile_complete', def: 'INTEGER DEFAULT 0' }
  ];

  for (const col of newCols) {
    if (!existingCols.includes(col.name)) {
      try {
        db.exec(`ALTER TABLE student_profiles ADD COLUMN ${col.name} ${col.def}`);
      } catch (e) {
        // Column may already exist
      }
    }
  }

  // Assignment cohort targeting. Keep the legacy target_class value and infer a
  // year where possible so existing records remain usable after migration.
  const assignmentCols = db.prepare('PRAGMA table_info(assignments)').all().map(c => c.name);
  for (const col of [
    { name: 'target_year', def: 'TEXT DEFAULT NULL' },
    { name: 'created_by', def: 'TEXT DEFAULT NULL' },
    { name: 'attachments_json', def: "TEXT NOT NULL DEFAULT '[]'" }
  ]) {
    if (!assignmentCols.includes(col.name)) {
      try { db.exec(`ALTER TABLE assignments ADD COLUMN ${col.name} ${col.def}`); } catch (e) {}
    }
  }
  db.exec(`
    UPDATE assignments SET target_year = CASE
      WHEN LOWER(target_class) LIKE '%first year%' OR LOWER(target_class) LIKE '%1st year%' THEN '1st Year'
      WHEN LOWER(target_class) LIKE '%second year%' OR LOWER(target_class) LIKE '%2nd year%' THEN '2nd Year'
      WHEN LOWER(target_class) LIKE '%third year%' OR LOWER(target_class) LIKE '%3rd year%' THEN '3rd Year'
      WHEN LOWER(target_class) LIKE '%fourth year%' OR LOWER(target_class) LIKE '%4th year%' OR LOWER(target_class) LIKE '%final year%' THEN '4th Year'
      ELSE target_year END
    WHERE target_year IS NULL
  `);

  // Safe runtime column migration for submissions
  const existingSubCols = db.prepare('PRAGMA table_info(submissions)').all().map(c => c.name);
  if (!existingSubCols.includes('updated_at')) {
    try {
      db.exec("ALTER TABLE submissions ADD COLUMN updated_at TEXT DEFAULT NULL");
      db.exec("UPDATE submissions SET updated_at = submitted_date WHERE updated_at IS NULL");
    } catch (e) {}
  }

  // Ensure assignments table stores clean template data without leaking specific student submissions
  try {
    db.exec(`
      UPDATE assignments SET
        student_status = 'Assigned',
        student_marks = NULL,
        submission_url = NULL,
        submitted_date = NULL,
        student_remarks = NULL
      WHERE student_status != 'Assigned' OR submission_url IS NOT NULL OR student_remarks IS NOT NULL;
    `);
  } catch (e) {}

  // Ensure standard Faculty accounts and subject assignments are seeded
  ensureFacultySubjectAssignments();
}

function ensureFacultySubjectAssignments() {
  // Ensure faculty fac_001 exists
  const fac1 = db.prepare('SELECT id FROM users WHERE id = ?').get('fac_001');
  if (!fac1) {
    const facHash = bcrypt.hashSync('mentor2026', 10);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, role, full_name, roll_no, department, phone, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('fac_001', 'dr.rajesh.mentor@college.edu', facHash, 'faculty', 'Dr. Rajesh Sharma', 'FAC-CSE-001', 'Computer Science & Engineering', '+91 98111 22334', 'RS');
  }

  // Ensure faculty fac_002 exists for multi-faculty subject authorization testing
  const fac2 = db.prepare('SELECT id FROM users WHERE id = ?').get('fac_002');
  if (!fac2) {
    const facHash2 = bcrypt.hashSync('mentor2026', 10);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, role, full_name, roll_no, department, phone, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('fac_002', 'anita.rao@college.edu', facHash2, 'faculty', 'Prof. Anita Rao', 'FAC-CSE-002', 'Computer Science & Engineering', '+91 98111 55667', 'AR');
  }

  // Ensure T&P Officer tpo_001 exists
  const tpo1 = db.prepare('SELECT id FROM users WHERE id = ? OR role = ?').get('tpo_001', 'officer');
  if (!tpo1) {
    const tpoHash = bcrypt.hashSync('placement2026', 10);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, role, full_name, roll_no, department, phone, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('tpo_001', 'placement.cell@college.edu', tpoHash, 'officer', 'Prof. S. K. Nair', 'TPO-HEAD-01', 'Training & Placement Cell', '+91 98222 33445', 'SN');
  }

  const insertAssignment = db.prepare(`
    INSERT OR IGNORE INTO faculty_subject_assignments (id, faculty_id, faculty_name, subject, department)
    VALUES (?, ?, ?, ?, ?)
  `);

  // fac_001 authorized subjects
  insertAssignment.run('fsa_1', 'fac_001', 'Dr. Rajesh Sharma', 'Machine Learning & AI', 'Computer Science & Engineering');
  insertAssignment.run('fsa_2', 'fac_001', 'Dr. Rajesh Sharma', 'Distributed Systems & Cloud Computing', 'Computer Science & Engineering');
  insertAssignment.run('fsa_3', 'fac_001', 'Dr. Rajesh Sharma', 'Data Structures & Algorithms', 'Computer Science & Engineering');

  // fac_002 authorized subjects
  insertAssignment.run('fsa_4', 'fac_002', 'Prof. Anita Rao', 'Database Management Systems', 'Computer Science & Engineering');
  insertAssignment.run('fsa_5', 'fac_002', 'Prof. Anita Rao', 'Web & Mobile Technologies', 'Computer Science & Engineering');
  insertAssignment.run('fsa_6', 'fac_002', 'Prof. Anita Rao', 'Cybersecurity & Cryptography', 'Computer Science & Engineering');
}

// Seed data from records.json and default initial dataset
function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    return; // Already initialized
  }

  console.log('[SQLite DB] Empty database detected. Seeding verified accounts and core data...');

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, role, full_name, roll_no, department, phone, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    // 1. Seed Administrative Accounts (Faculty Mentor & T&P Officer)
    // Faculty: dr.rajesh.mentor@college.edu / mentor2026
    const facHash = bcrypt.hashSync('mentor2026', 10);
    insertUser.run(
      'fac_001',
      'dr.rajesh.mentor@college.edu',
      facHash,
      'faculty',
      'Dr. Rajesh Sharma',
      'FAC-CSE-001',
      'Computer Science & Engineering',
      '+91 98111 22334',
      'RS'
    );

    // Officer: placement.cell@college.edu / placement2026
    const tpoHash = bcrypt.hashSync('placement2026', 10);
    insertUser.run(
      'tpo_001',
      'placement.cell@college.edu',
      tpoHash,
      'officer',
      'Prof. S. K. Nair',
      'TPO-HEAD-01',
      'Training & Placement Cell',
      '+91 98222 33445',
      'SN'
    );

    // NOTE: All default/mock student accounts (Aditya Verma & cohort) have been removed.
    // New students register through /api/auth/register with clean, empty academic profiles.

    // 2. Seed Assignment Coursework Templates from records.json (Clean unsubmitted state)
    const recordsPath = path.join(DATA_DIR, 'records.json');
    let loadedRecords = null;
    try {
      if (fs.existsSync(recordsPath)) {
        loadedRecords = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
      }
    } catch (e) {
      console.warn('[SQLite DB] Could not read records.json, falling back to clean state.', e);
    }

    const insertAssignment = db.prepare(`
      INSERT OR REPLACE INTO assignments (
        id, type, title, subject, category, professor, department, target_class,
        description, instructions, due_date, due_time, priority, status,
        max_marks, marks, feedback, student_status, student_marks,
        submission_url, submitted_date, student_remarks, strengths,
        improvements, next_steps, is_revision_requested, graded_date, meta_json
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);

    if (loadedRecords) {
      for (const [type, list] of Object.entries(loadedRecords)) {
        if (!Array.isArray(list)) continue;
        for (const item of list) {
          insertAssignment.run(
            item.id,
            type,
            item.title || 'Assignment',
            item.subject || '',
            item.category || '',
            item.professor || 'Dr. Rajesh Sharma',
            item.department || 'Computer Science & Engineering',
            item.targetClass || '',
            item.description || '',
            item.instructions || '',
            item.dueDate || '2026-10-30',
            item.dueTime || '23:59',
            item.priority || 'Medium',
            item.status || 'Published',
            item.maxMarks || 50,
            null,
            '',
            'Assigned',
            null,
            null,
            null,
            '',
            '',
            '',
            '',
            0,
            null,
            JSON.stringify({ ...item, submissions: [] })
          );
        }
      }
    }

    // 3. Seed Placement Drives (Real opportunities open for verified applicants)
    const insertDrive = db.prepare(`
      INSERT INTO placement_drives (id, company_name, role_title, package_lpa, min_cgpa, max_backlogs, allowed_branches_json, deadline, openings, status, location, drive_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const initialDrives = [
      { id: 'drv_001', company: 'Google India', role: 'Software Engineer (Campus 2026)', pkg: 32.5, minCgpa: 8.0, backlogs: 0, branches: ['CSE', 'IT'], deadline: '2026-11-05', openings: 15, status: 'Active', loc: 'Hyderabad / Bengaluru', driveDate: '2026-11-12', createdBy: 'tpo_001' },
      { id: 'drv_002', company: 'Microsoft', role: 'Software Development Engineer', pkg: 28.0, minCgpa: 7.5, backlogs: 0, branches: ['CSE', 'IT', 'ECE'], deadline: '2026-11-10', openings: 20, status: 'Active', loc: 'Hyderabad', driveDate: '2026-11-18', createdBy: 'tpo_001' },
      { id: 'drv_003', company: 'Cisco Systems', role: 'Technical Consulting Engineer', pkg: 14.5, minCgpa: 7.0, backlogs: 0, branches: ['CSE', 'IT', 'ECE'], deadline: '2026-10-29', openings: 25, status: 'Active', loc: 'Bengaluru', driveDate: '2026-11-04', createdBy: 'tpo_001' },
      { id: 'drv_004', company: 'TCS Digital', role: 'Systems Engineer', pkg: 7.5, minCgpa: 6.5, backlogs: 0, branches: ['All Branches'], deadline: '2026-10-20', openings: 80, status: 'Closed', loc: 'Pan India', driveDate: '2026-10-24', createdBy: 'tpo_001' }
    ];
    for (const d of initialDrives) {
      insertDrive.run(d.id, d.company, d.role, d.pkg, d.minCgpa, d.backlogs, JSON.stringify(d.branches), d.deadline, d.openings, d.status, d.loc, d.driveDate, d.createdBy);
    }

    // 4. Seed Audit Log
    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (id, action, user_role, user_name, target, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertAudit.run('aud_001', 'SYSTEM_INITIALIZED', 'system', 'System Daemon', 'studyflow.db', 'SQLite database schema initialized with verified administrative staff and recruitment drives.');
  });

  tx();
  console.log('[SQLite DB] Core seed data populated successfully.');
}

// Initialize on require
initSchema();
seedInitialData();

module.exports = {
  db,
  initSchema,
  seedInitialData
};
