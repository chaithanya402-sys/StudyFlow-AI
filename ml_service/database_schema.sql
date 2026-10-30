-- =============================================================================
-- AI-Based Student Placement Prediction System - Complete Relational Schema
-- Compatible with MySQL 8.0+ and SQLite 3.35+
-- =============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'student', -- 'student', 'faculty', 'officer'
  roll_number VARCHAR(64),
  department VARCHAR(100) DEFAULT 'Computer Science & Engineering',
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Academic Records (Pillar 1)
CREATE TABLE IF NOT EXISTS academic_records (
  student_id VARCHAR(64) PRIMARY KEY,
  student_name VARCHAR(120),
  department VARCHAR(100),
  degree VARCHAR(64) DEFAULT 'B.Tech',
  current_semester VARCHAR(32) DEFAULT '6th Semester',
  cgpa DECIMAL(4, 2) NOT NULL,
  tenth_percentage DECIMAL(5, 2) NOT NULL,
  twelfth_percentage DECIMAL(5, 2) NOT NULL,
  active_backlogs INT DEFAULT 0,
  previous_backlogs INT DEFAULT 0,
  indicators_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Student Skills (Pillar 2A)
CREATE TABLE IF NOT EXISTS student_skills (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  skill_name VARCHAR(80) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'programming', 'database', 'web', 'data_science'
  proficiency_level VARCHAR(32) NOT NULL, -- 'Beginner', 'Intermediate', 'Advanced', 'Expert'
  years_experience DECIMAL(3, 1) DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Student Internships (Pillar 2B)
CREATE TABLE IF NOT EXISTS student_internships (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  role VARCHAR(100) NOT NULL,
  company VARCHAR(120) NOT NULL,
  duration_months INT DEFAULT 3,
  description TEXT,
  start_date VARCHAR(32),
  end_date VARCHAR(32),
  verified INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Student Projects (Pillar 2C)
CREATE TABLE IF NOT EXISTS student_projects (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  technologies VARCHAR(255),
  project_url VARCHAR(255),
  duration VARCHAR(50),
  role VARCHAR(80),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Aptitude Questions (Pillar 3)
CREATE TABLE IF NOT EXISTS aptitude_questions (
  id VARCHAR(64) PRIMARY KEY,
  category VARCHAR(50) NOT NULL, -- 'Quantitative', 'Logical', 'Verbal'
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option VARCHAR(5) NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(20) DEFAULT 'Medium'
);

-- 7. Aptitude Attempts
CREATE TABLE IF NOT EXISTS aptitude_attempts (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  category VARCHAR(50) NOT NULL,
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  incorrect_answers INT NOT NULL,
  score DECIMAL(6, 2) NOT NULL,
  accuracy_percentage DECIMAL(5, 2) NOT NULL,
  time_taken_seconds INT NOT NULL,
  answers_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Coding Questions (Pillar 4)
CREATE TABLE IF NOT EXISTS coding_questions (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  difficulty VARCHAR(20) NOT NULL, -- 'Easy', 'Medium', 'Hard'
  language VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  sample_input TEXT,
  sample_output TEXT,
  starter_code_python TEXT,
  starter_code_java TEXT,
  starter_code_c TEXT,
  test_cases_json TEXT NOT NULL
);

-- 9. Coding Test Cases (Public & Hidden)
CREATE TABLE IF NOT EXISTS coding_test_cases (
  id VARCHAR(64) PRIMARY KEY,
  question_id VARCHAR(64) NOT NULL,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_hidden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES coding_questions(id) ON DELETE CASCADE
);

-- 10. Coding Submissions
CREATE TABLE IF NOT EXISTS coding_submissions (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  question_id VARCHAR(64) NOT NULL,
  question_title VARCHAR(150),
  language VARCHAR(50) NOT NULL,
  code TEXT NOT NULL,
  test_cases_passed INT NOT NULL,
  test_cases_total INT NOT NULL,
  score DECIMAL(5, 2) NOT NULL,
  execution_time_ms INT NOT NULL,
  status VARCHAR(40) NOT NULL, -- 'Accepted', 'Partially Accepted', 'Wrong Answer', 'Compilation Error', 'Runtime Error', 'Time Limit Exceeded'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES coding_questions(id) ON DELETE CASCADE
);

-- 11. Coding Execution Logs (Sandboxed Telemetry)
CREATE TABLE IF NOT EXISTS coding_execution_logs (
  id VARCHAR(64) PRIMARY KEY,
  submission_id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  question_id VARCHAR(64) NOT NULL,
  language VARCHAR(50) NOT NULL,
  execution_mode VARCHAR(50) DEFAULT 'subprocess',
  stdout TEXT,
  stderr TEXT,
  exit_code INT DEFAULT 0,
  execution_time_ms INT DEFAULT 0,
  memory_peak_kb INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES coding_submissions(id) ON DELETE CASCADE
);

-- 10. Placement Predictions (ML Output)
CREATE TABLE IF NOT EXISTS placement_predictions (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  placement_probability INT NOT NULL, -- 0 to 100%
  placement_status VARCHAR(50) NOT NULL, -- 'Placement Ready', 'In Progress', 'At Risk'
  academic_score DECIMAL(5, 2) NOT NULL,
  profile_score DECIMAL(5, 2) NOT NULL,
  aptitude_score DECIMAL(5, 2) NOT NULL,
  coding_score DECIMAL(5, 2) NOT NULL,
  contributions_json TEXT,
  factors_json TEXT,
  recommendations_json TEXT,
  model_used VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Resume Records (ATS Analyzer)
CREATE TABLE IF NOT EXISTS resume_records (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(255),
  ats_score INT NOT NULL,
  extracted_skills_json TEXT,
  missing_skills_json TEXT,
  feedback_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  user_role VARCHAR(32) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(32) DEFAULT 'info',
  is_read INT DEFAULT 0,
  timestamp VARCHAR(50) DEFAULT 'Just now',
  action_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_academic_records_student ON academic_records(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_student ON student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_internships_student ON student_internships(student_id);
CREATE INDEX IF NOT EXISTS idx_student_projects_student ON student_projects(student_id);
CREATE INDEX IF NOT EXISTS idx_aptitude_attempts_student ON aptitude_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_student ON coding_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_placement_predictions_student ON placement_predictions(student_id);
CREATE INDEX IF NOT EXISTS idx_resume_records_student ON resume_records(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

