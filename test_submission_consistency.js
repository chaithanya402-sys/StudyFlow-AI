const http = require('http');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const PORT = 3006;
process.env.PORT = PORT;
process.env.NO_AUTO_OPEN = '1';

// Import server
const app = require('./server.js');
const DB_PATH = path.join(__dirname, 'data', 'studyflow.db');

function request(method, reqPath, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: reqPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const testResults = [];
function recordResult(testName, passed, details = '') {
  testResults.push({ testName, passed, details });
  const statusStr = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${statusStr}: ${testName} ${details ? '(' + details + ')' : ''}`);
}

async function runSubmissionConsistencyTests() {
  console.log('================================================================');
  console.log('STUDYFLOW AI: SUBMISSION DATA CONSISTENCY & INTEGRITY TEST SUITE');
  console.log('================================================================\n');

  const ts = Date.now();
  const student1Email = `student1.${ts}@college.edu`;
  const student2Email = `student2.${ts}@college.edu`;

  let token1 = null;
  let student1Id = null;
  let token2 = null;
  let student2Id = null;
  let cohortAssignmentId = null;
  let lateAssignmentId = null;

  try {
    // -------------------------------------------------------------------------
    // SETUP: Register two distinct students
    // -------------------------------------------------------------------------
    console.log('--- Setup: Registering Students ---');
    const reg1 = await request('POST', '/api/auth/register', {
      email: student1Email,
      password: 'password123',
      role: 'student',
      fullName: 'Student Alice One',
      rollNo: `ROLL_1_${ts}`,
      currentYear: '4th Year',
      department: 'CSE'
    });
    student1Id = reg1.body?.user?.id;
    const login1 = await request('POST', '/api/auth/login', {
      email: student1Email,
      password: 'password123',
      role: 'student'
    });
    token1 = login1.body?.token;
    recordResult('Student 1 registered & authenticated', login1.status === 200 && !!token1, `ID: ${student1Id}`);

    const reg2 = await request('POST', '/api/auth/register', {
      email: student2Email,
      password: 'password123',
      role: 'student',
      fullName: 'Student Bob Two',
      rollNo: `ROLL_2_${ts}`,
      currentYear: '4th Year',
      department: 'CSE'
    });
    student2Id = reg2.body?.user?.id;
    const login2 = await request('POST', '/api/auth/login', {
      email: student2Email,
      password: 'password123',
      role: 'student'
    });
    token2 = login2.body?.token;
    recordResult('Student 2 registered & authenticated', login2.status === 200 && !!token2, `ID: ${student2Id}`);

    const noAuthSubmit = await request('POST', '/api/records/faculty/fa_002/submit', { notes: 'No session' });
    recordResult('Anonymous users cannot submit coursework', noAuthSubmit.status === 401, `Status: ${noAuthSubmit.status}`);

    const facultyLogin = await request('POST', '/api/auth/login', { email: 'dr.rajesh.mentor@college.edu', password: 'mentor2026' });
    const facultyToken = facultyLogin.body?.token;
    const cohortCreate = await request('POST', '/api/assignments/faculty', {
      title: `Consistency cohort ${ts}`, subject: 'Machine Learning', targetYear: '4th Year',
      targetClass: 'CSE', department: 'CSE', dueDate: '2099-12-30', dueTime: '23:59', maxMarks: 25
    }, facultyToken);
    cohortAssignmentId = cohortCreate.body?.id;
    const nonMatchingCreate = await request('POST', '/api/assignments/faculty', {
      title: `Consistency other cohort ${ts}`, subject: 'Machine Learning', targetYear: '1st Year',
      targetClass: 'IT', department: 'IT', dueDate: '2099-12-30', dueTime: '23:59', maxMarks: 25
    }, facultyToken);
    const studentAssignments = await request('GET', '/api/assignments/faculty', null, token1);
    recordResult('Student assignment list matches its own year and class', cohortCreate.status === 201 && nonMatchingCreate.status === 201 && studentAssignments.body?.data?.some(item => item.id === cohortAssignmentId) && !studentAssignments.body?.data?.some(item => item.id === nonMatchingCreate.body?.id));
    const lateCreate = await request('POST', '/api/assignments/faculty', {
      title: `Consistency late check ${ts}`, subject: 'Machine Learning', targetYear: '4th Year',
      targetClass: 'CSE', department: 'CSE', dueDate: '2000-01-01', dueTime: '00:00', maxMarks: 25
    }, facultyToken);
    lateAssignmentId = lateCreate.body?.id;
    const lateSubmission = await request('POST', `/api/assignments/faculty/${lateAssignmentId}/submit`, { notes: 'Late integration fixture' }, token1);
    recordResult('Past due submission is persisted with Late status', lateSubmission.status === 200 && lateSubmission.body?.data?.submissions?.some(sub => sub.studentId === student1Id && sub.isLate && sub.status === 'Late'));

    // Upload distinct test files for student 1
    const dummyPdfContent = Buffer.from('%PDF-1.4\n%test submission pdf\n%%EOF').toString('base64');
    const dummyZipContent = Buffer.from('PK\x03\x04\ntest zip archive').toString('base64');
    const dummyTxtContent = Buffer.from('// C++ Solution\n#include <iostream>\nint main(){return 0;}').toString('base64');

    const upFaculty = await request('POST', '/api/upload', {
      fileName: 'faculty_arch_paper.pdf',
      fileType: 'application/pdf',
      fileData: dummyPdfContent
    }, token1);
    const facultyFile = upFaculty.body?.file;

    const upLab = await request('POST', '/api/upload', {
      fileName: 'lab3_raft_simulation.zip',
      fileType: 'application/zip',
      fileData: dummyZipContent
    }, token1);
    const labFile = upLab.body?.file;

    const upLearning = await request('POST', '/api/upload', {
      fileName: 'react_cert_verified.pdf',
      fileType: 'application/pdf',
      fileData: dummyPdfContent
    }, token1);
    const learningFile = upLearning.body?.file;

    const upPractice = await request('POST', '/api/upload', {
      fileName: 'leetcode_coin_change.cpp',
      fileType: 'text/plain',
      fileData: dummyTxtContent
    }, token1);
    const practiceFile = upPractice.body?.file;

    // -------------------------------------------------------------------------
    // SCENARIO 1: Create different submissions across all 4 categories
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 1: Submitting Across 4 Categories with Unique Data ---');

    // Category 1: Faculty Assignment (fa_002)
    const subFaculty = await request('POST', '/api/records/faculty/fa_002/submit', {
      notes: 'Student 1 system architecture microservices design',
      file: facultyFile
    }, token1);
    recordResult(
      'Faculty assignment submitted with unique file and remarks',
      subFaculty.status === 200 &&
      subFaculty.body.data?.submittedFile?.originalName === 'faculty_arch_paper.pdf' &&
      subFaculty.body.data?.studentRemarks === 'Student 1 system architecture microservices design',
      `File: ${subFaculty.body.data?.submittedFile?.originalName}`
    );

    // Category 2: Lab Assignment (lab_003)
    const subLab = await request('POST', '/api/records/lab/lab_003/submit', {
      notes: 'Student 1 Raft consensus protocol simulation in Go/Python',
      file: labFile
    }, token1);
    recordResult(
      'Lab assignment submitted with unique file and remarks',
      subLab.status === 200 &&
      subLab.body.data?.submittedFile?.originalName === 'lab3_raft_simulation.zip' &&
      subLab.body.data?.studentRemarks === 'Student 1 Raft consensus protocol simulation in Go/Python',
      `File: ${subLab.body.data?.submittedFile?.originalName}`
    );

    // Category 3: Learning Record (lr_003)
    const subLearning = await request('POST', '/api/records/learning/lr_003/submit', {
      notes: 'Student 1 Full stack React credentials and certificates',
      file: learningFile
    }, token1);
    recordResult(
      'Learning record submitted with unique file and remarks',
      subLearning.status === 200 &&
      subLearning.body.data?.submittedFile?.originalName === 'react_cert_verified.pdf' &&
      subLearning.body.data?.studentRemarks === 'Student 1 Full stack React credentials and certificates',
      `File: ${subLearning.body.data?.submittedFile?.originalName}`
    );

    // Category 4: Practice Record (pr_002)
    const subPractice = await request('POST', '/api/records/practice/pr_002/submit', {
      notes: 'Student 1 bottom-up DP coin change solution with O(amount) space',
      file: practiceFile
    }, token1);
    recordResult(
      'Practice record submitted with unique file and remarks',
      subPractice.status === 200 &&
      subPractice.body.data?.submittedFile?.originalName === 'leetcode_coin_change.cpp' &&
      subPractice.body.data?.studentRemarks === 'Student 1 bottom-up DP coin change solution with O(amount) space',
      `File: ${subPractice.body.data?.submittedFile?.originalName}`
    );

    // -------------------------------------------------------------------------
    // SCENARIO 2: Open View Details (GET /api/records/:type/:id) in each category
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 2: View Details Verification in Each Category ---');

    const getFaculty = await request('GET', '/api/records/faculty/fa_002', null, token1);
    const fData = getFaculty.body?.data;
    const fPassed = (
      getFaculty.status === 200 &&
      fData?.submittedFile?.originalName === 'faculty_arch_paper.pdf' &&
      fData?.studentRemarks === 'Student 1 system architecture microservices design' &&
      ['Submitted', 'Late'].includes(fData?.studentStatus)
    );
    recordResult('View Details: Faculty Assignment shows its own file and remarks', fPassed, `File: ${fData?.submittedFile?.originalName}`);

    const getLab = await request('GET', '/api/records/lab/lab_003', null, token1);
    const lData = getLab.body?.data;
    const lPassed = (
      getLab.status === 200 &&
      lData?.submittedFile?.originalName === 'lab3_raft_simulation.zip' &&
      lData?.studentRemarks === 'Student 1 Raft consensus protocol simulation in Go/Python' &&
      ['Submitted', 'Late'].includes(lData?.studentStatus)
    );
    recordResult('View Details: Lab Assignment shows its own file and remarks', lPassed, `File: ${lData?.submittedFile?.originalName}`);

    const getLearning = await request('GET', '/api/records/learning/lr_003', null, token1);
    const lrData = getLearning.body?.data;
    const lrPassed = (
      getLearning.status === 200 &&
      lrData?.submittedFile?.originalName === 'react_cert_verified.pdf' &&
      lrData?.studentRemarks === 'Student 1 Full stack React credentials and certificates' &&
      ['Submitted', 'Late'].includes(lrData?.studentStatus)
    );
    recordResult('View Details: Learning Record shows its own file and remarks', lrPassed, `File: ${lrData?.submittedFile?.originalName}`);

    const getPractice = await request('GET', '/api/records/practice/pr_002', null, token1);
    const prData = getPractice.body?.data;
    const prPassed = (
      getPractice.status === 200 &&
      prData?.submittedFile?.originalName === 'leetcode_coin_change.cpp' &&
      prData?.studentRemarks === 'Student 1 bottom-up DP coin change solution with O(amount) space' &&
      ['Submitted', 'Late'].includes(prData?.studentStatus)
    );
    recordResult('View Details: Practice Record shows its own file and remarks', prPassed, `File: ${prData?.submittedFile?.originalName}`);

    // Verify absence of cross-category bleed-over
    const distinctFiles = new Set([
      fData?.submittedFile?.originalName,
      lData?.submittedFile?.originalName,
      lrData?.submittedFile?.originalName,
      prData?.submittedFile?.originalName
    ]);
    const noBleed = distinctFiles.size === 4 && !distinctFiles.has('frame_008.png');
    recordResult('No cross-category duplicate files or hardcoded frame_008.png found', noBleed, `4 distinct files: ${Array.from(distinctFiles).join(', ')}`);

    // -------------------------------------------------------------------------
    // SCENARIO 4: Update remarks without uploading a replacement file
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 4: Updating Remarks Without Replacing File ---');

    const updateRemarksRes = await request('POST', '/api/records/faculty/fa_002/submit', {
      notes: 'Student 1 updated remarks: added message queue throughput analysis'
    }, token1);
    const updatedF = updateRemarksRes.body?.data;
    const remarksUpdatedPreserved = (
      updateRemarksRes.status === 200 &&
      updatedF?.studentRemarks === 'Student 1 updated remarks: added message queue throughput analysis' &&
      updatedF?.submittedFile?.originalName === 'faculty_arch_paper.pdf' &&
      !!updatedF?.submissionUrl
    );
    recordResult('Updating remarks preserves existing file metadata', remarksUpdatedPreserved, `File kept: ${updatedF?.submittedFile?.originalName}`);

    // -------------------------------------------------------------------------
    // SCENARIO 5: Replace a file and confirm ONLY intended submission changes
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 5: Replacing File on One Submission ---');

    const upReplacement = await request('POST', '/api/upload', {
      fileName: 'lab3_raft_simulation_v2_optimized.zip',
      fileType: 'application/zip',
      fileData: dummyZipContent
    }, token1);
    const repFile = upReplacement.body?.file;

    const repRes = await request('POST', '/api/records/lab/lab_003/submit', {
      notes: 'Student 1 resubmitted with optimized heartbeat timeouts',
      file: repFile
    }, token1);
    const repData = repRes.body?.data;

    // Verify Lab 3 changed
    const labChanged = (
      repRes.status === 200 &&
      repData?.submittedFile?.originalName === 'lab3_raft_simulation_v2_optimized.zip' &&
      repData?.studentRemarks === 'Student 1 resubmitted with optimized heartbeat timeouts'
    );
    recordResult('Targeted submission updated with new file', labChanged, `New file: ${repData?.submittedFile?.originalName}`);

    // Verify other 3 submissions were NOT altered
    const checkFaculty = await request('GET', '/api/records/faculty/fa_002', null, token1);
    const checkLearning = await request('GET', '/api/records/learning/lr_003', null, token1);
    const checkPractice = await request('GET', '/api/records/practice/pr_002', null, token1);

    const othersUnchanged = (
      checkFaculty.body?.data?.submittedFile?.originalName === 'faculty_arch_paper.pdf' &&
      checkLearning.body?.data?.submittedFile?.originalName === 'react_cert_verified.pdf' &&
      checkPractice.body?.data?.submittedFile?.originalName === 'leetcode_coin_change.cpp'
    );
    recordResult('Other 3 categories remained completely unaffected by replacement', othersUnchanged, 'All 3 intact');

    // -------------------------------------------------------------------------
    // SCENARIO 6: Open record with NO submission and verify empty state
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 6: Empty Submission State Verification ---');

    const getUnsubmitted = await request('GET', '/api/records/learning/lr_004', null, token1);
    const unData = getUnsubmitted.body?.data;
    const emptyStatePassed = (
      getUnsubmitted.status === 200 &&
      unData?.studentStatus === 'Assigned' &&
      unData?.submittedFile === null &&
      unData?.submissionUrl === null &&
      unData?.studentRemarks === '' &&
      Array.isArray(unData?.submissions) &&
      unData.submissions.length === 0
    );
    recordResult(
      'Unsubmitted record returns genuine empty state (no frame_008.png, no fake remarks)',
      emptyStatePassed,
      `Status: ${unData?.studentStatus}, File: ${unData?.submittedFile}`
    );

    // -------------------------------------------------------------------------
    // SCENARIO 7: Multi-student isolation and access restrictions
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 7: Multi-Student Access Isolation & Privacy ---');

    // Student 2 queries records submitted by Student 1
    const s2Faculty = await request('GET', '/api/records/faculty/fa_002', null, token2);
    const s2Lab = await request('GET', '/api/records/lab/lab_003', null, token2);
    const s2Learning = await request('GET', '/api/records/learning/lr_003', null, token2);
    const s2Practice = await request('GET', '/api/records/practice/pr_002', null, token2);

    const s2SeesEmpty = (
      s2Faculty.body?.data?.studentStatus === 'Assigned' && s2Faculty.body?.data?.submittedFile === null &&
      s2Lab.body?.data?.studentStatus === 'Assigned' && s2Lab.body?.data?.submittedFile === null &&
      s2Learning.body?.data?.studentStatus === 'Assigned' && s2Learning.body?.data?.submittedFile === null &&
      s2Practice.body?.data?.studentStatus === 'Assigned' && s2Practice.body?.data?.submittedFile === null
    );
    recordResult(
      'Student 2 cannot see Student 1 submissions (isolated to Assigned / No submission)',
      s2SeesEmpty,
      'Student 2 sees 0 submissions across all 4 categories'
    );

    // Student 2 attempts to download Student 1's private uploaded file
    const s1FileUrl = updatedF?.submittedFile?.downloadUrl;
    if (s1FileUrl) {
      const s1Filename = s1FileUrl.split('/').pop();
      const s2FileAttempt = await request('GET', `/api/files/${s1Filename}`, null, token2);
      recordResult(
        'Student 2 CANNOT download Student 1 private submission file (403 Forbidden)',
        s2FileAttempt.status === 403,
        `Status: ${s2FileAttempt.status}`
      );
    } else {
      recordResult('Student 1 downloadUrl was available for testing', false, 'Missing downloadUrl');
    }

    // -------------------------------------------------------------------------
    // SCENARIO 8: Persistence across app reload & SQLite verification
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 8: Persistence Verification in SQLite ---');

    const db = new Database(DB_PATH);
    const subRows = db.prepare(`
      SELECT assignment_id, assignment_type, file_name, remarks FROM submissions
      WHERE student_id = ? AND assignment_id IN ('fa_002', 'lab_003', 'lr_003', 'pr_002')
    `).all(student1Id);

    const sqliteCheck = (
      subRows.length === 4 &&
      subRows.some(r => r.assignment_id === 'fa_002' && r.file_name === 'faculty_arch_paper.pdf') &&
      subRows.some(r => r.assignment_id === 'lab_003' && r.file_name === 'lab3_raft_simulation_v2_optimized.zip') &&
      subRows.some(r => r.assignment_id === 'lr_003' && r.file_name === 'react_cert_verified.pdf') &&
      subRows.some(r => r.assignment_id === 'pr_002' && r.file_name === 'leetcode_coin_change.cpp')
    );
    recordResult(
      'Direct SQLite records verified: 4 distinct submissions persist in submissions table',
      sqliteCheck,
      `Found ${subRows.length} rows for Student 1`
    );

    // Verify /api/state returns isolated arrays for Student 1
    const state1 = await request('GET', '/api/state', null, token1);
    const stLab = (state1.body?.data?.labAssignments || []).find(l => l.id === 'lab_003');
    const stFac = (state1.body?.data?.facultyAssignments || []).find(f => f.id === 'fa_002');
    const stateCheck = (
      state1.status === 200 &&
      ['Submitted', 'Late'].includes(stLab?.studentStatus) &&
      stLab?.submittedFile?.originalName === 'lab3_raft_simulation_v2_optimized.zip' &&
      ['Submitted', 'Late'].includes(stFac?.studentStatus) &&
      stFac?.submittedFile?.originalName === 'faculty_arch_paper.pdf'
    );
    recordResult('GET /api/state accurately reflects student submissions upon reload', stateCheck, 'State verified');

    // -------------------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------------------
    db.prepare('DELETE FROM submissions WHERE student_id IN (?, ?)').run(student1Id, student2Id);
    db.prepare('DELETE FROM submissions WHERE assignment_id IN (?, ?)').run(cohortAssignmentId, lateAssignmentId);
    db.prepare('DELETE FROM notifications WHERE title LIKE ?').run(`%${ts}`);
    db.prepare('DELETE FROM assignments WHERE id IN (?, ?, ?)').run(cohortAssignmentId, nonMatchingCreate?.body?.id, lateAssignmentId);
    db.prepare('DELETE FROM student_profiles WHERE user_id IN (?, ?)').run(student1Id, student2Id);
    db.prepare('DELETE FROM sessions WHERE user_id IN (?, ?)').run(student1Id, student2Id);
    db.prepare('DELETE FROM notifications WHERE user_id IN (?, ?)').run(student1Id, student2Id);
    db.prepare('DELETE FROM audit_logs WHERE user_name IN (?, ?)').run('Student 1', 'Student 2');
    db.prepare('DELETE FROM users WHERE id IN (?, ?)').run(student1Id, student2Id);
    db.close();

    // Clean up files uploaded during this test run
    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const uFiles = fs.readdirSync(uploadsDir);
      for (const uf of uFiles) {
        if (uf.includes('faculty_arch_paper') || uf.includes('lab3_raft_simulation') || uf.includes('react_cert_verified') || uf.includes('leetcode_coin_change')) {
          try { fs.unlinkSync(path.join(uploadsDir, uf)); } catch (e) {}
        }
      }
    }

  } catch (err) {
    console.error('Test Suite Exception:', err);
    recordResult('Test Execution', false, err.message);
  }

  console.log('\n================================================================');
  const passedCount = testResults.filter(r => r.passed).length;
  const totalCount = testResults.length;
  console.log(`TOTAL CONSISTENCY TESTS: ${totalCount}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${totalCount - passedCount}`);
  console.log(`SUCCESS RATE: ${Math.round((passedCount / totalCount) * 100)}%`);
  console.log('================================================================');

  if (passedCount === totalCount) {
    console.log('🎉 ALL SUBMISSION CONSISTENCY & ISOLATION TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runSubmissionConsistencyTests();
