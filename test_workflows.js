const http = require('http');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const PORT = 3003;
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

async function runVerificationSuite() {
  console.log('========================================================');
  console.log('STUDYFLOW SQLITE COMPREHENSIVE VERIFICATION TEST SUITE');
  console.log('========================================================\n');

  let testStudentId = null;
  let testStudentEmail = `test.student.${Date.now()}@college.edu`;
  let createdTaskId = null;
  let createdAsgId = null;
  let createdDriveId = null;

  try {
    // 1. Health check & SQLite DB confirmation
    const health = await request('GET', '/api/health');
    recordResult('Health & Database Verification', health.status === 200 && health.body.database === 'SQLite', `Database: ${health.body.dbFile}`);

    // 2. Authentication: Student Registration
    const regRes = await request('POST', '/api/auth/register', {
      email: testStudentEmail,
      password: 'password123',
      fullName: 'Test Verified Student',
      role: 'student',
      rollNo: '21CSE999',
      department: 'CSE'
    });
    const stdToken = regRes.body.token;
    testStudentId = regRes.body.user?.id;
    recordResult('New Student Registration', regRes.status === 201 && !!stdToken && !!testStudentId, `Student ID: ${testStudentId}`);

    // 3. Student Login Authentication
    const stdLogin = await request('POST', '/api/auth/login', {
      email: testStudentEmail,
      password: 'password123'
    });
    recordResult('Student Login Authentication', stdLogin.status === 200 && !!stdLogin.body.token, `Role: ${stdLogin.body.role}`);

    // 4. Student Setup Profile (CGPA, marks, year, semester)
    const profileRes = await request('POST', '/api/student/academic-profile', {
      currentYear: '4th Year',
      semester: '6th Semester',
      tenthPct: 91.5,
      twelfthPct: 88.0,
      cgpa: 8.5,
      backlogs: 0,
      tenthBoard: 'State Board',
      twelfthBoard: 'State Board'
    }, stdToken);
    recordResult('Student Academic Profile Setup', profileRes.status === 200 && profileRes.body.profile?.cgpa === 8.5, 'CGPA: 8.5, Profile Complete');

    // 5. Authentication: Faculty Login
    const facLogin = await request('POST', '/api/auth/login', {
      email: 'dr.rajesh.mentor@college.edu',
      password: 'mentor2026'
    });
    const facToken = facLogin.body.token;
    recordResult('Faculty Login Authentication', facLogin.status === 200 && !!facToken, `Role: ${facLogin.body.role}`);

    // 6. Authentication: Invalid Password Rejection
    const badLogin = await request('POST', '/api/auth/login', {
      email: testStudentEmail,
      password: 'wrongpassword'
    });
    recordResult('Invalid Credentials Rejection', badLogin.status === 401, 'Correctly denied 401');

    // 7. Authentication: Faculty Registration Security (Passcode required)
    const badReg = await request('POST', '/api/auth/register', {
      email: 'hacker.faculty@college.edu',
      password: 'password123',
      fullName: 'Unauthorized Faculty',
      role: 'faculty',
      facultyKey: 'WRONG_PASSCODE'
    });
    recordResult('Unauthorized Faculty Escalation Prevention', badReg.status === 403, 'Denied unauthorized faculty role');

    // 8. Full Application State Persistence in SQLite (/api/state)
    const stateRes = await request('GET', '/api/state', null, stdToken);
    const hasData = stateRes.body.data && stateRes.body.data.facultyAssignments.length > 0;
    recordResult('Complete SQLite State Fetch (/api/state)', stateRes.status === 200 && hasData, `Assignments: ${stateRes.body.data?.facultyAssignments?.length}`);

    // 9. Task Management: Faculty assigns task to student
    const newTaskTitle = `Prepare SQLite Integration Test Report ${Date.now()}`;
    const taskRes = await request('POST', '/api/tasks', {
      studentId: testStudentId,
      title: newTaskTitle,
      dueDate: '2026-10-31',
      priority: 'High',
      notes: 'Ensure all test results are verified in SQLite.'
    }, facToken);
    createdTaskId = taskRes.body.id;
    recordResult('Faculty Task Assignment', taskRes.status === 201 && !!createdTaskId, `Task ID: ${createdTaskId}`);

    // 10. Task Management: Student toggles task status
    const toggleRes = await request('PUT', `/api/tasks/${createdTaskId}/status`, { status: 'Completed' }, stdToken);
    recordResult('Student Task Status Update', toggleRes.status === 200 && toggleRes.body.status === 'Completed', 'Marked Completed');

    // 11. Assignment Creation: Faculty publishes new assignment
    const asgTitle = `SQLite Architecture Blueprint ${Date.now()}`;
    const newAsg = await request('POST', '/api/records/faculty', {
      title: asgTitle,
      subject: 'Database Systems',
      category: 'System Design',
      targetYear: '4th Year',
      targetClass: 'CSE',
      department: 'CSE',
      description: 'Document SQLite schema, indexes, and concurrency.',
      instructions: 'Submit PDF architecture diagram.',
      dueDate: '2026-11-10',
      maxMarks: 50
    }, facToken);
    createdAsgId = newAsg.body.id;
    recordResult('Faculty Assignment Creation', newAsg.status === 201 && !!createdAsgId, `Assignment ID: ${createdAsgId}`);

    // 12. Student Submission: Student submits assignment
    const submitRes = await request('POST', `/api/records/faculty/${createdAsgId}/submit`, {
      studentId: testStudentId,
      studentName: 'Test Verified Student',
      rollNo: '21CSE999',
      submissionUrl: '/api/files/test_sub.pdf',
      notes: 'Completed SQLite architecture blueprint.'
    }, stdToken);
    recordResult('Student Assignment Submission', submitRes.status === 200 && submitRes.body.data?.studentStatus === 'Submitted', 'Status: Submitted');

    // 13. Faculty Grading: Faculty awards marks and feedback
    const gradeRes = await request('POST', `/api/records/faculty/${createdAsgId}/grade`, {
      marks: 49.5,
      studentId: testStudentId,
      feedback: 'Flawless SQLite architecture design and clear indexing strategy.',
      strengths: 'Comprehensive schema design and strict constraints.',
      improvements: 'None',
      nextSteps: 'Deploy to production.'
    }, facToken);
    recordResult('Faculty Grading & Feedback', gradeRes.status === 200 && gradeRes.body.data?.marks === '49.5 / 50', 'Marks: 49.5 / 50');

    // 14. ML Prediction: Rejection on Missing/Empty Features (No Silent Mock Fallbacks)
    const badMlRes = await request('POST', '/api/ml/predict', {
      studentId: testStudentId
    }, stdToken);
    recordResult('ML Prediction Input Validation', badMlRes.status === 400, 'Correctly rejected missing inputs with 400 Bad Request');

    // 15. ML Prediction: Genuine Computation with Valid Inputs
    const mlRes = await request('POST', '/api/ml/predict', {
      studentId: testStudentId,
      internals: 92,
      quiz: 89,
      cgpa: 8.5,
      assignments: 96,
      attendance: 94
    }, stdToken);
    const predScore = mlRes.body.prediction?.predictedScore;
    const predGrade = mlRes.body.prediction?.grade;
    recordResult('ML Prediction Engine', mlRes.status === 200 && predScore > 0, `Predicted: ${predScore}/100, Grade: ${predGrade}`);

    // 16. ML Prediction History: Retrieve persisted predictions from SQLite
    const mlHist = await request('GET', `/api/ml/history/${testStudentId}`, null, stdToken);
    recordResult('ML Prediction SQLite Persistence', mlHist.status === 200 && mlHist.body.count > 0, `Found ${mlHist.body.count} prediction records`);

    // 17. Campus Drives: Officer creates drive
    const tpoLogin = await request('POST', '/api/auth/login', {
      email: 'placement.cell@college.edu',
      password: 'placement2026'
    });
    const tpoToken = tpoLogin.body.token;

    const driveRes = await request('POST', '/api/drives', {
      company: 'Amazon Web Services',
      role: 'Cloud Support Associate',
      packageLPA: 19.5,
      minCGPA: 7.5,
      maxBacklogs: 0,
      allowedBranches: ['CSE', 'IT'],
      deadline: '2026-11-20',
      openings: 25
    }, tpoToken);
    createdDriveId = driveRes.body.id;
    recordResult('T&P Officer Campus Drive Creation', driveRes.status === 201 && !!createdDriveId, `Drive ID: ${createdDriveId}`);

    // 18. Campus Drives: Student applies to drive
    const applyRes = await request('POST', '/api/applications', {
      driveId: createdDriveId,
      studentId: testStudentId
    }, stdToken);
    const appId = applyRes.body.id;
    recordResult('Student Drive Application', applyRes.status === 201 && !!appId, `App ID: ${appId}`);

    // 19. Marksheet Upload & Document Extraction Preview
    const samplePdfBase64 = Buffer.from('%PDF-1.4 Mock Marksheet Content').toString('base64');
    const uploadRes = await request('POST', '/api/student/marksheet/upload', {
      fileName: 'marksheet_sem5.pdf',
      fileData: samplePdfBase64,
      semester: 'Semester 5',
      academicYear: '3rd Year'
    }, stdToken);
    const hasExtractedSubjects = uploadRes.body.extractedData && Array.isArray(uploadRes.body.extractedData.subjects) && uploadRes.body.extractedData.subjects.length > 0;
    recordResult('Marksheet Upload & Document Extractor Preview', uploadRes.status === 200 && hasExtractedSubjects, `Extracted ${uploadRes.body.extractedData?.subjects?.length} subjects`);

    // 20. Marksheet Verification & SQLite Commitment
    const verifyRes = await request('POST', '/api/student/marksheet/verify', {
      fileName: 'marksheet_sem5.pdf',
      semester: 'Semester 5',
      academicYear: '3rd Year',
      subjects: uploadRes.body.extractedData.subjects,
      cgpa: 8.75,
      attendancePct: 86.0,
      classesAttended: 43,
      classesConducted: 50,
      quizAvg: 82.0,
      internalAvg: 85.0
    }, stdToken);
    recordResult('Student Marksheet Verification & Persistence', verifyRes.status === 200 && verifyRes.body.profile?.cgpa === 8.75, `Verified CGPA: ${verifyRes.body.profile?.cgpa}`);

    // 21. Target A & Target B ML Separation Verification
    const examMlRes = await request('POST', '/api/ml/predict', {
      studentId: testStudentId,
      internals: 85,
      quiz: 82,
      cgpa: 8.75,
      assignments: 90,
      attendance: 86
    }, stdToken);
    const examScore = examMlRes.body.prediction?.predictedScore;
    const examMae = examMlRes.body.prediction?.mae;
    recordResult('Target A: Supervised Ridge Exam Regression', examMlRes.status === 200 && examScore > 0 && examMae === 2.52, `Score: ${examScore}/100, MAE: ±${examMae}`);

    const placeMlRes = await request('POST', '/api/ml/predict-placement', {
      studentId: testStudentId,
      cgpa: 8.75,
      internships: 2,
      projects: 3,
      workshopsCertifications: 2,
      backlogs: 0
    }, stdToken);
    const placeProb = placeMlRes.body.prediction?.probability;
    const placeAcc = placeMlRes.body.prediction?.accuracy;
    recordResult('Target B: Supervised Placement Classification', placeMlRes.status === 200 && placeProb > 0 && placeAcc === 93.75, `Prob: ${placeProb}%, Test Accuracy: ${placeAcc}%`);

    // 22. Incomplete Draft Saving (Saving without required fields)
    const draftRes = await request('POST', '/api/student/academic-profile', {
      currentYear: '2nd Year',
      semester: 'Semester 3',
      isDraft: true
    }, stdToken);
    recordResult('Incomplete Profile Draft Saving', draftRes.status === 200, 'Draft successfully saved without failing validation');

    // 23. Isolated Multi-Account Testing (Account A vs Account B)
    const accBEmail = `account.b.${Date.now()}@college.edu`;
    const accBReg = await request('POST', '/api/auth/register', {
      email: accBEmail,
      password: 'password123',
      fullName: 'Account B Fresh Student',
      role: 'student',
      rollNo: '21CSE888',
      department: 'CSE'
    });
    const accBToken = accBReg.body.token;
    const accBId = accBReg.body.user?.id;

    const accBProfile = await request('GET', '/api/student/academic-profile', null, accBToken);
    const bIsIsolated = accBProfile.body.profile?.cgpa === null &&
                        accBProfile.body.profile?.attendancePct === null &&
                        accBProfile.body.profile?.isProfileComplete === false &&
                        accBProfile.body.profile?.predictionStatus === 'Pending Setup';

    recordResult('Multi-Account Isolation: Account B Empty State', bIsIsolated, 'Account B sees zero records and pending setup; no data leakage from Account A');

    // Account B now adds verified records
    const accBSetup = await request('POST', '/api/student/academic-profile', {
      currentYear: '1st Year',
      semester: 'Semester 2',
      cgpa: 7.8,
      attendancePct: 90.0,
      classesAttended: 45,
      classesConducted: 50,
      quizAvg: 75.0,
      internalAvg: 78.0,
      backlogs: 0,
      isDraft: false
    }, accBToken);

    // Verify Account A is still unaffected
    const accACheck = await request('GET', '/api/student/academic-profile', null, stdToken);
    const aUnaffected = accACheck.body.profile?.cgpa === 8.75 && accBSetup.body.profile?.cgpa === 7.8;
    recordResult('Multi-Account Integrity: Account A Unaffected by Account B Updates', aUnaffected, 'Account A CGPA: 8.75, Account B CGPA: 7.8');

    // 24. Direct SQLite Database Integrity Verification (Checking SQLite file directly)
    const directDb = new Database(DB_PATH, { readonly: true });
    const directTask = directDb.prepare('SELECT status FROM mentor_tasks WHERE id = ?').get(createdTaskId);
    const directAsg = directDb.prepare('SELECT student_status, marks FROM assignments WHERE id = ?').get(createdAsgId);
    const directSub = directDb.prepare('SELECT marks, status FROM submissions WHERE assignment_id = ?').get(createdAsgId);
    const directPred = directDb.prepare('SELECT count(*) as count FROM ml_predictions WHERE student_id = ?').get(testStudentId);
    const directSheet = directDb.prepare('SELECT count(*) as count FROM student_marksheets WHERE student_id = ?').get(testStudentId);
    directDb.close();

    const dbIntact = directTask?.status === 'Completed' &&
                     directAsg?.marks === '49.5 / 50' &&
                     directSub?.marks === 49.5 &&
                     directPred?.count > 0 &&
                     directSheet?.count > 0;

    recordResult('Direct SQLite File Persistence & Verification', dbIntact, 'All records verified directly in data/studyflow.db');

    // 25. Clean up isolated test fixtures to preserve pure database
    const cleanDb = new Database(DB_PATH);
    cleanDb.prepare('DELETE FROM mentor_tasks WHERE id = ?').run(createdTaskId);
    cleanDb.prepare('DELETE FROM assignments WHERE id = ?').run(createdAsgId);
    cleanDb.prepare('DELETE FROM submissions WHERE assignment_id = ?').run(createdAsgId);
    cleanDb.prepare('DELETE FROM ml_predictions WHERE student_id IN (?, ?)').run(testStudentId, accBId);
    cleanDb.prepare('DELETE FROM student_marksheets WHERE student_id IN (?, ?)').run(testStudentId, accBId);
    cleanDb.prepare('DELETE FROM student_subject_marks WHERE student_id IN (?, ?)').run(testStudentId, accBId);
    cleanDb.prepare('DELETE FROM drive_applications WHERE student_id = ?').run(testStudentId);
    cleanDb.prepare('DELETE FROM placement_drives WHERE id = ?').run(createdDriveId);
    cleanDb.prepare('DELETE FROM student_profiles WHERE user_id IN (?, ?)').run(testStudentId, accBId);
    cleanDb.prepare('DELETE FROM users WHERE id IN (?, ?)').run(testStudentId, accBId);
    cleanDb.close();
    recordResult('Isolated Test Data Cleanup', true, 'Purged temporary test users and test fixtures');

    console.log('\n========================================================');
    const allPassed = testResults.every(r => r.passed);
    console.log(`SUMMARY: ${testResults.filter(r => r.passed).length}/${testResults.length} WORKFLOW TESTS PASSED (${allPassed ? '100% SUCCESS' : 'FAILURES DETECTED'})`);
    console.log('========================================================');

    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('Test Suite Failed with Exception:', err);
    process.exit(1);
  }
}

setTimeout(runVerificationSuite, 600);
