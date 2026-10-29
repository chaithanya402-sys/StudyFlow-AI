/**
 * Priority 1: Security & Data Isolation Test Suite
 * Comprehensive automated verification for:
 * 1. Login Rate Limiting (5 failed attempts window -> 429 Too Many Requests)
 * 2. Strict Input Validation (invalid email, weak password, illegal role, unauthorized faculty registration)
 * 3. HttpOnly Session Cookies (spp_session issuance, cookie-based authentication, cookie revocation on logout)
 * 4. Multi-Tenant Student Data Isolation (cross-student profile access, task snooping, application snooping, ML history protection)
 * 5. Backend Role Permission Enforcement (Student blocked from directory, grading, mentor notes, drive creation; Faculty/Officer authorized)
 * 6. Isolated GET /api/state per role
 */

const http = require('http');
const path = require('path');
const { db: testDb } = require('./db.js');

const PORT = 3004;
process.env.PORT = PORT;
process.env.NO_AUTO_OPEN = '1';

// Import server
const app = require('./server.js');

function request(method, reqPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      ...headers
    };

    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: reqPath,
      method,
      headers: reqHeaders
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = null;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
          raw: data
        });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function extractCookie(headers, cookieName) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return null;
  const cookieArr = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const c of cookieArr) {
    if (c.startsWith(`${cookieName}=`)) {
      return c.split(';')[0];
    }
  }
  return null;
}

const testResults = [];
function recordResult(testName, passed, details = '') {
  testResults.push({ testName, passed, details });
  const statusStr = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${statusStr}: ${testName} ${details ? '(' + details + ')' : ''}`);
}

async function runSecuritySuite() {
  console.log('================================================================');
  console.log('STUDYFLOW AI: PRIORITY 1 SECURITY & DATA ISOLATION TEST SUITE');
  console.log('================================================================\n');

  try {
    // The static surface is deliberately restricted to the public UI bundle.
    console.log('--- Static File Allowlist Tests ---');
    for (const privatePath of ['/server.js', '/db.js', '/studyflow.db', '/train_placement_models.py', '/scratch/get_creds.js', '/data/records.json', '/uploads/private.pdf', '/.env']) {
      const response = await request('GET', privatePath);
      recordResult(`Private path is not served (${privatePath})`, response.status === 404, `Status: ${response.status}`);
    }
    const publicPage = await request('GET', '/login.html');
    recordResult('Allowlisted login page is served', publicPage.status === 200 && publicPage.raw.includes('<html'), `Status: ${publicPage.status}`);
    const disallowedOrigin = await request('GET', '/login.html', null, { Origin: 'https://untrusted.example' });
    recordResult('CORS omits access for unlisted browser origins', !disallowedOrigin.headers['access-control-allow-origin']);

    // -------------------------------------------------------------
    // SECTION 1: STRICT INPUT VALIDATION
    // -------------------------------------------------------------
    console.log('--- 1. Strict Input Validation Tests ---');

    // Test 1.1: Reject malformed email on registration
    const badEmailReg = await request('POST', '/api/auth/register', {
      email: 'notanemail',
      password: 'password123',
      fullName: 'Test Bad Email',
      role: 'student'
    });
    recordResult('Reject invalid email format on registration', badEmailReg.status === 400 && !!badEmailReg.body?.error, `Status: ${badEmailReg.status}, Message: "${badEmailReg.body?.error}"`);

    // Test 1.2: Reject short password (< 6 chars)
    const shortPwdReg = await request('POST', '/api/auth/register', {
      email: `validuser${Date.now()}@college.edu`,
      password: '123',
      fullName: 'Test Short Password',
      role: 'student'
    });
    recordResult('Reject short password (< 6 chars)', shortPwdReg.status === 400 && shortPwdReg.body?.error?.includes('6'), `Status: ${shortPwdReg.status}, Message: "${shortPwdReg.body?.error}"`);

    // Test 1.3: Reject illegal role (e.g. 'superadmin' or 'admin')
    const badRoleReg = await request('POST', '/api/auth/register', {
      email: `adminspoof${Date.now()}@college.edu`,
      password: 'password123',
      fullName: 'Test Role Spoof',
      role: 'superadmin'
    });
    recordResult('Reject unauthorized/illegal user role', badRoleReg.status === 400 && badRoleReg.body?.error?.toLowerCase().includes('role'), `Status: ${badRoleReg.status}, Message: "${badRoleReg.body?.error}"`);

    // Test 1.4: Reject faculty registration without correct institutional passcode
    const badFacultyReg = await request('POST', '/api/auth/register', {
      email: `facultybadkey${Date.now()}@college.edu`,
      password: 'password123',
      fullName: 'Unauthorized Faculty',
      role: 'faculty',
      facultyKey: 'wrong_key_123'
    });
    recordResult('Reject faculty registration without valid institutional passcode', badFacultyReg.status === 403, `Status: ${badFacultyReg.status}`);

    // -------------------------------------------------------------
    // SECTION 2: LOGIN RATE LIMITING
    // -------------------------------------------------------------
    console.log('\n--- 2. Login Rate Limiting Tests ---');
    const rateLimitTargetEmail = `ratelimittarget${Date.now()}@college.edu`;
    let got429 = false;
    let attemptsCount = 0;

    // Send consecutive invalid attempts to hit the limit
    for (let i = 1; i <= 6; i++) {
      const failedRes = await request('POST', '/api/auth/login', {
        email: rateLimitTargetEmail,
        password: 'wrong_password_attempt',
        role: 'student'
      });
      attemptsCount++;
      if (failedRes.status === 429) {
        got429 = true;
        recordResult(`Login rate limiting triggered at attempt #${i}`, true, `Received HTTP 429 with message: "${failedRes.body?.error}"`);
        break;
      }
    }
    if (!got429) {
      recordResult('Login rate limiting triggered at attempt #6', false, `Status remained non-429 after ${attemptsCount} attempts`);
    }

    // -------------------------------------------------------------
    // SECTION 3: HTTPONLY SESSION COOKIE AUTHENTICATION
    // -------------------------------------------------------------
    console.log('\n--- 3. HttpOnly Session Cookie Tests ---');

    // Register a valid student A
    const studentAEmail = `student.alice.${Date.now()}@college.edu`;
    const regStudentA = await request('POST', '/api/auth/register', {
      email: studentAEmail,
      password: 'StrongPassword123!',
      fullName: 'Alice Johnson',
      role: 'student',
      rollNo: `21CSE${Date.now().toString().slice(-4)}`,
      department: 'CSE'
    });
    const tokenA = regStudentA.body.token;
    const studentAId = regStudentA.body.user.id;
    recordResult('Student Alice registered successfully', regStudentA.status === 201 && !!studentAId, `ID: ${studentAId}`);

    const queryTokenAccess = await request('GET', '/api/state?token=' + encodeURIComponent(tokenA));
    recordResult('Session tokens in query strings are rejected', queryTokenAccess.status === 401, `Status: ${queryTokenAccess.status}`);
    const bodyTokenAccess = await request('POST', '/api/tasks', { token: tokenA, title: 'Token body bypass attempt' });
    recordResult('Session tokens in request bodies are rejected', bodyTokenAccess.status === 401, `Status: ${bodyTokenAccess.status}`);

    // Login Alice and inspect Set-Cookie
    const loginRes = await request('POST', '/api/auth/login', {
      email: studentAEmail,
      password: 'StrongPassword123!',
      role: 'student'
    });
    const cookieHeader = extractCookie(loginRes.headers, 'spp_session');
    const setCookieRaw = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'].join(';') : '';
    const isHttpOnly = setCookieRaw.toLowerCase().includes('httponly');
    const hasSameSite = setCookieRaw.toLowerCase().includes('samesite=');

    recordResult('Login issues spp_session cookie with HttpOnly and SameSite policy', !!cookieHeader && isHttpOnly && hasSameSite, `Cookie: ${cookieHeader ? 'spp_session present' : 'missing'}`);

    // Verify session via Cookie ONLY (no Authorization header)
    const cookieAuthRes = await request('GET', '/api/auth/me', null, {
      'Cookie': cookieHeader
    });
    recordResult('Server authenticates via HttpOnly session cookie without Bearer header', cookieAuthRes.status === 200 && cookieAuthRes.body?.user?.id === studentAId, `Verified User: ${cookieAuthRes.body?.user?.fullName}`);

    // -------------------------------------------------------------
    // SECTION 4: MULTI-TENANT STUDENT DATA ISOLATION
    // -------------------------------------------------------------
    console.log('\n--- 4. Multi-Tenant Student Data Isolation Tests ---');

    // Register Student Bob
    const studentBEmail = `student.bob.${Date.now()}@college.edu`;
    const regStudentB = await request('POST', '/api/auth/register', {
      email: studentBEmail,
      password: 'StrongPassword456!',
      fullName: 'Bob Smith',
      role: 'student',
      rollNo: `21CSE${(Date.now() + 1).toString().slice(-4)}`,
      department: 'CSE'
    });
    const tokenB = regStudentB.body.token;
    const studentBId = regStudentB.body.user.id;
    recordResult('Student Bob registered successfully', regStudentB.status === 201 && !!studentBId, `ID: ${studentBId}`);
    testDb.prepare("UPDATE student_profiles SET current_year = '4th Year', branch = 'IT' WHERE user_id = ?").run(studentBId);
    testDb.prepare("UPDATE users SET department = 'IT' WHERE id = ?").run(studentBId);

    // Test 4.1: Alice cannot view Bob's profile by ID
    const aliceViewsBob = await request('GET', `/api/students/${studentBId}`, null, {
      'Authorization': `Bearer ${tokenA}`
    });
    recordResult('Student Alice CANNOT view Student Bob profile (403 Forbidden)', aliceViewsBob.status === 403, `Status: ${aliceViewsBob.status}`);

    // Test 4.2: Alice CAN view her own profile
    const aliceViewsSelf = await request('GET', `/api/students/${studentAId}`, null, {
      'Authorization': `Bearer ${tokenA}`
    });
    const selfProfile = aliceViewsSelf.body?.profile || aliceViewsSelf.body?.data || aliceViewsSelf.body;
    recordResult('Student Alice CAN view her own profile', aliceViewsSelf.status === 200 && selfProfile?.id === studentAId, `Status: ${aliceViewsSelf.status}, ID: ${selfProfile?.id}`);

    // Test 4.3: Alice cannot modify Bob's profile
    const aliceEditsBob = await request('PUT', `/api/students/${studentBId}`, {
      cgpa: 9.9
    }, {
      'Authorization': `Bearer ${tokenA}`
    });
    recordResult('Student Alice CANNOT update Student Bob profile (403 Forbidden)', aliceEditsBob.status === 403, `Status: ${aliceEditsBob.status}`);

    // Test 4.4: Alice queries tasks with ?studentId=bob -> should be blocked or filtered
    const aliceTasksBob = await request('GET', `/api/tasks?studentId=${studentBId}`, null, {
      'Authorization': `Bearer ${tokenA}`
    });
    recordResult('Student Alice CANNOT query Student Bob tasks by studentId parameter', aliceTasksBob.status === 403 || (aliceTasksBob.status === 200 && aliceTasksBob.body.every(t => t.studentId === studentAId)), `Status: ${aliceTasksBob.status}`);

    // Test 4.5: Alice queries applications with ?studentId=bob -> should be blocked or isolated
    const aliceAppsBob = await request('GET', `/api/applications?studentId=${studentBId}`, null, {
      'Authorization': `Bearer ${tokenA}`
    });
    recordResult('Student Alice CANNOT query Student Bob applications by studentId parameter', aliceAppsBob.status === 403 || (aliceAppsBob.status === 200 && aliceAppsBob.body.every(a => a.studentId === studentAId)), `Status: ${aliceAppsBob.status}`);

    // Test 4.6: Alice cannot access Bob's ML prediction history
    const aliceMlBob = await request('GET', `/api/ml/history/${studentBId}`, null, {
      'Authorization': `Bearer ${tokenA}`
    });
    recordResult('Student Alice CANNOT access Student Bob ML prediction history (403 Forbidden)', aliceMlBob.status === 403, `Status: ${aliceMlBob.status}`);

    // -------------------------------------------------------------
    // SECTION 5: ROLE PERMISSION ENFORCEMENT (Student vs Faculty vs T&P)
    // -------------------------------------------------------------
    console.log('\n--- 5. Backend Role Permission Enforcement Tests ---');

    // Test 5.1: Student Alice CANNOT access Student Directory (/api/students)
    const aliceDirectory = await request('GET', '/api/students', null, {
      'Authorization': `Bearer ${tokenA}`
    });
    recordResult('Student Alice CANNOT access institutional Student Directory (403 Forbidden)', aliceDirectory.status === 403, `Status: ${aliceDirectory.status}`);

    // Test 5.2: Student Alice CANNOT access confidential mentor notes
    const aliceMentorNotes = await request('GET', '/api/mentor-notes', null, {
      'Authorization': `Bearer ${tokenA}`
    });
    recordResult('Student Alice CANNOT access Faculty Mentor Notes (403 Forbidden)', aliceMentorNotes.status === 403, `Status: ${aliceMentorNotes.status}`);

    // Test 5.3: Student Alice CANNOT access Faculty interventions
    const aliceInterventions = await request('GET', '/api/interventions', null, {
      'Authorization': `Bearer ${tokenA}`
    });
    recordResult('Student Alice CANNOT access Faculty Interventions (403 Forbidden)', aliceInterventions.status === 403, `Status: ${aliceInterventions.status}`);

    // Test 5.4: Student Alice CANNOT create a recruitment drive
    const aliceCreateDrive = await request('POST', '/api/drives', {
      company: 'Unauthorized Motors',
      role: 'Software Engineer',
      package: 12
    }, {
      'Authorization': `Bearer ${tokenA}`
    });
    recordResult('Student Alice CANNOT create campus recruitment drives (403 Forbidden)', aliceCreateDrive.status === 403, `Status: ${aliceCreateDrive.status}`);

    // Test 5.5: Student Alice CANNOT grade submissions
    const aliceGrade = await request('POST', '/api/records/lab/sbm_test/grade', {
      score: 100,
      notes: 'Self-graded A+'
    }, {
      'Authorization': `Bearer ${tokenA}`
    });
    recordResult('Student Alice CANNOT grade academic records/submissions (403 Forbidden)', aliceGrade.status === 403, `Status: ${aliceGrade.status}`);

    // -------------------------------------------------------------
    // SECTION 6: AUTHORIZED FACULTY & OFFICER ACTIONS
    // -------------------------------------------------------------
    console.log('\n--- 6. Authorized Faculty & Officer Actions ---');

    // Login as Seeded Faculty Dr. Rajesh Sharma (mentor2026)
    const facLogin = await request('POST', '/api/auth/login', {
      email: 'dr.rajesh.mentor@college.edu',
      password: 'mentor2026',
      role: 'faculty'
    });
    const facToken = facLogin.body?.token;
    recordResult('Faculty Dr. Rajesh logs in successfully', facLogin.status === 200 && !!facToken, `Token: ${facToken ? 'obtained' : 'failed'}`);

    const cohortSuffix = Date.now().toString(36);
    const createCse = await request('POST', '/api/assignments/faculty', {
      title: `CSE cohort check ${cohortSuffix}`, subject: 'Machine Learning', targetYear: '1st Year',
      targetClass: 'CSE', department: 'CSE', dueDate: '2099-12-30', dueTime: '23:59', maxMarks: 50
    }, { Authorization: `Bearer ${facToken}` });
    const createIt = await request('POST', '/api/assignments/faculty', {
      title: `IT cohort check ${cohortSuffix}`, subject: 'Cloud Computing', targetYear: '4th Year',
      targetClass: 'IT', department: 'IT', dueDate: '2099-12-30', dueTime: '23:59', maxMarks: 50
    }, { Authorization: `Bearer ${facToken}` });
    const aliceAssignments = await request('GET', '/api/assignments/faculty', null, { Authorization: `Bearer ${tokenA}` });
    const bobAssignments = await request('GET', '/api/assignments/faculty', null, { Authorization: `Bearer ${tokenB}` });
    const aliceHasCse = aliceAssignments.body?.data?.some(item => item.id === createCse.body?.id);
    const aliceHasIt = aliceAssignments.body?.data?.some(item => item.id === createIt.body?.id);
    const bobHasCse = bobAssignments.body?.data?.some(item => item.id === createCse.body?.id);
    const bobHasIt = bobAssignments.body?.data?.some(item => item.id === createIt.body?.id);
    recordResult('Assignment list filters by student year and class', createCse.status === 201 && createIt.status === 201 && aliceHasCse && !aliceHasIt && !bobHasCse && bobHasIt);
    const aliceDashboard = await request('GET', '/api/state', null, { Authorization: `Bearer ${tokenA}` });
    const bobDashboard = await request('GET', '/api/state', null, { Authorization: `Bearer ${tokenB}` });
    recordResult('Student dashboard assignments use the same cohort filter',
      aliceDashboard.body?.data?.facultyAssignments?.some(item => item.id === createCse.body?.id) && !aliceDashboard.body?.data?.facultyAssignments?.some(item => item.id === createIt.body?.id) &&
      bobDashboard.body?.data?.facultyAssignments?.some(item => item.id === createIt.body?.id) && !bobDashboard.body?.data?.facultyAssignments?.some(item => item.id === createCse.body?.id));
    const targetedNotifications = testDb.prepare('SELECT user_id FROM notifications WHERE title = ?').all(`New Assignment Published: CSE cohort check ${cohortSuffix}`).map(row => row.user_id);
    recordResult('New assignment notification is limited to its matching cohort', targetedNotifications.includes(studentAId) && !targetedNotifications.includes(studentBId));

    const lateAssignment = await request('POST', '/api/assignments/faculty', {
      title: `Late submission check ${cohortSuffix}`, subject: 'Machine Learning', targetYear: '1st Year',
      targetClass: 'CSE', department: 'CSE', dueDate: '2000-01-01', dueTime: '00:00', maxMarks: 20
    }, { Authorization: `Bearer ${facToken}` });
    const facultySubmit = await request('POST', `/api/assignments/faculty/${lateAssignment.body?.id}/submit`, {}, { Authorization: `Bearer ${facToken}` });
    recordResult('Faculty accounts cannot submit student work', facultySubmit.status === 403, `Status: ${facultySubmit.status}`);
    const lateSubmit = await request('POST', `/api/assignments/faculty/${lateAssignment.body?.id}/submit`, { notes: 'Submitted after deadline' }, { Authorization: `Bearer ${tokenA}` });
    recordResult('Late submission is marked late in its saved status', lateSubmit.status === 200 && lateSubmit.body?.data?.submissions?.some(sub => sub.studentId === studentAId && sub.isLate && sub.status === 'Late'));
    const missingStudentGrade = await request('POST', `/api/assignments/faculty/${lateAssignment.body?.id}/grade`, { marks: 10 }, { Authorization: `Bearer ${facToken}` });
    recordResult('Grade requests without studentId are rejected', missingStudentGrade.status === 400, `Status: ${missingStudentGrade.status}`);

    // Faculty CAN access student directory
    const facDirectory = await request('GET', '/api/students', null, {
      'Authorization': `Bearer ${facToken}`
    });
    const studentsList = Array.isArray(facDirectory.body) ? facDirectory.body : (facDirectory.body?.data || []);
    recordResult('Faculty CAN access Student Directory', facDirectory.status === 200 && Array.isArray(studentsList), `Found ${studentsList.length} students`);

    // Faculty CAN view mentor notes
    const facNotes = await request('GET', '/api/mentor-notes', null, {
      'Authorization': `Bearer ${facToken}`
    });
    const notesList = Array.isArray(facNotes.body) ? facNotes.body : (facNotes.body?.data || []);
    recordResult('Faculty CAN access Mentor Notes', facNotes.status === 200 && Array.isArray(notesList), `Found ${notesList.length} notes`);

    // Login as Seeded T&P Officer Prof. S.K. Nair (placement2026)
    const officerLogin = await request('POST', '/api/auth/login', {
      email: 'placement.cell@college.edu',
      password: 'placement2026',
      role: 'officer'
    });
    const officerToken = officerLogin.body?.token;
    recordResult('T&P Officer Prof. Nair logs in successfully', officerLogin.status === 200 && !!officerToken, `Token: ${officerToken ? 'obtained' : 'failed'}`);

    // Officer CAN create recruitment drive
    const driveTitle = `Microsoft Security Drive ${Date.now()}`;
    const officerDrive = await request('POST', '/api/drives', {
      company: 'Microsoft India',
      title: driveTitle,
      role: 'Cloud Security Engineer',
      packageLpa: 16.5,
      minCgpa: 7.5,
      location: 'Hyderabad',
      deadline: '2026-12-31'
    }, {
      'Authorization': `Bearer ${officerToken}`
    });
    recordResult('T&P Officer CAN create recruitment drives', officerDrive.status === 201 || officerDrive.status === 200, `Drive created: ${officerDrive.body?.company || 'OK'}`);

    // -------------------------------------------------------------
    // SECTION 7: ISOLATED GET /api/state
    // -------------------------------------------------------------
    console.log('\n--- 7. Isolated GET /api/state Tests ---');

    // Alice fetches /api/state -> must only contain Alice's profile and isolated arrays
    const aliceState = await request('GET', '/api/state', null, {
      'Authorization': `Bearer ${tokenA}`
    });
    const aliceStudentProfile = aliceState.body?.data?.roles?.student;
    const isStateIsolated = (
      aliceState.status === 200 &&
      aliceStudentProfile &&
      aliceStudentProfile.id === studentAId &&
      aliceStudentProfile.email === studentAEmail
    );
    recordResult('GET /api/state for Student returns strictly own isolated profile', isStateIsolated, `Profile ID in state: ${aliceStudentProfile?.id}`);

    // -------------------------------------------------------------
    // SECTION 8: LOGOUT & SESSION INVALIDATION
    // -------------------------------------------------------------
    console.log('\n--- 8. Session Termination & Revocation Tests ---');

    // Logout Alice and verify session revocation
    const logoutRes = await request('POST', '/api/auth/logout', null, {
      'Cookie': cookieHeader,
      'Authorization': `Bearer ${tokenA}`
    });
    const cookieExpired = logoutRes.headers['set-cookie'] && logoutRes.headers['set-cookie'].some(c => c.includes('Max-Age=0') || c.includes('expires='));
    recordResult('Logout revokes spp_session cookie', logoutRes.status === 200 && cookieExpired, `Status: ${logoutRes.status}`);

    // After logout, tokenA must be rejected with 401
    const postLogoutAccess = await request('GET', '/api/auth/me', null, {
      'Authorization': `Bearer ${tokenA}`
    });
    recordResult('Revoked token is rejected by /api/auth/me (401 Unauthorized)', postLogoutAccess.status === 401, `Status: ${postLogoutAccess.status}`);

    // -------------------------------------------------------------
    // FINAL SUMMARY
    // -------------------------------------------------------------
    console.log('\n================================================================');
    const passedCount = testResults.filter(t => t.passed).length;
    const totalCount = testResults.length;
    console.log(`TOTAL SECURITY TESTS: ${totalCount}`);
    console.log(`PASSED: ${passedCount}`);
    console.log(`FAILED: ${totalCount - passedCount}`);
    console.log(`SUCCESS RATE: ${Math.round((passedCount / totalCount) * 100)}%`);
    console.log('================================================================');

    // -------------------------------------------------------------
    // TEST CLEANUP: PURGE TEMPORARY FIXTURES
    // -------------------------------------------------------------
    try {
      const Database = require('better-sqlite3');
      const path = require('path');
      const cleanDb = new Database(path.join(__dirname, 'data', 'studyflow.db'));
      cleanDb.prepare('DELETE FROM sessions WHERE user_id IN (?, ?)').run(studentAId, studentBId);
      cleanDb.prepare('DELETE FROM student_profiles WHERE user_id IN (?, ?)').run(studentAId, studentBId);
      cleanDb.prepare('DELETE FROM notifications WHERE user_id IN (?, ?)').run(studentAId, studentBId);
      cleanDb.prepare('DELETE FROM notifications WHERE title LIKE ? OR title LIKE ? OR title LIKE ?').run(`%CSE cohort check ${cohortSuffix}`, `%IT cohort check ${cohortSuffix}`, `%Late submission check ${cohortSuffix}`);
      cleanDb.prepare('DELETE FROM assignments WHERE id IN (?, ?, ?)').run(createCse.body?.id, createIt.body?.id, lateAssignment.body?.id);
      cleanDb.prepare('DELETE FROM audit_logs WHERE user_name IN (?, ?)').run('Alice Johnson', 'Bob Smith');
      cleanDb.prepare('DELETE FROM users WHERE id IN (?, ?)').run(studentAId, studentBId);
      cleanDb.close();
    } catch (e) {}

    if (passedCount === totalCount) {
      console.log('🎉 ALL PRIORITY 1 SECURITY & DATA ISOLATION TESTS PASSED!');
      process.exit(0);
    } else {
      console.error('❌ SOME TESTS FAILED. PLEASE REVIEW LOGS ABOVE.');
      process.exit(1);
    }

  } catch (err) {
    console.error('Test suite runtime error:', err);
    process.exit(1);
  }
}

runSecuritySuite();
