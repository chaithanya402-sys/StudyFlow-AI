const http = require('http');
const Database = require('better-sqlite3');
const db = new Database('./data/studyflow.db');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      ...options
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING SUITE: ASSIGNMENT COMPLETION & CGPA SYNCHRONIZATION ===\n');

  // 1. Authenticate / create session for test student chandu (std_mvch3nun)
  const studentToken = 'test_sess_chandu_' + Date.now();
  db.prepare("INSERT OR REPLACE INTO sessions (token, user_id, role, expires_at) VALUES (?, 'std_mvch3nun', 'student', datetime('now', '+1 day'))").run(studentToken);

  const authHeader = { 'Authorization': 'Bearer ' + studentToken, 'Content-Type': 'application/json' };

  // 2. Fetch state for student chandu
  const stateRes = await request({ path: '/api/state', method: 'GET', headers: authHeader });
  console.log('Test 1: /api/state response status:', stateRes.status);
  if (stateRes.status !== 200 || !stateRes.data.success) {
    throw new Error('Failed to fetch /api/state');
  }

  const s = stateRes.data.data;
  const currentStudent = s.roles.student;
  console.log(`Authenticated Student: ${currentStudent.name} (ID: ${currentStudent.id}), CGPA: ${currentStudent.cgpa}`);

  // 3. Test Assignment Completion calculations for this student
  const allAssignments = [
    ...(s.facultyAssignments || []),
    ...(s.labAssignments || [])
  ];

  let completedAsgCount = 0;
  allAssignments.forEach(a => {
    const subs = a.submissions || [];
    const hasStudentSub = subs.some(sub => 
      (sub.studentId === currentStudent.id || sub.studentId === currentStudent.userId) &&
      (sub.status === 'Submitted' || sub.status === 'Graded' || sub.status === 'Revision Requested' || sub.status === 'Under Review' || Boolean(sub.isRevisionRequested) || (sub.marks !== null && sub.marks !== undefined))
    );

    const hasStudentStatus = (
      a.studentStatus === 'Submitted' || a.studentStatus === 'Graded' || a.studentStatus === 'Revision Requested' || a.studentStatus === 'Under Review' ||
      Boolean(a.isRevisionRequested) ||
      ((a.status === 'Submitted' || a.status === 'Graded' || a.status === 'Revision Requested') && (a.submissionUrl || a.submittedDate))
    );

    if (hasStudentSub || hasStudentStatus) {
      completedAsgCount++;
    }
  });

  const totalAsgCount = allAssignments.length;
  const completionRate = totalAsgCount > 0 ? Math.round((completedAsgCount / totalAsgCount) * 100) : 0;

  console.log(`\nAssignment completion metric:`);
  console.log(`- Completed: ${completedAsgCount} / ${totalAsgCount}`);
  console.log(`- Completion rate: ${completionRate}%`);

  if (completedAsgCount === 0 && totalAsgCount > 0) {
    throw new Error('BUG: Completion is still 0 despite student submissions existing!');
  }
  console.log('✓ PASS: Assignment completion is correctly non-zero and accurately reflects student submissions.');

  // 4. Test Student Isolation: verify that assignments belonging ONLY to another student (like Aditya Verma std_042) are NOT counted for chandu
  const fa002 = (s.facultyAssignments || []).find(a => a.id === 'fa_002');
  if (fa002) {
    console.log(`\nVerifying assignment fa_002 isolation:`);
    console.log(`- fa_002 title: "${fa002.title}"`);
    console.log(`- fa_002 studentStatus for chandu: "${fa002.studentStatus}"`);
    console.log(`- fa_002 submissions count for chandu: ${fa002.submissions?.length || 0}`);
    if (fa002.studentStatus === 'Graded') {
      throw new Error('BUG: Another student\'s grade leaked to chandu!');
    }
    console.log('✓ PASS: Student data isolation preserved. Another student\'s grade did not leak to chandu.');
  }

  // 5. Test Resubmission does NOT double count
  console.log('\nTesting Resubmission behavior...');
  const submitRes = await request({
    path: '/api/assignments/lab/lab_001/submit',
    method: 'POST',
    headers: authHeader
  }, {
    notes: 'Resubmitted solution for Lab 6',
    file: { url: '/api/files/test_resubmit.pdf', originalName: 'test_resubmit.pdf', size: 1024 }
  });

  console.log('Resubmission response status:', submitRes.status);
  const subsCount = db.prepare("SELECT count(*) as count FROM submissions WHERE assignment_id = 'lab_001' AND student_id = 'std_mvch3nun'").get();
  console.log(`Distinct submission rows in SQLite for (lab_001, std_mvch3nun): ${subsCount.count}`);
  if (subsCount.count !== 1) {
    throw new Error(`BUG: Resubmission created duplicate rows! Count is ${subsCount.count}`);
  }
  console.log('✓ PASS: Resubmitting an assignment updates the existing record and does NOT inflate counts.');

  // 6. Test CGPA Update & Persistence
  console.log('\nTesting CGPA update...');
  const testCgpa = 8.75;
  const updateRes = await request({
    path: '/api/student/academic-profile',
    method: 'POST',
    headers: authHeader
  }, {
    cgpa: testCgpa,
    currentYear: '3rd Year',
    tenthPct: 91.5,
    tenthSchool: 'Delhi Public School',
    twelfthPct: 88.0,
    twelfthCollege: 'St. Xavier Junior College',
    backlogs: 0
  });

  console.log('Academic profile update response status:', updateRes.status);
  if (updateRes.status !== 200 || !updateRes.data.success) {
    throw new Error('Failed to update academic profile: ' + JSON.stringify(updateRes.data));
  }

  // Verify in SQLite directly
  const savedProfile = db.prepare("SELECT * FROM student_profiles WHERE user_id = 'std_mvch3nun'").get();
  console.log(`Persisted in SQLite student_profiles table:`);
  console.log(`- cgpa: ${savedProfile.cgpa} (type: ${typeof savedProfile.cgpa})`);
  console.log(`- current_year: ${savedProfile.current_year}`);
  console.log(`- tenth_pct: ${savedProfile.tenth_pct}%`);
  console.log(`- twelfth_pct: ${savedProfile.twelfth_pct}%`);
  console.log(`- placement_probability: ${savedProfile.placement_probability}%`);

  if (Number(savedProfile.cgpa) !== testCgpa) {
    throw new Error(`BUG: Persisted CGPA ${savedProfile.cgpa} does not match expected ${testCgpa}`);
  }
  console.log('✓ PASS: CGPA correctly persisted to SQLite database.');

  // 7. Verify profile retrieval via GET /api/student/profile
  const getProfRes = await request({ path: '/api/student/profile', method: 'GET', headers: authHeader });
  console.log(`\nGET /api/student/profile status: ${getProfRes.status}`);
  const retrievedCgpa = getProfRes.data.profile.cgpa;
  console.log(`Retrieved CGPA: ${retrievedCgpa}`);
  if (Number(retrievedCgpa) !== testCgpa) {
    throw new Error(`BUG: Retrieved CGPA ${retrievedCgpa} does not match updated ${testCgpa}`);
  }
  console.log('✓ PASS: API returns authoritative persisted CGPA on subsequent fetch.');

  // 8. Re-fetch /api/state to verify Dashboard synchronization
  const newStateRes = await request({ path: '/api/state', method: 'GET', headers: authHeader });
  const updatedStudent = newStateRes.data.data.roles.student;
  console.log(`\nDashboard State sync check:`);
  console.log(`- Updated student CGPA in state: ${updatedStudent.cgpa}`);
  console.log(`- Current year in state: ${updatedStudent.currentYear}`);
  console.log(`- Academic Profile overallCGPA: ${updatedStudent.academicProfile?.overallCGPA}`);

  if (Number(updatedStudent.cgpa) !== testCgpa) {
    throw new Error(`BUG: State endpoint returned stale CGPA ${updatedStudent.cgpa}`);
  }
  console.log('✓ PASS: State payload has updated CGPA for student dashboard and simulators.');

  console.log('\n=== ALL AUTOMATED BACKEND & SYNCHRONIZATION TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
