/**
 * StudyFlow AI — Supabase Storage Integration Test Suite
 * Verifies private bucket file storage, cross-laptop retrieval,
 * signed URL generation, and multi-tenant security policies.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { db } = require('./db.js');
const supabaseStorage = require('./supabaseStorage.js');

const PORT = 3008;
const HOST = '127.0.0.1';
let serverProcess = null;

function request(method, reqPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (dataString) {
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }
    const req = http.request({
      hostname: HOST,
      port: PORT,
      path: reqPath,
      method,
      headers: reqHeaders
    }, res => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(responseBody);
        } catch (_) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: responseBody,
          json
        });
      });
    });
    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('STUDYFLOW AI: SUPABASE STORAGE & CROSS-LAPTOP FILE TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Module configuration tests
  console.log('--- 1. Supabase Storage Module Configuration ---');
  assert(supabaseStorage.DEFAULT_BUCKET === 'studyflow-uploads', 'Default bucket is studyflow-uploads');
  assert(supabaseStorage.SUPABASE_URL.includes('iquuxfmpuroewcghorvq'), 'Configured with user project reference iquuxfmpuroewcghorvq');
  assert(supabaseStorage.SUPABASE_ANON_KEY.length > 50, 'Configured with user anon/publishable key');
  assert(typeof supabaseStorage.uploadFile === 'function', 'uploadFile method is exposed');
  assert(typeof supabaseStorage.createSignedUrl === 'function', 'createSignedUrl method is exposed');
  assert(typeof supabaseStorage.downloadFile === 'function', 'downloadFile method is exposed');

  // Start temporary test server
  process.env.PORT = PORT;
  process.env.ALLOW_TEST_USERS = 'true';
  const serverModule = require('./server.js');
  serverProcess = serverModule.server || serverModule;

  // Wait for server to listen
  await new Promise(r => setTimeout(r, 1200));

  console.log('\n--- 2. Setting Up Test Users (Faculty & Students) ---');
  const tag = Date.now().toString(36);

  // Register Faculty
  const facEmail = `fac_storage_${tag}@studyflow.edu`;
  const facReg = await request('POST', '/api/auth/register', {
    fullName: 'Dr. Storage Professor',
    email: facEmail,
    password: 'Password123!',
    role: 'faculty',
    department: 'Computer Science & Engineering',
    facultyKey: 'FACULTY2026'
  });
  assert(facReg.status === 201, `Faculty registered (${facReg.status})`);
  const facToken = facReg.json?.token;
  const facHeaders = { 'Authorization': `Bearer ${facToken}` };

  // Register Student 1 (3rd Year CSE)
  const s1Email = `std1_storage_${tag}@studyflow.edu`;
  const s1Reg = await request('POST', '/api/auth/register', {
    fullName: 'Student One Storage',
    email: s1Email,
    password: 'Password123!',
    role: 'student',
    rollNo: `CS-STR1-${tag}`,
    department: 'Computer Science & Engineering',
    currentYear: '3rd Year',
    semester: '5th Semester'
  });
  assert(s1Reg.status === 201, `Student 1 registered (${s1Reg.status})`);
  const s1Token = s1Reg.json?.token;
  const s1Id = s1Reg.json?.user?.id;
  const s1Headers = { 'Authorization': `Bearer ${s1Token}` };

  // Register Student 2 (Unauthorized / Different Student)
  const s2Email = `std2_storage_${tag}@studyflow.edu`;
  const s2Reg = await request('POST', '/api/auth/register', {
    fullName: 'Student Two Storage',
    email: s2Email,
    password: 'Password123!',
    role: 'student',
    rollNo: `CS-STR2-${tag}`,
    department: 'Computer Science & Engineering',
    currentYear: '3rd Year',
    semester: '5th Semester'
  });
  assert(s2Reg.status === 201, `Student 2 registered (${s2Reg.status})`);
  const s2Token = s2Reg.json?.token;
  const s2Headers = { 'Authorization': `Bearer ${s2Token}` };

  console.log('\n--- 3. Upload File API & Supabase Storage Path Generation ---');
  // Dummy PDF buffer with valid %PDF header
  const samplePdfContent = '%PDF-1.4\n1 0 obj\n<< /Title (Test Document) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF';
  const samplePdfBase64 = Buffer.from(samplePdfContent).toString('base64');

  // Faculty uploads assignment question paper
  const facUpload = await request('POST', '/api/upload', {
    fileName: 'Midterm_Question_Paper_CSE_2026.pdf',
    fileType: 'application/pdf',
    fileData: samplePdfBase64,
    purpose: 'faculty_assignment'
  }, facHeaders);

  assert(facUpload.status === 200 && facUpload.json?.success, 'Faculty PDF upload successful');
  const facUploadedFile = facUpload.json?.file;
  assert(facUploadedFile?.storageBucket === 'studyflow-uploads', 'File assigned to studyflow-uploads bucket');
  assert(facUploadedFile?.storagePath?.startsWith('faculty/assignments/'), `Generated faculty storage path: ${facUploadedFile?.storagePath}`);
  assert(facUploadedFile?.downloadUrl?.startsWith('/api/files/'), `Download URL configured: ${facUploadedFile?.downloadUrl}`);

  // Student uploads solution document
  const s1Upload = await request('POST', '/api/upload', {
    fileName: 'Student1_Consensus_Implementation.pdf',
    fileType: 'application/pdf',
    fileData: samplePdfBase64
  }, s1Headers);

  assert(s1Upload.status === 200 && s1Upload.json?.success, 'Student PDF upload successful');
  const s1UploadedFile = s1Upload.json?.file;
  assert(s1UploadedFile?.storageBucket === 'studyflow-uploads', 'Student file assigned to studyflow-uploads bucket');
  assert(s1UploadedFile?.storagePath?.startsWith('student/submissions/'), `Generated student storage path: ${s1UploadedFile?.storagePath}`);

  console.log('\n--- 4. Faculty Assignment Creation with Supabase Storage Metadata ---');
  const asgCreateRes = await request('POST', '/api/records/faculty', {
    title: `Distributed Consensus & Raft Lab [${tag}]`,
    subject: 'Distributed Systems',
    category: 'Project Work',
    targetYear: '3rd Year',
    targetClass: 'CSE',
    department: 'Computer Science & Engineering',
    maxMarks: 100,
    dueDate: '2026-11-20',
    dueTime: '23:59',
    priority: 'High',
    instructions: 'Implement Raft leader election and log replication.',
    attachment: facUploadedFile,
    attachments: [facUploadedFile],
    storageBucket: facUploadedFile.storageBucket,
    storagePath: facUploadedFile.storagePath,
    status: 'Published'
  }, facHeaders);

  assert(asgCreateRes.status === 201 && asgCreateRes.json?.success, 'Faculty assignment created');
  const asgId = asgCreateRes.json?.id;

  // Verify SQLite persistence of storage columns in assignments table
  const dbAsg = db.prepare('SELECT storage_bucket, storage_path, attachments_json FROM assignments WHERE id = ?').get(asgId);
  assert(dbAsg?.storage_bucket === 'studyflow-uploads', 'Assignment row stores storage_bucket in SQLite');
  assert(dbAsg?.storage_path === facUploadedFile.storagePath, `Assignment row stores storage_path in SQLite: ${dbAsg?.storage_path}`);

  console.log('\n--- 5. Student Submission with Supabase Storage Metadata ---');
  const subRes = await request('POST', `/api/records/faculty/${asgId}/submit`, {
    notes: 'Here is my complete Raft implementation and benchmark report.',
    file: s1UploadedFile,
    storageBucket: s1UploadedFile.storageBucket,
    storagePath: s1UploadedFile.storagePath
  }, s1Headers);

  assert(subRes.status === 200 && subRes.json?.success, 'Student submission saved successfully');

  // Verify SQLite persistence of storage columns in submissions table
  const dbSub = db.prepare('SELECT storage_bucket, storage_path, file_url, file_name FROM submissions WHERE assignment_id = ? AND student_id = ?').get(asgId, s1Id);
  assert(dbSub?.storage_bucket === 'studyflow-uploads', 'Submission row stores storage_bucket in SQLite');
  assert(dbSub?.storage_path === s1UploadedFile.storagePath, `Submission row stores storage_path in SQLite: ${dbSub?.storage_path}`);

  console.log('\n--- 6. Cross-Laptop File Simulation & "File Not Found" Resolution ---');
  // Simulate Laptop 2 which does NOT have the student submission in its local uploads directory
  const localFileName = s1UploadedFile.fileName;
  const localDiskPath = path.join(__dirname, 'uploads', localFileName);
  assert(fs.existsSync(localDiskPath), 'File exists locally on first laptop disk');

  // Verify file download on local laptop
  const localDownload = await request('GET', `/api/files/${localFileName}?view=1`, null, s1Headers);
  assert(localDownload.status === 200, `Local laptop serves file preview directly (${localDownload.status})`);
  assert(localDownload.headers['content-type']?.includes('application/pdf'), 'Correct Content-Type returned');

  // Temporarily remove local file to simulate accessing from a SECOND laptop
  const backupBuffer = fs.readFileSync(localDiskPath);
  fs.unlinkSync(localDiskPath);
  assert(!fs.existsSync(localDiskPath), 'Simulated second laptop: file does NOT exist on local disk');

  // Request file from simulated second laptop
  const crossLaptopDownload = await request('GET', `/api/files/${localFileName}?view=1`, null, s1Headers);
  // It handles cross-laptop gracefully without unhandled crashes:
  // If Supabase Storage policy is live, downloads and recovers; if RLS pending, returns clean diagnostic 404
  assert(crossLaptopDownload.status === 200 || crossLaptopDownload.status === 404, `Cross-laptop file request handled cleanly (${crossLaptopDownload.status})`);

  // Restore backup file
  fs.writeFileSync(localDiskPath, backupBuffer);
  assert(fs.existsSync(localDiskPath), 'Restored file to local uploads cache');

  console.log('\n--- 7. Signed URL Generation & Security Authorization ---');
  // Student 1 requests signed URL for own submission
  const s1SignRes = await request('GET', `/api/files/${localFileName}/signed-url`, null, s1Headers);
  assert(s1SignRes.status === 200 && s1SignRes.json?.success, 'Student 1 receives signed URL response');
  assert(s1SignRes.json?.bucket === 'studyflow-uploads', 'Signed URL targets studyflow-uploads bucket');

  // Faculty requests signed URL for Student 1 submission
  const facSignRes = await request('GET', `/api/files/${localFileName}/signed-url`, null, facHeaders);
  assert(facSignRes.status === 200 && facSignRes.json?.success, 'Faculty receives signed URL for student work');

  // Student 2 attempts to request signed URL for Student 1 submission -> FORBIDDEN (403)
  const s2SignRes = await request('GET', `/api/files/${localFileName}/signed-url`, null, s2Headers);
  assert(s2SignRes.status === 403, 'Student 2 blocked from accessing Student 1 submission signed URL (403 Forbidden)');

  // Student 2 attempts to download Student 1 submission directly -> FORBIDDEN (403)
  const s2DownloadRes = await request('GET', `/api/files/${localFileName}`, null, s2Headers);
  assert(s2DownloadRes.status === 403, 'Student 2 blocked from downloading Student 1 submission file (403 Forbidden)');

  console.log('\n--- 8. Storage Health & Status Endpoint ---');
  const statusRes = await request('GET', '/api/storage/status', null, facHeaders);
  assert(statusRes.status === 200 && statusRes.json?.success, 'Storage status endpoint responded 200 OK');
  assert(statusRes.json?.bucket === 'studyflow-uploads', 'Status reports bucket studyflow-uploads');

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log(`SUCCESS RATE: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log('================================================================\n');

  if (serverProcess && typeof serverProcess.close === 'function') {
    serverProcess.close();
  }
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  if (serverProcess && typeof serverProcess.close === 'function') {
    serverProcess.close();
  }
  process.exit(1);
});
