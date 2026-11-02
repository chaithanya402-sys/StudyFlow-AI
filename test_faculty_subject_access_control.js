const assert = require('assert');
const { db } = require('./db');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

async function login(email, password) {
  const res = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  });
  assert(res.ok && res.data && res.data.success, `Login failed for ${email}: ${JSON.stringify(res.data)}`);
  return { token: res.data.token, user: res.data.user };
}

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

async function runTests() {
  console.log('================================================================');
  console.log(' STUDYFLOW AI - FACULTY SUBJECT-WISE ACCESS CONTROL TEST SUITE');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------------------
    // Setup / Verification of Seed Mappings
    // -------------------------------------------------------------------------
    console.log('[Setup] Verifying faculty subject assignments in SQLite...');
    const fac1Subjects = db.prepare('SELECT subject FROM faculty_subject_assignments WHERE faculty_id = ?').all('fac_001').map(r => r.subject);
    const fac2Subjects = db.prepare('SELECT subject FROM faculty_subject_assignments WHERE faculty_id = ?').all('fac_002').map(r => r.subject);
    console.log('  fac_001 (Dr. Rajesh Sharma) assigned:', fac1Subjects);
    console.log('  fac_002 (Prof. Anita Rao) assigned:', fac2Subjects);

    assert(fac1Subjects.length > 0, 'fac_001 must have assigned subjects');
    assert(fac2Subjects.includes('Database Management Systems'), 'fac_002 must have Database Management Systems');

    // Authenticate users
    console.log('\n[Auth] Logging in faculty and student users...');
    const fac1 = await login('dr.rajesh.mentor@college.edu', 'mentor2026');
    const fac2 = await login('anita.rao@college.edu', 'mentor2026');
    const officer = await login('placement.cell@college.edu', 'placement2026');

    // Register dynamic 3rd Year CSE student for testing cohort visibility
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const studentEmail = `student.test.${Date.now()}@college.edu`;
    const regRes = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Aarav Sharma (Test Cohort)',
        email: studentEmail,
        password: 'password123',
        confirmPassword: 'password123',
        rollNo: `23CSE${randSuffix}`,
        department: 'CSE',
        currentYear: '3rd Year',
        semester: '5th Semester',
        role: 'student'
      }
    });
    assert(regRes.ok && regRes.data && regRes.data.success, `Student registration failed: ${JSON.stringify(regRes.data)}`);
    const student = { token: regRes.data.token, user: regRes.data.user };
    console.log('  ✓ Authenticated fac_001, fac_002, 3rd Year CSE student (Aarav), and officer');

    // -------------------------------------------------------------------------
    // Test 1: Faculty A (Prof. Anita Rao) sees only DBMS / Web / Crypto assignments
    // -------------------------------------------------------------------------
    console.log('\n[Test 1] Verifying Faculty A (DBMS) state & record filtering...');
    const fac2StateRes = await apiRequest('/api/state', authHeaders(fac2.token));
    assert(fac2StateRes.ok && fac2StateRes.data.success, 'fac_002 failed to fetch state');
    const fac2Assignments = fac2StateRes.data.data.facultyAssignments || [];
    console.log(`  fac_002 retrieved ${fac2Assignments.length} faculty assignments.`);
    for (const a of fac2Assignments) {
      const isAuthorized = fac2Subjects.some(s => s.toLowerCase().includes(a.subject.toLowerCase()) || a.subject.toLowerCase().includes(s.toLowerCase()));
      assert(isAuthorized, `fac_002 saw unauthorized assignment subject: ${a.subject}`);
    }
    console.log('  ✓ Test 1 Passed: Faculty A only sees assignments for assigned subjects.');

    // -------------------------------------------------------------------------
    // Test 2: Faculty B (Dr. Rajesh Sharma) sees only ML / Cloud / DSA assignments
    // -------------------------------------------------------------------------
    console.log('\n[Test 2] Verifying Faculty B (ML/DSA) state & record filtering...');
    const fac1StateRes = await apiRequest('/api/state', authHeaders(fac1.token));
    assert(fac1StateRes.ok && fac1StateRes.data.success, 'fac_001 failed to fetch state');
    const fac1Assignments = fac1StateRes.data.data.facultyAssignments || [];
    console.log(`  fac_001 retrieved ${fac1Assignments.length} faculty assignments.`);
    for (const a of fac1Assignments) {
      const isAuthorized = fac1Subjects.some(s => s.toLowerCase().includes(a.subject.toLowerCase()) || a.subject.toLowerCase().includes(s.toLowerCase()));
      assert(isAuthorized, `fac_001 saw unauthorized assignment subject: ${a.subject}`);
    }
    console.log('  ✓ Test 2 Passed: Faculty B only sees assignments for assigned subjects.');

    // -------------------------------------------------------------------------
    // Test 3: Faculty A creates assignment for an authorized subject (DBMS)
    // -------------------------------------------------------------------------
    console.log('\n[Test 3] Faculty A creating assignment for authorized subject (DBMS)...');
    const dbmsTitle = `DBMS Indexing & Sharding Lab - ${Date.now()}`;
    const createDbmsRes = await apiRequest('/api/records/faculty', {
      method: 'POST',
      ...authHeaders(fac2.token),
      body: {
        title: dbmsTitle,
        subject: 'Database Management Systems',
        category: 'Coding Practice',
        targetYear: '3rd Year',
        targetClass: 'CSE',
        dueDate: '2026-11-20',
        dueTime: '23:59',
        maxMarks: 100,
        instructions: 'Implement B+ Tree Indexing in C++/Python.'
      }
    });
    assert(createDbmsRes.ok && createDbmsRes.data.success, `Failed to create DBMS assignment: ${JSON.stringify(createDbmsRes.data)}`);
    const dbmsAsgId = createDbmsRes.data.id || createDbmsRes.data.data?.id;
    console.log(`  ✓ Test 3 Passed: Faculty A successfully created DBMS assignment (ID: ${dbmsAsgId})`);

    // -------------------------------------------------------------------------
    // Test 4: Faculty A attempts to create assignment for unassigned subject (ML) -> 403
    // -------------------------------------------------------------------------
    console.log('\n[Test 4] Faculty A attempting to create assignment for unassigned subject (ML)...');
    const unauthCreateRes = await apiRequest('/api/records/faculty', {
      method: 'POST',
      ...authHeaders(fac2.token),
      body: {
        title: `Unauthorized ML Assignment - ${Date.now()}`,
        subject: 'Machine Learning & AI',
        category: 'Coding Practice',
        targetYear: '3rd Year',
        targetClass: 'CSE',
        dueDate: '2026-11-20',
        dueTime: '23:59',
        maxMarks: 100,
        instructions: 'Test instructions'
      }
    });
    assert.strictEqual(unauthCreateRes.status, 403, `Expected 403 Forbidden for unassigned subject, got ${unauthCreateRes.status}`);
    console.log(`  ✓ Received expected 403 Forbidden: ${unauthCreateRes.data?.error}`);
    console.log('  ✓ Test 4 Passed: Unassigned subject assignment creation blocked with HTTP 403.');

    // -------------------------------------------------------------------------
    // Test 5: Faculty B attempts to view or update Faculty A's DBMS assignment -> 403
    // -------------------------------------------------------------------------
    console.log('\n[Test 5] Faculty B attempting to access Faculty A\'s DBMS assignment...');
    const getRes = await apiRequest(`/api/records/faculty/${dbmsAsgId}`, authHeaders(fac1.token));
    assert.strictEqual(getRes.status, 403, `Expected 403 for unauthorized GET, got ${getRes.status}`);
    console.log(`  ✓ GET rejected with expected 403 Forbidden: ${getRes.data?.error}`);

    const updateRes = await apiRequest(`/api/records/faculty/${dbmsAsgId}`, {
      method: 'PUT',
      ...authHeaders(fac1.token),
      body: { title: 'Hacked Title' }
    });
    assert.strictEqual(updateRes.status, 403, `Expected 403 for unauthorized PUT, got ${updateRes.status}`);
    console.log(`  ✓ PUT rejected with expected 403 Forbidden: ${updateRes.data?.error}`);
    console.log('  ✓ Test 5 Passed: Cross-faculty assignment access and update strictly blocked.');

    // -------------------------------------------------------------------------
    // Test 6: Student Visibility Preserved (Cohort targeting intact!)
    // -------------------------------------------------------------------------
    console.log('\n[Test 6] Verifying student visibility across all faculty subjects...');
    const studentStateRes = await apiRequest('/api/state', authHeaders(student.token));
    assert(studentStateRes.ok && studentStateRes.data.success, 'Student failed to fetch state');
    const studentAssignments = studentStateRes.data.data.facultyAssignments || [];
    const hasDbms = studentAssignments.some(a => a.id === dbmsAsgId);
    assert(hasDbms, 'Student must see Faculty A\'s DBMS assignment targeted to 3rd Year CSE cohort');
    console.log(`  ✓ Student Aarav Sharma successfully retrieved DBMS assignment (${dbmsAsgId}) among cohort coursework.`);
    console.log('  ✓ Test 6 Passed: Student cohort visibility is fully preserved across faculty.');

    // -------------------------------------------------------------------------
    // Test 7: Student Submits, Faculty A Grades, Faculty B Attempt Blocked
    // -------------------------------------------------------------------------
    console.log('\n[Test 7] Testing submission, authorized grading, and unauthorized cross-grade rejection...');
    const subRes = await apiRequest(`/api/records/faculty/${dbmsAsgId}/submit`, {
      method: 'POST',
      ...authHeaders(student.token),
      body: {
        studentId: student.user.id,
        notes: 'Implemented B+ Tree indexing with page caching.'
      }
    });
    assert(subRes.ok && subRes.data.success, `Student submission failed: ${JSON.stringify(subRes.data)}`);
    console.log('  ✓ Student successfully submitted work for DBMS assignment');

    // Faculty A grades submission
    const gradeRes = await apiRequest(`/api/records/faculty/${dbmsAsgId}/grade`, {
      method: 'POST',
      ...authHeaders(fac2.token),
      body: {
        studentId: student.user.id,
        marks: 95,
        feedback: 'Excellent B+ Tree implementation and node splitting logic.',
        publish: true
      }
    });
    assert(gradeRes.ok && gradeRes.data.success, `Faculty A grading failed: ${JSON.stringify(gradeRes.data)}`);
    console.log('  ✓ Faculty A successfully graded student submission with 95/100 marks');

    // Faculty B attempts to tamper/override evaluation -> 403 Forbidden
    const unauthGradeRes = await apiRequest(`/api/records/faculty/${dbmsAsgId}/grade`, {
      method: 'POST',
      ...authHeaders(fac1.token),
      body: {
        studentId: student.user.id,
        marks: 50,
        feedback: 'Tampered feedback by unauthorized faculty',
        publish: true
      }
    });
    assert.strictEqual(unauthGradeRes.status, 403, `Expected 403 for unauthorized grading, got ${unauthGradeRes.status}`);
    console.log(`  ✓ Grade override rejected with expected 403 Forbidden: ${unauthGradeRes.data?.error}`);
    console.log('  ✓ Test 7 Passed: Evaluation access control and marks integrity confirmed.');

    // -------------------------------------------------------------------------
    // Test 8: Admin (T&P Officer) Subject Allocation API
    // -------------------------------------------------------------------------
    console.log('\n[Test 8] Testing T&P Cell Admin subject allocation endpoints...');
    const adminListRes = await apiRequest('/api/admin/faculty-subjects', authHeaders(officer.token));
    assert(adminListRes.ok && adminListRes.data.success, 'Officer failed to list faculty subjects');
    console.log(`  ✓ Officer listed ${adminListRes.data.data.length} total faculty subject allocations`);

    // Assign new subject to fac_002
    const newSubject = `Advanced Compiler Optimization - ${Date.now()}`;
    const assignRes = await apiRequest('/api/admin/faculty-subjects', {
      method: 'POST',
      ...authHeaders(officer.token),
      body: {
        facultyId: 'fac_002',
        subject: newSubject,
        subjectCode: 'CS602',
        academicYear: '3rd Year'
      }
    });
    assert(assignRes.ok && assignRes.data.success, `Officer failed to assign subject: ${JSON.stringify(assignRes.data)}`);
    console.log(`  ✓ Officer assigned new subject "${newSubject}" to fac_002`);

    // Verify fac_002 now has the subject authorized
    const fac2UpdatedState = await apiRequest('/api/state', authHeaders(fac2.token));
    const assignedSubList = fac2UpdatedState.data?.data?.assignedSubjects || [];
    assert(assignedSubList.includes(newSubject), 'fac_002 state should now include newly assigned subject');
    console.log('  ✓ fac_002 state dynamically updated with new subject allocation');
    console.log('  ✓ Test 8 Passed: Admin subject allocation and live state sync verified.');

    // Clean up test assignment
    db.prepare('DELETE FROM assignment_evaluations WHERE assignment_id = ?').run(dbmsAsgId);
    db.prepare('DELETE FROM submissions WHERE assignment_id = ?').run(dbmsAsgId);
    db.prepare('DELETE FROM assignments WHERE id = ?').run(dbmsAsgId);
    db.prepare('DELETE FROM faculty_subject_assignments WHERE subject = ?').run(newSubject);

    console.log('\n================================================================');
    console.log(' ALL 8 FACULTY SUBJECT-WISE ACCESS CONTROL TESTS PASSED (100%)');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exit(1);
  }
}

runTests();
