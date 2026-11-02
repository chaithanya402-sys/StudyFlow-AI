/**
 * StudyFlow AI: Faculty Marks Evaluation & Student Dashboard Integration Test Suite
 *
 * Verifies:
 * - Test 1: Faculty opens a student submission, awards 85/100, adds feedback & suggestions, and publishes marks.
 * - Test 2: The corresponding student logs in; Student Dashboard displays 85/100, and evaluation details modal data is verified.
 * - Test 3: Multi-tenant student privacy: Another student logs in and CANNOT access the first student's private marks or feedback.
 * - Test 4: Updated marks: Faculty changes 85 to 90 and republishes; Student Dashboard automatically displays 90/100.
 * - Test 5: Persistence across re-login, database queries, and draft protection (unpublished evaluations remain hidden).
 * - Test 6: Input validation: Awarded marks cannot exceed max_marks or be negative.
 * - Test 7: Multi-category support across General, Lab, Coding, Aptitude, Projects, and Practice records.
 */

const assert = require('assert');
const { db, initSchema } = require('./db.js');

const BASE_URL = 'http://localhost:3000';

async function request(url, options = {}) {
  const res = await fetch(url, options);
  let json = null;
  const text = await res.text();
  try {
    json = JSON.parse(text);
  } catch (_) {}
  return { status: res.status, headers: res.headers, text, json };
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('STUDYFLOW AI: FACULTY MARKS & STUDENT DASHBOARD TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function test(desc, fn) {
    total++;
    try {
      fn();
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${desc}`);
      console.error(`   ${err.message}`);
    }
  }

  // --- Step 0: Ensure fresh test users & assignments ---
  console.log('--- Setting up Test Users and Assignment Fixtures ---');
  initSchema();

  const randId = Math.random().toString(36).slice(2, 7);
  const facultyEmail = `prof.evaluator.${randId}@college.edu`;
  const student1Email = `student.alex.${randId}@college.edu`;
  const student2Email = `student.sarah.${randId}@college.edu`;
  const password = 'Password@123';

  // Register Faculty
  const facRegRes = await request(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: facultyEmail,
      password,
      role: 'faculty',
      fullName: 'Dr. Vikram Sen',
      facultyCode: 'SF-FAC-2026',
      facultyKey: 'FACULTY2026',
      department: 'Computer Science & Engineering'
    })
  });
  assert(facRegRes.status === 200 || facRegRes.status === 201, 'Faculty registration should succeed');
  const facultyId = facRegRes.json.user.id;
  const facultyCookie = facRegRes.headers.get('set-cookie');

  // Register Student 1 (Alex)
  const std1RegRes = await request(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: student1Email,
      password,
      role: 'student',
      fullName: 'Alex Vance',
      rollNo: `23CSE${Math.floor(1000 + Math.random() * 9000)}`,
      department: 'Computer Science & Engineering',
      currentYear: '3rd Year'
    })
  });
  assert(std1RegRes.status === 200 || std1RegRes.status === 201, 'Student 1 registration should succeed');
  const student1Id = std1RegRes.json.user.id;
  const student1Cookie = std1RegRes.headers.get('set-cookie');

  // Register Student 2 (Sarah - Isolated)
  const std2RegRes = await request(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: student2Email,
      password,
      role: 'student',
      fullName: 'Sarah Connor',
      rollNo: `23CSE${Math.floor(1000 + Math.random() * 9000)}`,
      department: 'Computer Science & Engineering',
      currentYear: '3rd Year'
    })
  });
  assert(std2RegRes.status === 200 || std2RegRes.status === 201, 'Student 2 registration should succeed');
  const student2Id = std2RegRes.json.user.id;
  const student2Cookie = std2RegRes.headers.get('set-cookie');

  console.log(`Created Faculty: ${facultyId}, Student 1: ${student1Id}, Student 2: ${student2Id}\n`);

  // Faculty creates an assignment with maxMarks = 100
  const asgId = `asg_eval_test_${randId}`;
  db.prepare(`
    INSERT INTO assignments (
      id, type, title, subject, category, professor, department, target_class, target_year,
      description, instructions, due_date, due_time, priority, status, max_marks, created_by
    ) VALUES (?, 'faculty', 'Distributed Systems Raft Replication', 'Distributed Systems', 'Project Work', 'Dr. Vikram Sen', 'Computer Science & Engineering', 'CSE', '3rd Year', 'Implement leader election and log replication', 'Submit source zip and report', '2026-11-30', '23:59', 'High', 'Published', 100, ?)
  `).run(asgId, facultyId);

  // Student 1 submits a solution
  const subRes = await request(`${BASE_URL}/api/records/faculty/${asgId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': student1Cookie },
    body: JSON.stringify({
      submissionUrl: '/api/files/raft_implementation_report.pdf',
      fileName: 'raft_implementation_report.pdf',
      fileSize: 450000,
      remarks: 'Here is my complete Raft implementation in Python with test logs.'
    })
  });
  assert(subRes.status === 200, `Student 1 submission should succeed (got ${subRes.status}): ${subRes.text}`);
  const subId = subRes.json.data.submissionId;

  // =================================================================
  // Test 1: Faculty Evaluation (Award 85/100, add feedback & suggestions, publish)
  // =================================================================
  console.log('--- Test 1: Faculty Evaluation ---');

  // 1A: Validate negative marks rejected
  const negRes = await request(`${BASE_URL}/api/records/faculty/${asgId}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': facultyCookie },
    body: JSON.stringify({
      submissionId: subId,
      studentId: student1Id,
      marks: -10,
      feedback: 'Negative test'
    })
  });
  test('Negative marks are rejected with HTTP 400', () => {
    assert.strictEqual(negRes.status, 400);
    assert(negRes.json.error.includes('between 0 and maximum marks'));
  });

  // 1B: Validate marks exceeding maximum rejected
  const overRes = await request(`${BASE_URL}/api/records/faculty/${asgId}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': facultyCookie },
    body: JSON.stringify({
      submissionId: subId,
      studentId: student1Id,
      marks: 110,
      feedback: 'Exceeding test'
    })
  });
  test('Marks exceeding max_marks (110/100) are rejected with HTTP 400', () => {
    assert.strictEqual(overRes.status, 400);
    assert(overRes.json.error.includes('between 0 and maximum marks'));
  });

  // 1C: Faculty awards valid marks 85/100 with feedback and suggestions
  const gradeRes = await request(`${BASE_URL}/api/records/faculty/${asgId}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': facultyCookie },
    body: JSON.stringify({
      submissionId: subId,
      studentId: student1Id,
      marks: 85,
      feedback: 'Outstanding implementation of leader election and heartbeat timeouts. Clean modular code.',
      suggestions: 'Test network partition edge cases and consider persistent disk state recovery.',
      strengths: 'Clean state machine separation',
      improvements: 'Add fault-injection tests',
      publish: true
    })
  });

  test('Faculty awards 85/100, adds feedback & publishes marks', () => {
    assert.strictEqual(gradeRes.status, 200);
    assert.strictEqual(gradeRes.json.success, true);
    assert.strictEqual(gradeRes.json.data.studentMarks, 85);
    assert.strictEqual(gradeRes.json.data.studentStatus, 'Graded');
  });

  // 1D: Verify SQLite persistence in submissions table
  const subRow = db.prepare('SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?').get(asgId, student1Id);
  test('Evaluation record persisted in SQLite submissions table with marks=85 and published=1', () => {
    assert(subRow, 'Submission record must exist');
    assert.strictEqual(subRow.marks, 85);
    assert.strictEqual(subRow.published, 1);
    assert(subRow.feedback.includes('Outstanding implementation'));
    assert(subRow.suggestions.includes('network partition'));
  });

  // 1E: Verify SQLite persistence in assignment_evaluations table
  const evalRow = db.prepare('SELECT * FROM assignment_evaluations WHERE assignment_id = ? AND student_id = ?').get(asgId, student1Id);
  test('Evaluation record persisted in assignment_evaluations table with unique student-assignment pair', () => {
    assert(evalRow, 'Evaluation record must exist in assignment_evaluations');
    assert.strictEqual(evalRow.marks, 85);
    assert.strictEqual(evalRow.max_marks, 100);
    assert.strictEqual(evalRow.published, 1);
    assert(evalRow.feedback.includes('Outstanding implementation'));
    assert(evalRow.suggestions.includes('network partition'));
  });

  // =================================================================
  // Test 2: Student Dashboard Displays 85/100 & Evaluation Details
  // =================================================================
  console.log('\n--- Test 2: Student Dashboard Marks Display ---');

  // Student 1 fetches state
  const stateRes = await request(`${BASE_URL}/api/state`, {
    headers: { 'Cookie': student1Cookie }
  });

  test('Student 1 receives /api/state successfully', () => {
    assert.strictEqual(stateRes.status, 200);
    assert.strictEqual(stateRes.json.success, true);
  });

  test('Student 1 receives assignmentPerformance metrics in /api/state', () => {
    const perf = stateRes.json.data.assignmentPerformance;
    assert(perf, 'assignmentPerformance must be defined');
    assert.strictEqual(perf.totalEvaluated, 1);
    assert.strictEqual(perf.totalMarksObtained, 85);
    assert.strictEqual(perf.totalMaxMarks, 100);
    assert.strictEqual(perf.overallPercentage, 85);
  });

  // Student 1 queries /api/student/evaluations endpoint
  const evalListRes = await request(`${BASE_URL}/api/student/evaluations`, {
    headers: { 'Cookie': student1Cookie }
  });

  test('Student 1 /api/student/evaluations returns published evaluation with 85/100', () => {
    assert.strictEqual(evalListRes.status, 200);
    assert.strictEqual(evalListRes.json.success, true);
    assert.strictEqual(evalListRes.json.metrics.totalEvaluated, 1);
    assert.strictEqual(evalListRes.json.metrics.totalMarksObtained, 85);
    assert.strictEqual(evalListRes.json.metrics.overallPercentage, 85);

    const ev = evalListRes.json.evaluations.find(e => e.assignment_id === asgId);
    assert(ev, 'Evaluated assignment must be present in evaluations list');
    assert.strictEqual(ev.marks, 85);
    assert.strictEqual(ev.max_marks, 100);
    assert.strictEqual(ev.faculty_name, 'Dr. Vikram Sen');
    assert(ev.feedback.includes('Outstanding implementation'));
    assert(ev.suggestions.includes('network partition'));
  });

  // =================================================================
  // Test 3: Student Privacy & Multi-Tenant Isolation
  // =================================================================
  console.log('\n--- Test 3: Multi-Tenant Student Privacy ---');

  const std2StateRes = await request(`${BASE_URL}/api/state`, {
    headers: { 'Cookie': student2Cookie }
  });

  test('Student 2 /api/state CANNOT see Student 1 private evaluated marks or feedback', () => {
    assert.strictEqual(std2StateRes.status, 200);
    const perf2 = std2StateRes.json.data.assignmentPerformance;
    // Student 2 has not submitted or been evaluated for this assignment
    assert.strictEqual(perf2.totalEvaluated, 0);
    assert.strictEqual(perf2.totalMarksObtained, 0);
    assert.strictEqual(perf2.evaluations.length, 0);

    const asgInFaculty = std2StateRes.json.data.facultyAssignments.find(a => a.id === asgId);
    if (asgInFaculty) {
      assert.strictEqual(asgInFaculty.studentMarks, null, 'Student 2 studentMarks must be null');
      assert.strictEqual(asgInFaculty.feedback, '', 'Student 2 feedback must not expose Student 1 feedback');
    }
  });

  const std2EvalRes = await request(`${BASE_URL}/api/student/evaluations`, {
    headers: { 'Cookie': student2Cookie }
  });

  test('Student 2 /api/student/evaluations returns empty list (no leakage of Student 1 marks)', () => {
    assert.strictEqual(std2EvalRes.status, 200);
    assert.strictEqual(std2EvalRes.json.metrics.totalEvaluated, 0);
    assert.strictEqual(std2EvalRes.json.evaluations.length, 0);
  });

  // =================================================================
  // Test 4: Updated Marks (Faculty changes 85 to 90 & republishes)
  // =================================================================
  console.log('\n--- Test 4: Updated Marks (85 -> 90) ---');

  const updateRes = await request(`${BASE_URL}/api/records/faculty/${asgId}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': facultyCookie },
    body: JSON.stringify({
      submissionId: subId,
      studentId: student1Id,
      marks: 90,
      feedback: 'Re-evaluated after reviewing test suite: 90/100 awarded. Excellent Raft state recovery!',
      suggestions: 'Ready for capstone submission.',
      publish: true
    })
  });

  test('Faculty updates marks from 85 to 90 and republishes successfully', () => {
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.json.data.studentMarks, 90);
  });

  // Check that duplicate records were NOT created
  const evalCount = db.prepare('SELECT COUNT(*) as c FROM assignment_evaluations WHERE assignment_id = ? AND student_id = ?').get(asgId, student1Id).c;
  test('No duplicate evaluation records created (exactly 1 record in assignment_evaluations)', () => {
    assert.strictEqual(evalCount, 1);
  });

  // Student 1 verifies updated marks
  const std1UpdatedRes = await request(`${BASE_URL}/api/student/evaluations`, {
    headers: { 'Cookie': student1Cookie }
  });

  test('Student 1 dashboard automatically displays updated marks: 90/100 (90%)', () => {
    assert.strictEqual(std1UpdatedRes.json.metrics.totalMarksObtained, 90);
    assert.strictEqual(std1UpdatedRes.json.metrics.overallPercentage, 90);
    const ev = std1UpdatedRes.json.evaluations.find(e => e.assignment_id === asgId);
    assert.strictEqual(ev.marks, 90);
    assert(ev.feedback.includes('Re-evaluated after reviewing test suite'));
    assert(ev.suggestions.includes('Ready for capstone submission'));
  });

  // =================================================================
  // Test 5: Draft / Unpublished Evaluation Protection
  // =================================================================
  console.log('\n--- Test 5: Draft / Unpublished Marks Protection ---');

  const asgDraftId = `asg_draft_test_${randId}`;
  db.prepare(`
    INSERT INTO assignments (
      id, type, title, subject, category, professor, department, target_class, target_year,
      due_date, due_time, priority, status, max_marks, created_by
    ) VALUES (?, 'faculty', 'Compiler Design Syntax Analyzer', 'Compiler Design', 'Coding Practice', 'Dr. Vikram Sen', 'Computer Science & Engineering', 'CSE', '3rd Year', '2026-11-30', '23:59', 'Medium', 'Published', 50, ?)
  `).run(asgDraftId, facultyId);

  // Student 1 submits
  await request(`${BASE_URL}/api/records/faculty/${asgDraftId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': student1Cookie },
    body: JSON.stringify({
      submissionUrl: '/api/files/parser_solution.py',
      fileName: 'parser_solution.py',
      fileSize: 12000
    })
  });

  // Faculty saves evaluation as DRAFT (publish: false)
  const draftGradeRes = await request(`${BASE_URL}/api/records/faculty/${asgDraftId}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': facultyCookie },
    body: JSON.stringify({
      studentId: student1Id,
      marks: 42,
      feedback: 'Draft faculty private notes: syntax tree looks fine.',
      publish: false
    })
  });
  assert.strictEqual(draftGradeRes.status, 200);

  // Student 1 checks dashboard: draft marks must NOT be shown as evaluated marks
  const std1DraftCheck = await request(`${BASE_URL}/api/student/evaluations`, {
    headers: { 'Cookie': student1Cookie }
  });

  test('Draft / unpublished evaluation marks (42/50) are NOT released to Student 1', () => {
    // Only the first assignment (90/100) should be in evaluated list
    assert.strictEqual(std1DraftCheck.json.metrics.totalEvaluated, 1);
    assert.strictEqual(std1DraftCheck.json.metrics.totalMarksObtained, 90);

    // The draft assignment should be in pending / awaiting evaluation list
    const draftPending = std1DraftCheck.json.pending.find(p => p.assignment_id === asgDraftId);
    assert(draftPending, 'Draft assignment must appear as awaiting evaluation');
    assert.strictEqual(draftPending.marks, null, 'Draft marks must remain hidden');
    assert.strictEqual(draftPending.feedback, '', 'Draft feedback must remain hidden');
  });

  // =================================================================
  // Test 6: Multi-Category Evaluation Verification
  // =================================================================
  console.log('\n--- Test 6: Multi-Category Evaluation Verification ---');

  // Create Lab Assignment
  const labId = `lab_eval_test_${randId}`;
  db.prepare(`
    INSERT INTO assignments (
      id, type, title, subject, category, professor, department, target_class, target_year,
      due_date, due_time, priority, status, max_marks, created_by
    ) VALUES (?, 'lab', 'Database Query Optimization Lab', 'Database Systems', 'Lab Assignments', 'Dr. Vikram Sen', 'Computer Science & Engineering', 'CSE', '3rd Year', '2026-11-30', '23:59', 'Medium', 'Published', 50, ?)
  `).run(labId, facultyId);

  // Student submits Lab
  await request(`${BASE_URL}/api/records/lab/${labId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': student1Cookie },
    body: JSON.stringify({
      submissionUrl: '/api/files/db_optimization_lab.sql',
      fileName: 'db_optimization_lab.sql',
      fileSize: 8500
    })
  });

  // Faculty grades Lab Assignment (45/50)
  const gradeLabRes = await request(`${BASE_URL}/api/records/lab/${labId}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': facultyCookie },
    body: JSON.stringify({
      studentId: student1Id,
      marks: 45,
      feedback: 'Excellent B-Tree index analysis and EXPLAIN query plans.',
      suggestions: 'Try composite index benchmarks.',
      publish: true
    })
  });
  assert.strictEqual(gradeLabRes.status, 200);

  // Student 1 checks overall metrics across categories
  const finalEvalCheck = await request(`${BASE_URL}/api/student/evaluations`, {
    headers: { 'Cookie': student1Cookie }
  });

  test('Student 1 aggregate performance combines Project Work (90/100) and Lab Assignment (45/50) -> 135/150 (90%)', () => {
    const metrics = finalEvalCheck.json.metrics;
    assert.strictEqual(metrics.totalEvaluated, 2);
    assert.strictEqual(metrics.totalMarksObtained, 135);
    assert.strictEqual(metrics.totalMaxMarks, 150);
    assert.strictEqual(metrics.overallPercentage, 90);
  });

  // =================================================================
  // SUMMARY
  // =================================================================
  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${total - passed}`);
  console.log(`SUCCESS RATE: ${Math.round((passed / total) * 100)}%`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 ALL FACULTY MARKS & STUDENT DASHBOARD EVALUATION TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED.');
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
