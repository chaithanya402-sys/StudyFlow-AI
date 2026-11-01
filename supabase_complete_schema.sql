-- ==============================================================================
-- STUDYFLOW AI: COMPLETE SUPABASE POSTGRESQL SCHEMA WITH RLS
-- Project Reference: iquuxfmpuroewcghorvq
-- Centralized Cross-Laptop Synchronization
-- ==============================================================================

-- Enable UUID and Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.departments (code, name) VALUES
  ('CSE', 'Computer Science & Engineering'),
  ('ECE', 'Electronics & Communication Engineering'),
  ('IT', 'Information Technology'),
  ('MECH', 'Mechanical Engineering'),
  ('CIVIL', 'Civil Engineering'),
  ('T&P Cell', 'Training & Placement Cell')
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('student', 'faculty', 'officer')),
  full_name TEXT NOT NULL,
  roll_no TEXT,
  department TEXT DEFAULT 'CSE',
  phone TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_dept ON public.users(department);

-- ------------------------------------------------------------------------------
-- 3. SESSIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(token);

-- ------------------------------------------------------------------------------
-- 4. STUDENT PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_profiles (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
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
  cgpa NUMERIC(4, 2),
  tenth_pct NUMERIC(5, 2),
  tenth_year INTEGER,
  tenth_board TEXT,
  tenth_school TEXT,
  twelfth_pct NUMERIC(5, 2),
  twelfth_year INTEGER,
  twelfth_board TEXT,
  twelfth_college TEXT,
  twelfth_stream TEXT,
  backlogs INTEGER DEFAULT 0,
  historical_backlogs INTEGER DEFAULT 0,
  affiliation TEXT DEFAULT 'JNTUK',
  aptitude_score INTEGER,
  technical_score INTEGER,
  resume_score INTEGER,
  placement_probability INTEGER,
  prediction_status TEXT DEFAULT 'Pending Setup',
  placement_status TEXT DEFAULT 'In Process',
  placed_company TEXT,
  placed_package NUMERIC(5, 2),
  mentor_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  mentor_name TEXT,
  skills_json JSONB DEFAULT '[]'::jsonb,
  internships_json JSONB DEFAULT '[]'::jsonb,
  work_exp_json JSONB DEFAULT '[]'::jsonb,
  projects_json JSONB DEFAULT '[]'::jsonb,
  certifications_json JSONB DEFAULT '[]'::jsonb,
  recent_activities_json JSONB DEFAULT '[]'::jsonb,
  resume_json JSONB DEFAULT '{}'::jsonb,
  academic_profile_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Convenient view for faculty & admin profiles
CREATE OR REPLACE VIEW public.faculty_profiles AS
  SELECT id AS user_id, full_name, email, department, roll_no AS employee_id, phone, avatar, created_at
  FROM public.users WHERE role = 'faculty';

CREATE OR REPLACE VIEW public.admin_profiles AS
  SELECT id AS user_id, full_name, email, department, roll_no AS employee_id, phone, avatar, created_at
  FROM public.users WHERE role = 'officer';

-- ------------------------------------------------------------------------------
-- 5. ASSIGNMENTS TABLE (Faculty, Lab, Practice, Learning, Group Projects)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'faculty', 'lab', 'learning', 'practice', 'group_projects'
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT DEFAULT 'General Assignments',
  professor TEXT NOT NULL,
  department TEXT NOT NULL,
  target_year TEXT NOT NULL, -- '3rd Year (Current)', 'Third Year', etc.
  target_class TEXT NOT NULL, -- 'CSE', 'ECE', 'All', etc.
  created_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  attachments_json JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  instructions TEXT,
  due_date TEXT NOT NULL,
  due_time TEXT DEFAULT '23:59',
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Published', -- 'Draft', 'Published', 'Archived'
  max_marks NUMERIC(6, 2) DEFAULT 100,
  rubric_json JSONB DEFAULT '[]'::jsonb,
  meta_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_type ON public.assignments(type);
CREATE INDEX IF NOT EXISTS idx_assignments_dept ON public.assignments(department);
CREATE INDEX IF NOT EXISTS idx_assignments_target_year ON public.assignments(target_year);
CREATE INDEX IF NOT EXISTS idx_assignments_target_class ON public.assignments(target_class);

-- Specific views for categories
CREATE OR REPLACE VIEW public.lab_assignments AS SELECT * FROM public.assignments WHERE type = 'lab';
CREATE OR REPLACE VIEW public.practice_records AS SELECT * FROM public.assignments WHERE type = 'practice';
CREATE OR REPLACE VIEW public.learning_records AS SELECT * FROM public.assignments WHERE type = 'learning';

-- Assignment targets table for granular section/class mapping
CREATE TABLE IF NOT EXISTS public.assignment_targets (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  section TEXT DEFAULT 'All',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. SUBMISSIONS & MARKS & FEEDBACK TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  assignment_type TEXT NOT NULL,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  roll_no TEXT,
  submitted_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'Submitted', -- 'Pending', 'Submitted', 'Graded', 'Late', 'Revision Requested'
  is_late INTEGER DEFAULT 0,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER DEFAULT 0,
  remarks TEXT,
  marks NUMERIC(6, 2),
  feedback TEXT,
  strengths TEXT,
  improvements TEXT,
  next_steps TEXT,
  is_revision_requested INTEGER DEFAULT 0,
  published INTEGER DEFAULT 1,
  graded_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_asg ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions(student_id);

-- Explicit views for relational decomposition
CREATE OR REPLACE VIEW public.assignment_submissions AS
  SELECT id, assignment_id, assignment_type, student_id, student_name, roll_no, submitted_date, status, is_late, file_url, file_name, file_size, remarks, created_at
  FROM public.submissions;

CREATE OR REPLACE VIEW public.assignment_marks AS
  SELECT id AS submission_id, assignment_id, student_id, marks, graded_date, published, created_at
  FROM public.submissions WHERE marks IS NOT NULL;

CREATE OR REPLACE VIEW public.faculty_feedback AS
  SELECT id AS submission_id, assignment_id, student_id, feedback, strengths, improvements, next_steps, is_revision_requested, graded_date, created_at
  FROM public.submissions WHERE feedback IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 7. NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  target_role TEXT,
  category TEXT DEFAULT 'General',
  type TEXT DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  date TEXT DEFAULT 'Just now',
  read INTEGER DEFAULT 0,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON public.notifications(user_id);

-- ------------------------------------------------------------------------------
-- 8. CODING ASSESSMENT ENGINE TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coding_questions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  category TEXT DEFAULT 'Algorithms',
  description TEXT NOT NULL,
  sample_input TEXT,
  sample_output TEXT,
  time_limit_ms INTEGER DEFAULT 5000,
  memory_limit_mb INTEGER DEFAULT 256,
  starter_code_python TEXT,
  starter_code_java TEXT,
  starter_code_c TEXT,
  is_active INTEGER DEFAULT 1,
  source TEXT DEFAULT 'curated',
  topic TEXT,
  company_tags TEXT,
  complexity_bounds TEXT,
  model_id TEXT,
  assessment_id TEXT,
  fingerprint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coding_test_cases (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES public.coding_questions(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_hidden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coding_assessments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  difficulty TEXT,
  topic TEXT,
  company_pattern TEXT,
  status TEXT DEFAULT 'in_progress',
  duration_minutes INTEGER DEFAULT 60,
  passed_count INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 3,
  score NUMERIC(5, 2) DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coding_submissions (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES public.coding_questions(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  score NUMERIC(5, 2) DEFAULT 0,
  status TEXT NOT NULL,
  test_cases_passed INTEGER DEFAULT 0,
  total_test_cases INTEGER DEFAULT 0,
  execution_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. APTITUDE MODULE TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.aptitude_questions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL,
  explanation TEXT,
  source_file TEXT,
  row_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.aptitude_assessments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER DEFAULT 900,
  questions_json JSONB NOT NULL,
  answers_json JSONB DEFAULT '{}'::jsonb,
  score NUMERIC(6, 2),
  accuracy_percentage NUMERIC(6, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.aptitude_attempts (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  incorrect_answers INTEGER NOT NULL,
  score NUMERIC(6, 2) NOT NULL,
  accuracy_percentage NUMERIC(6, 2) NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  answers_json JSONB,
  unanswered_count INTEGER DEFAULT 0,
  category_scores_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. ACADEMIC & PLACEMENT PREDICTION TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.academic_records (
  student_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  student_name TEXT,
  department TEXT,
  degree TEXT,
  current_semester TEXT,
  cgpa NUMERIC(4, 2),
  tenth_percentage NUMERIC(5, 2),
  twelfth_percentage NUMERIC(5, 2),
  active_backlogs INTEGER DEFAULT 0,
  previous_backlogs INTEGER DEFAULT 0,
  indicators_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_skills (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category TEXT DEFAULT 'Technical',
  proficiency_level TEXT DEFAULT 'Intermediate',
  years_experience NUMERIC(3, 1) DEFAULT 1.0,
  is_verified INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_internships (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  duration_months INTEGER DEFAULT 3,
  description TEXT,
  completion_date TEXT,
  is_verified INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_projects (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  technologies TEXT,
  description TEXT,
  project_url TEXT,
  is_verified INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.placement_predictions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  placement_probability INTEGER NOT NULL,
  placement_status TEXT NOT NULL,
  academic_score INTEGER,
  profile_score INTEGER,
  aptitude_score INTEGER,
  coding_score INTEGER,
  prediction_features JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.placement_drives (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  tier TEXT DEFAULT 'Dream',
  ctc_lpa NUMERIC(5, 2),
  min_cgpa NUMERIC(4, 2) DEFAULT 7.0,
  eligible_branches TEXT DEFAULT 'CSE, IT, ECE',
  drive_date TEXT,
  deadline TEXT,
  description TEXT,
  status TEXT DEFAULT 'Open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Anonymous / Service policies for backend API & authenticated client operations
-- (Since StudyFlow AI uses an Express backend acting on behalf of authenticated sessions,
--  the backend connects via anon key and can perform authorized operations)
CREATE POLICY "Allow anon select on public datasets" ON public.departments FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon select on questions" ON public.coding_questions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon select on aptitude questions" ON public.aptitude_questions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon select on placement drives" ON public.placement_drives FOR SELECT TO anon USING (true);

-- Users & Profiles RLS
CREATE POLICY "Users: full management for authenticated backend operations" ON public.users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Student profiles: full management for backend" ON public.student_profiles FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Sessions: full management for backend" ON public.sessions FOR ALL TO anon USING (true) WITH CHECK (true);

-- Assignments RLS: Cross-laptop synchronization
CREATE POLICY "Assignments: full management for backend" ON public.assignments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Submissions: full management for backend" ON public.submissions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Notifications: full management for backend" ON public.notifications FOR ALL TO anon USING (true) WITH CHECK (true);

-- Coding and ML RLS
CREATE POLICY "Coding submissions: full management for backend" ON public.coding_submissions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Coding assessments: full management for backend" ON public.coding_assessments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Aptitude assessments: full management for backend" ON public.aptitude_assessments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Aptitude attempts: full management for backend" ON public.aptitude_attempts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Academic records: full management for backend" ON public.academic_records FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Student skills: full management for backend" ON public.student_skills FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Student internships: full management for backend" ON public.student_internships FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Student projects: full management for backend" ON public.student_projects FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Placement predictions: full management for backend" ON public.placement_predictions FOR ALL TO anon USING (true) WITH CHECK (true);
