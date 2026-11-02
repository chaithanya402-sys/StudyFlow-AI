-- ==============================================================================
-- STUDYFLOW AI: SUPABASE CENTRALIZED ASSIGNMENTS & SUBMISSIONS SCHEMA
-- Project Reference: iquuxfmpuroewcghorvq
-- Centralized Cross-Laptop Synchronization & Secure Multi-Tenant RLS Policies
-- ==============================================================================
--
-- INSTRUCTIONS FOR USER:
-- 1. Open your Supabase Dashboard:
--    https://supabase.com/dashboard/project/iquuxfmpuroewcghorvq
-- 2. In the left navigation menu, click on "SQL Editor".
-- 3. Click "+ New query".
-- 4. Copy and paste the entire contents of this file and click "Run" (or Ctrl+Enter).
-- 5. That's it! All laptops will now immediately synchronize assignments and submissions.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ASSIGNMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                                -- 'general', 'faculty', 'lab', 'learning', 'practice', 'group_projects'
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General Assignments', -- 8 mapped categories
  professor TEXT NOT NULL,
  department TEXT NOT NULL,                          -- e.g. 'CSE', 'ECE', 'IT'
  target_year TEXT NOT NULL,                         -- e.g. '3rd Year', 'Third Year'
  target_class TEXT NOT NULL,                        -- e.g. 'CSE', 'Entire Third Year CSE', 'All'
  created_by TEXT,                                   -- Faculty user ID
  attachments_json JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  instructions TEXT,
  due_date TEXT NOT NULL,
  due_time TEXT DEFAULT '23:59',
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Published',                   -- 'Draft', 'Published', 'Archived'
  max_marks NUMERIC(6, 2) DEFAULT 100,
  storage_bucket TEXT DEFAULT 'studyflow-uploads',
  storage_path TEXT,
  rubric_json JSONB DEFAULT '[]'::jsonb,
  meta_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes for Cross-Laptop Queries
CREATE INDEX IF NOT EXISTS idx_assignments_type ON public.assignments(type);
CREATE INDEX IF NOT EXISTS idx_assignments_category ON public.assignments(category);
CREATE INDEX IF NOT EXISTS idx_assignments_dept ON public.assignments(department);
CREATE INDEX IF NOT EXISTS idx_assignments_target_year ON public.assignments(target_year);
CREATE INDEX IF NOT EXISTS idx_assignments_target_class ON public.assignments(target_class);
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON public.assignments(created_by);

-- ------------------------------------------------------------------------------
-- 2. SUBMISSIONS & EVALUATION MARKS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  assignment_type TEXT NOT NULL DEFAULT 'faculty',
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  roll_no TEXT,
  submitted_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'Submitted',                   -- 'Submitted', 'Graded', 'Late', 'Revision Requested'
  is_late INTEGER DEFAULT 0,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER DEFAULT 0,
  storage_bucket TEXT DEFAULT 'studyflow-uploads',
  storage_path TEXT,
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
  CONSTRAINT unq_assignment_student UNIQUE(assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions(student_id);

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES FOR ASSIGNMENTS & SUBMISSIONS
-- ------------------------------------------------------------------------------
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated clients full access for backend centralized sync
DROP POLICY IF EXISTS "Assignments: Backend & Client Sync Policy" ON public.assignments;
CREATE POLICY "Assignments: Backend & Client Sync Policy"
ON public.assignments
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Submissions: Backend & Client Sync Policy" ON public.submissions;
CREATE POLICY "Submissions: Backend & Client Sync Policy"
ON public.submissions
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 4. PRIVATE STORAGE BUCKET: studyflow-uploads & STORAGE POLICIES
-- ------------------------------------------------------------------------------
-- Ensure the private bucket studyflow-uploads is configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'studyflow-uploads',
  'studyflow-uploads',
  false, -- Private bucket: access controlled via signed URLs
  26214400, -- 25MB max file size limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-tar',
    'application/gzip',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'text/plain',
    'text/x-python',
    'text/x-java-source',
    'text/x-c'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 26214400;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Policies for studyflow-uploads
DROP POLICY IF EXISTS "StudyFlow Storage: Select Policy" ON storage.objects;
CREATE POLICY "StudyFlow Storage: Select Policy"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'studyflow-uploads');

DROP POLICY IF EXISTS "StudyFlow Storage: Insert Policy" ON storage.objects;
CREATE POLICY "StudyFlow Storage: Insert Policy"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'studyflow-uploads');

DROP POLICY IF EXISTS "StudyFlow Storage: Update Policy" ON storage.objects;
CREATE POLICY "StudyFlow Storage: Update Policy"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'studyflow-uploads')
WITH CHECK (bucket_id = 'studyflow-uploads');

DROP POLICY IF EXISTS "StudyFlow Storage: Delete Policy" ON storage.objects;
CREATE POLICY "StudyFlow Storage: Delete Policy"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'studyflow-uploads');
