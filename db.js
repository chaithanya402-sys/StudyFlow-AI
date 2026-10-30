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

    -- 23. Academic Records Table
    CREATE TABLE IF NOT EXISTS academic_records (
      student_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      student_name TEXT,
      department TEXT,
      degree TEXT,
      current_semester TEXT,
      cgpa REAL,
      tenth_percentage REAL,
      twelfth_percentage REAL,
      active_backlogs INTEGER DEFAULT 0,
      previous_backlogs INTEGER DEFAULT 0,
      indicators_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 24. Student Skills Table
    CREATE TABLE IF NOT EXISTS student_skills (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      skill_name TEXT NOT NULL,
      category TEXT NOT NULL, -- 'programming', 'database', 'web', 'data_science'
      proficiency_level TEXT NOT NULL, -- 'Beginner', 'Intermediate', 'Advanced', 'Expert'
      years_experience REAL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_student_skills_student ON student_skills(student_id);

    -- 25. Student Internships Table
    CREATE TABLE IF NOT EXISTS student_internships (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      duration_months INTEGER DEFAULT 3,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      verified INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_student_internships_student ON student_internships(student_id);

    -- 26. Student Projects Table
    CREATE TABLE IF NOT EXISTS student_projects (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      technologies TEXT,
      project_url TEXT,
      duration TEXT,
      role TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_student_projects_student ON student_projects(student_id);

    -- 27. Aptitude Questions Table
    CREATE TABLE IF NOT EXISTS aptitude_questions (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL, -- 'Quantitative', 'Logical', 'Verbal'
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      explanation TEXT,
      difficulty TEXT DEFAULT 'Medium'
    );
    CREATE INDEX IF NOT EXISTS idx_aptitude_questions_cat ON aptitude_questions(category);

    -- 28. Aptitude Attempts Table
    CREATE TABLE IF NOT EXISTS aptitude_attempts (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      total_questions INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL,
      incorrect_answers INTEGER NOT NULL,
      score REAL NOT NULL,
      accuracy_percentage REAL NOT NULL,
      time_taken_seconds INTEGER NOT NULL,
      answers_json TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_aptitude_attempts_student ON aptitude_attempts(student_id);

    -- 29. Coding Questions Table
    CREATE TABLE IF NOT EXISTS coding_questions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      difficulty TEXT NOT NULL, -- 'Easy', 'Medium', 'Hard'
      language TEXT NOT NULL, -- 'Python', 'Java', 'C'
      description TEXT NOT NULL,
      sample_input TEXT,
      sample_output TEXT,
      starter_code_python TEXT,
      starter_code_java TEXT,
      starter_code_c TEXT,
      test_cases_json TEXT NOT NULL
    );

    -- 30. Coding Submissions Table
    CREATE TABLE IF NOT EXISTS coding_submissions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      question_id TEXT NOT NULL REFERENCES coding_questions(id) ON DELETE CASCADE,
      question_title TEXT,
      language TEXT NOT NULL,
      code TEXT NOT NULL,
      test_cases_passed INTEGER NOT NULL,
      test_cases_total INTEGER NOT NULL,
      score REAL NOT NULL,
      execution_time_ms INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_coding_submissions_student ON coding_submissions(student_id);

    -- 31. Placement Predictions Table
    CREATE TABLE IF NOT EXISTS placement_predictions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      placement_probability REAL NOT NULL,
      placement_status TEXT NOT NULL,
      academic_score REAL NOT NULL,
      profile_score REAL NOT NULL,
      aptitude_score REAL NOT NULL,
      coding_score REAL NOT NULL,
      contributions_json TEXT,
      factors_json TEXT,
      recommendations_json TEXT,
      model_used TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_placement_predictions_student ON placement_predictions(student_id);

    -- 32. Resume Records Table
    CREATE TABLE IF NOT EXISTS resume_records (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      file_name TEXT,
      file_url TEXT,
      ats_score REAL,
      extracted_skills_json TEXT,
      missing_skills_json TEXT,
      feedback_json TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_resume_records_student ON resume_records(student_id);
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

  // Ensure aptitude and coding assessment questions are seeded
  ensureAptitudeAndCodingQuestions();
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

function ensureAptitudeAndCodingQuestions() {
  const aptCount = db.prepare('SELECT COUNT(*) as count FROM aptitude_questions').get().count;
  if (aptCount === 0) {
    const insertApt = db.prepare(`
      INSERT INTO aptitude_questions (id, category, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const aptQuestions = [
      // Quantitative Aptitude
      {
        id: 'apt_q1', category: 'Quantitative',
        question: 'A train running at 54 km/hr takes 20 seconds to cross a platform 150 meters long. What is the length of the train?',
        a: '120 meters', b: '150 meters', c: '180 meters', d: '200 meters', correct: 'B',
        exp: 'Speed = 54 * (5/18) = 15 m/s. Total distance = Speed * Time = 15 * 20 = 300 m. Train length = 300 - 150 = 150 meters.',
        diff: 'Medium'
      },
      {
        id: 'apt_q2', category: 'Quantitative',
        question: 'A can complete a piece of work in 12 days and B can do it in 15 days. If they work together for 4 days, what fraction of the work is left unfinished?',
        a: '2/5', b: '3/5', c: '1/3', d: '4/5', correct: 'A',
        exp: 'Work per day = 1/12 + 1/15 = 9/60 = 3/20. In 4 days, work done = 4 * (3/20) = 3/5. Remaining work = 1 - 3/5 = 2/5.',
        diff: 'Easy'
      },
      {
        id: 'apt_q3', category: 'Quantitative',
        question: 'The average of 5 consecutive odd numbers is 61. What is the difference between the highest and lowest numbers?',
        a: '6', b: '8', c: '10', d: '12', correct: 'B',
        exp: 'For any 5 consecutive odd numbers (n, n+2, n+4, n+6, n+8), difference between highest and lowest is always 8.',
        diff: 'Easy'
      },
      {
        id: 'apt_q4', category: 'Quantitative',
        question: 'By selling an article for ₹720, a shopkeeper gains 20%. What was the cost price of the article?',
        a: '₹580', b: '₹600', c: '₹620', d: '₹640', correct: 'B',
        exp: 'CP = SP / (1 + Gain%) = 720 / 1.20 = ₹600.',
        diff: 'Easy'
      },
      {
        id: 'apt_q5', category: 'Quantitative',
        question: 'A sum invested at 10% compound interest per annum compounded annually amounts to ₹2,420 in 2 years. Find the principal sum.',
        a: '₹1,900', b: '₹2,000', c: '₹2,100', d: '₹2,200', correct: 'B',
        exp: 'Amount = P * (1 + 0.10)^2 = P * 1.21. So P = 2420 / 1.21 = ₹2,000.',
        diff: 'Medium'
      },
      // Logical Reasoning
      {
        id: 'apt_q6', category: 'Logical',
        question: 'Find the next term in the sequence: 3, 7, 15, 31, 63, ?',
        a: '125', b: '126', c: '127', d: '128', correct: 'C',
        exp: 'Each term is generated by (previous * 2) + 1. (63 * 2) + 1 = 127.',
        diff: 'Easy'
      },
      {
        id: 'apt_q7', category: 'Logical',
        question: 'In a certain code language, COMPUTER is written as RFUVQNPC. How is MEDICINE written in that code?',
        a: 'EOJDEJFM', b: 'EOJDJEFM', c: 'MFEJDJOE', d: 'EOJDJEMF', correct: 'B',
        exp: 'Reverse the word and shift each letter by +1, keeping first and last letter reversed positions.',
        diff: 'Medium'
      },
      {
        id: 'apt_q8', category: 'Logical',
        question: 'Pointing to a photograph, a woman says: "He is the son of the only daughter of the father of my brother." How is the boy related to the woman?',
        a: 'Son', b: 'Nephew', c: 'Brother', d: 'Cousin', correct: 'A',
        exp: 'Father of brother = woman\'s father. Only daughter of her father = the woman herself. Her son = the boy.',
        diff: 'Medium'
      },
      {
        id: 'apt_q9', category: 'Logical',
        question: 'Statements: All cats are dogs. Some dogs are birds. Conclusions: I. Some cats are birds. II. No cat is a bird.',
        a: 'Only I follows', b: 'Only II follows', c: 'Either I or II follows', d: 'Neither follows', correct: 'C',
        exp: 'Cats and birds form a complementary pair (Some and No). Hence Either I or II follows.',
        diff: 'Medium'
      },
      {
        id: 'apt_q10', category: 'Logical',
        question: 'Five colleagues A, B, C, D, E sit in a row facing north. C is to the right of B. D is between A and B. E is to the left of A. Who sits in the middle position?',
        a: 'A', b: 'B', c: 'C', d: 'D', correct: 'D',
        exp: 'The order from left to right is E, A, D, B, C. The middle person is D.',
        diff: 'Easy'
      },
      // Verbal Ability
      {
        id: 'apt_q11', category: 'Verbal',
        question: 'Select the word which is most nearly OPPOSITE in meaning to EPHEMERAL:',
        a: 'Transient', b: 'Permanent', c: 'Brief', d: 'Fleeting', correct: 'B',
        exp: 'Ephemeral means lasting for a very short time. Its opposite is Permanent.',
        diff: 'Easy'
      },
      {
        id: 'apt_q12', category: 'Verbal',
        question: 'Select the word which is most nearly SIMILAR in meaning to PRAGMATIC:',
        a: 'Theoretical', b: 'Practical', c: 'Idealistic', d: 'Speculative', correct: 'B',
        exp: 'Pragmatic means dealing with things sensibly and realistically based on practical considerations.',
        diff: 'Easy'
      },
      {
        id: 'apt_q13', category: 'Verbal',
        question: 'Identify the grammatically correct sentence:',
        a: 'Neither the manager nor the employees was aware of the policy change.',
        b: 'Neither the manager nor the employees were aware of the policy change.',
        c: 'Neither the manager or the employees was aware of the policy change.',
        d: 'Neither the manager and the employees were aware of the policy change.',
        correct: 'B',
        exp: 'When subject terms are connected by "neither...nor", the verb agrees with the closer subject ("employees" -> plural "were").',
        diff: 'Medium'
      },
      {
        id: 'apt_q14', category: 'Verbal',
        question: 'Choose the appropriate word to fill in the blank: The board decided to _____ the merger decision until the audit completes.',
        a: 'defer', b: 'differ', c: 'default', d: 'defy', correct: 'A',
        exp: 'Defer means to postpone or put off to a later time.',
        diff: 'Easy'
      },
      {
        id: 'apt_q15', category: 'Verbal',
        question: 'Choose the one-word substitution: "A person who is fluent in multiple languages"',
        a: 'Polymath', b: 'Polyglot', c: 'Linguist', d: 'Philologist', correct: 'B',
        exp: 'A polyglot is someone who knows and is able to use several languages.',
        diff: 'Easy'
      }
    ];

    const aptTx = db.transaction(() => {
      for (const q of aptQuestions) {
        insertApt.run(q.id, q.category, q.question, q.a, q.b, q.c, q.d, q.correct, q.exp, q.diff);
      }
    });
    aptTx();
  }

  const codeCount = db.prepare('SELECT COUNT(*) as count FROM coding_questions').get().count;
  if (codeCount === 0) {
    const insertCode = db.prepare(`
      INSERT INTO coding_questions (id, title, difficulty, language, description, sample_input, sample_output, starter_code_python, starter_code_java, starter_code_c, test_cases_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const codingQuestions = [
      {
        id: 'code_q1',
        title: 'Two Sum Problem',
        difficulty: 'Easy',
        language: 'Python, Java, C',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input would have exactly one solution, and you may not use the same element twice.',
        sample_input: 'nums = [2, 7, 11, 15], target = 9',
        sample_output: '[0, 1]',
        py: 'def two_sum(nums, target):\n    # Write your solution here\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n',
        java: 'import java.util.*;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}\n',
        c: '#include <stdio.h>\n#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    int* res = (int*)malloc(2 * sizeof(int));\n    *returnSize = 2;\n    for(int i = 0; i < numsSize; i++) {\n        for(int j = i + 1; j < numsSize; j++) {\n            if(nums[i] + nums[j] == target) {\n                res[0] = i; res[1] = j;\n                return res;\n            }\n        }\n    }\n    return NULL;\n}\n',
        test_cases: JSON.stringify([
          { input: '[2, 7, 11, 15], 9', expected: '[0, 1]' },
          { input: '[3, 2, 4], 6', expected: '[1, 2]' },
          { input: '[3, 3], 6', expected: '[0, 1]' }
        ])
      },
      {
        id: 'code_q2',
        title: 'Valid Parentheses String Matching',
        difficulty: 'Easy',
        language: 'Python, Java, C',
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. Open brackets must be closed by the same type of brackets in the correct order.',
        sample_input: 's = "()[]{}"',
        sample_output: 'true',
        py: 'def is_valid_parentheses(s):\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else "#"\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n',
        java: 'import java.util.*;\n\npublic class Solution {\n    public static boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == \'(\') stack.push(\')\');\n            else if (c == \'{\') stack.push(\'}\');\n            else if (c == \'[\') stack.push(\']\');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}\n',
        c: '#include <stdbool.h>\n#include <string.h>\n\nbool isValid(char * s) {\n    int len = strlen(s);\n    char stack[len + 1];\n    int top = -1;\n    for(int i = 0; i < len; i++) {\n        char c = s[i];\n        if(c == \'(\' || c == \'{\' || c == \'[\') stack[++top] = c;\n        else {\n            if(top < 0) return false;\n            char open = stack[top--];\n            if(c == \')\' && open != \'(\') return false;\n            if(c == \'}\' && open != \'{\') return false;\n            if(c == \']\' && open != \'[\') return false;\n        }\n    }\n    return top == -1;\n}\n',
        test_cases: JSON.stringify([
          { input: '"()"', expected: 'true' },
          { input: '"()[]{}"', expected: 'true' },
          { input: '"(]"', expected: 'false' },
          { input: '"([)]"', expected: 'false' }
        ])
      },
      {
        id: 'code_q3',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        language: 'Python, Java, C',
        description: 'Given a string s, find the length of the longest substring without duplicate characters.',
        sample_input: 's = "abcabcbb"',
        sample_output: '3',
        py: 'def length_of_longest_substring(s):\n    char_map = {}\n    left = max_len = 0\n    for right, c in enumerate(s):\n        if c in char_map and char_map[c] >= left:\n            left = char_map[c] + 1\n        char_map[c] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len\n',
        java: 'import java.util.*;\n\npublic class Solution {\n    public static int lengthOfLongestSubstring(String s) {\n        int n = s.length(), maxLen = 0;\n        Map<Character, Integer> map = new HashMap<>();\n        for (int j = 0, i = 0; j < n; j++) {\n            if (map.containsKey(s.charAt(j))) {\n                i = Math.max(map.get(s.charAt(j)) + 1, i);\n            }\n            maxLen = Math.max(maxLen, j - i + 1);\n            map.put(s.charAt(j), j);\n        }\n        return maxLen;\n    }\n}\n',
        c: '#include <string.h>\n\nint lengthOfLongestSubstring(char * s) {\n    int n = strlen(s), maxLen = 0, i = 0;\n    int lastPos[256];\n    for(int k = 0; k < 256; k++) lastPos[k] = -1;\n    for(int j = 0; j < n; j++) {\n        unsigned char c = (unsigned char)s[j];\n        if(lastPos[c] >= i) i = lastPos[c] + 1;\n        lastPos[c] = j;\n        int curLen = j - i + 1;\n        if(curLen > maxLen) maxLen = curLen;\n    }\n    return maxLen;\n}\n',
        test_cases: JSON.stringify([
          { input: '"abcabcbb"', expected: '3' },
          { input: '"bbbbb"', expected: '1' },
          { input: '"pwwkew"', expected: '3' }
        ])
      },
      {
        id: 'code_q4',
        title: 'Maximum Subarray Sum (Kadane\'s Algorithm)',
        difficulty: 'Medium',
        language: 'Python, Java, C',
        description: 'Given an integer array nums, find the contiguous subarray with the largest sum, and return its sum.',
        sample_input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        sample_output: '6',
        py: 'def max_sub_array(nums):\n    max_sum = current_sum = nums[0]\n    for x in nums[1:]:\n        current_sum = max(x, current_sum + x)\n        max_sum = max(max_sum, current_sum)\n    return max_sum\n',
        java: 'public class Solution {\n    public static int maxSubArray(int[] nums) {\n        int maxSoFar = nums[0], currMax = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            currMax = Math.max(nums[i], currMax + nums[i]);\n            maxSoFar = Math.max(maxSoFar, currMax);\n        }\n        return maxSoFar;\n    }\n}\n',
        c: 'int maxSubArray(int* nums, int numsSize) {\n    int maxSoFar = nums[0], currMax = nums[0];\n    for(int i = 1; i < numsSize; i++) {\n        currMax = (nums[i] > currMax + nums[i]) ? nums[i] : (currMax + nums[i]);\n        if(currMax > maxSoFar) maxSoFar = currMax;\n    }\n    return maxSoFar;\n}\n',
        test_cases: JSON.stringify([
          { input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
          { input: '[1]', expected: '1' },
          { input: '[5,4,-1,7,8]', expected: '23' }
        ])
      }
    ];

    const codeTx = db.transaction(() => {
      for (const q of codingQuestions) {
        insertCode.run(q.id, q.title, q.difficulty, q.language, q.description, q.sample_input, q.sample_output, q.py, q.java, q.c, q.test_cases);
      }
    });
    codeTx();
  }
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
