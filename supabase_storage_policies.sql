-- ============================================================================
-- StudyFlow AI: Supabase Storage Configuration & Secure RLS Policies
-- Target Bucket: studyflow-uploads (Private Bucket)
-- Project: iquuxfmpuroewcghorvq
--
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/iquuxfmpuroewcghorvq
-- 2. In the left navigation menu, click on "SQL Editor".
-- 3. Click "+ New query".
-- 4. Paste this entire SQL file and click "Run" (or Ctrl + Enter).
-- ============================================================================

-- 1. Ensure the studyflow-uploads bucket exists and is configured as a PRIVATE bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'studyflow-uploads',
  'studyflow-uploads',
  false, -- Keep private (Access controlled via signed URLs and role policies)
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

-- 2. Enable Row Level Security (RLS) on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: SELECT (Allows viewing, downloading, and creating signed URLs)
-- Only files belonging to the studyflow-uploads bucket are readable
DROP POLICY IF EXISTS "StudyFlow AI: Allow anon and authenticated select" ON storage.objects;
CREATE POLICY "StudyFlow AI: Allow anon and authenticated select"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'studyflow-uploads');

-- 4. Policy: INSERT (Allows uploading assignment PDFs and student solutions)
DROP POLICY IF EXISTS "StudyFlow AI: Allow anon and authenticated insert" ON storage.objects;
CREATE POLICY "StudyFlow AI: Allow anon and authenticated insert"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'studyflow-uploads');

-- 5. Policy: UPDATE (Allows updating or replacing existing submissions/attachments)
DROP POLICY IF EXISTS "StudyFlow AI: Allow anon and authenticated update" ON storage.objects;
CREATE POLICY "StudyFlow AI: Allow anon and authenticated update"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'studyflow-uploads')
WITH CHECK (bucket_id = 'studyflow-uploads');

-- 6. Policy: DELETE (Allows removing outdated or retracted uploads)
DROP POLICY IF EXISTS "StudyFlow AI: Allow anon and authenticated delete" ON storage.objects;
CREATE POLICY "StudyFlow AI: Allow anon and authenticated delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'studyflow-uploads');

-- 7. Verification Query: Confirm policy status
SELECT
  p.policyname,
  p.cmd,
  p.roles,
  p.qual,
  p.with_check
FROM pg_policies p
WHERE p.schemaname = 'storage'
  AND p.tablename = 'objects'
  AND p.policyname LIKE 'StudyFlow AI%';

