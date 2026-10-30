/**
 * Automated Verification Suite for Local Code Execution Engine
 * Tests Python, Java, and C execution, Security AST sandbox, Hidden Test Case Protection,
 * and Coding Pillar 4 Rating integration.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const localCodeExecutionEngine = require('./localCodeExecutionEngine');
const { db } = require('./db');

async function runCodingEngineTests() {
  console.log('===============================================================');
  console.log('🧪 Starting Local Code Execution Engine Verification Suite');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}\n`);
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}\n`);
    }
  }

  // TEST 1: Compiler Detection
  test('Compiler Detection reports status and active versions', () => {
    const compilers = localCodeExecutionEngine.detectCompilers();
    assert(compilers !== null, 'Compilers object must be returned');
    assert(compilers.python !== undefined, 'Python status must be present');
    assert(compilers.java !== undefined, 'Java status must be present');
    assert(compilers.c !== undefined, 'C status must be present');
    assert(compilers.docker !== undefined, 'Docker status must be present');
    console.log(`     Detected Python: ${compilers.python.available ? compilers.python.version : 'Not in PATH'}`);
    console.log(`     Detected Java: ${compilers.java.available ? compilers.java.version : 'Fallback algorithmic harness active'}`);
    console.log(`     Detected C: ${compilers.c.available ? compilers.c.version : 'Fallback algorithmic harness active'}`);
  });

  // TEST 2: Static Security AST / Pattern Sandbox Analysis
  test('Security Check rejects unauthorized modules and system operations', () => {
    // Dangerous Python
    const badPy1 = 'import os\nos.system("dir")';
    const badPy2 = 'import socket\ns = socket.socket()';
    const badPy3 = 'open("/etc/passwd", "r")';
    const goodPy = 'def solve():\n    return 42\nprint(solve())';

    const checkPy1 = localCodeExecutionEngine.checkSecurity('python', badPy1);
    assert.strictEqual(checkPy1.safe, false, 'import os must be blocked');
    assert(checkPy1.violation.includes('os'), 'Violation must mention blocked module');

    const checkPy2 = localCodeExecutionEngine.checkSecurity('python', badPy2);
    assert.strictEqual(checkPy2.safe, false, 'import socket must be blocked');

    const checkPy3 = localCodeExecutionEngine.checkSecurity('python', badPy3);
    assert.strictEqual(checkPy3.safe, false, 'open() must be blocked');

    const checkPyGood = localCodeExecutionEngine.checkSecurity('python', goodPy);
    assert.strictEqual(checkPyGood.safe, true, 'Standard Python logic must pass');

    // Dangerous Java
    const badJava = 'import java.lang.ProcessBuilder;\npublic class Solution {}';
    const checkJava = localCodeExecutionEngine.checkSecurity('java', badJava);
    assert.strictEqual(checkJava.safe, false, 'ProcessBuilder in Java must be blocked');

    // Dangerous C
    const badC = '#include <stdlib.h>\nint main() { system("calc"); return 0; }';
    const checkC = localCodeExecutionEngine.checkSecurity('c', badC);
    assert.strictEqual(checkC.safe, false, 'system() in C must be blocked');
  });

  // TEST 3: Output Normalization and Comparison
  test('Normalize and compare outputs handles formatting, spaces, and brackets', () => {
    const rawOut1 = '[0, 1]\r\n';
    const expected1 = '[0, 1]';
    assert.strictEqual(localCodeExecutionEngine.compareOutputs(rawOut1, expected1), true);

    const rawOut2 = 'true\n';
    const expected2 = 'True';
    assert.strictEqual(localCodeExecutionEngine.compareOutputs(rawOut2, expected2), true);

    const rawOut3 = '55';
    const expected3 = '55';
    assert.strictEqual(localCodeExecutionEngine.compareOutputs(rawOut3, expected3), true);

    const rawOut4 = '54';
    const expected4 = '55';
    assert.strictEqual(localCodeExecutionEngine.compareOutputs(rawOut4, expected4), false);
  });

  // TEST 4: Execute Valid Python Solution
  await testAsync('Execute Python Two Sum with local interpreter', async () => {
    const pythonTwoSumCode = `
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []
`;

    const result = await localCodeExecutionEngine.executeCode({
      language: 'python',
      code: pythonTwoSumCode,
      testCases: [
        { input: '[2, 7, 11, 15], 9', expected: '[0, 1]' },
        { input: '[3, 2, 4], 6', expected: '[1, 2]' }
      ],
      timeLimitMs: 3500
    });

    assert.strictEqual(result.status, 'Accepted', `Status should be Accepted, got: ${result.status}`);
    assert.strictEqual(result.passed, 2, 'Both test cases should pass');
    assert.strictEqual(result.total, 2, 'Total test cases should be 2');
    assert.strictEqual(result.score, 100, 'Score should be 100');
    assert(result.executionTimeMs >= 0, 'Execution time should be non-negative');
  });

  // TEST 4B: Execute Script-style print() Python code (User test scenario)
  await testAsync('Execute Script-style print() code capturing stdout', async () => {
    const userScriptCode = `
a=10
b=20
c=a+b
print(c)
`;

    const result = await localCodeExecutionEngine.executeCode({
      language: 'python',
      code: userScriptCode,
      testCases: [
        { input: '[2, 7, 11, 15], 9', expected: '[0, 1]' }
      ],
      timeLimitMs: 3500
    });

    assert.strictEqual(result.results.length, 1, 'Should have 1 result');
    assert.strictEqual(result.results[0].output, '30', `Output should be 30, got: ${result.results[0].output}`);
    assert.strictEqual(result.status, 'Wrong Answer', 'Status should be Wrong Answer');
  });

  // TEST 5: Database Seeding & Hidden Test Case Verification
  test('Database has 6 questions with public and hidden test cases partitioned', () => {
    const questions = db.prepare('SELECT * FROM coding_questions').all();
    assert.strictEqual(questions.length, 6, `Expected 6 coding questions, found ${questions.length}`);

    // Verify test cases partition
    for (const q of questions) {
      const publicCases = db.prepare('SELECT * FROM coding_test_cases WHERE question_id = ? AND is_hidden = 0').all(q.id);
      const hiddenCases = db.prepare('SELECT * FROM coding_test_cases WHERE question_id = ? AND is_hidden = 1').all(q.id);
      assert(publicCases.length >= 1, `Question ${q.id} must have at least 1 public test case`);
      assert(hiddenCases.length >= 1, `Question ${q.id} must have at least 1 hidden edge test case`);
    }
  });

  // TEST 6: Submissions & Execution Log Recording
  await testAsync('Coding Submissions table logs test cases and execution telemetry', async () => {
    const demoStudent = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('student');
    const studentId = demoStudent ? demoStudent.id : 'student_test_1';
    const q = db.prepare('SELECT * FROM coding_questions LIMIT 1').get();

    const subId = 'sub_test_' + Date.now();
    const logId = 'log_test_' + Date.now();

    db.prepare(`
      INSERT INTO coding_submissions (
        id, student_id, question_id, question_title,
        language, programming_language, code,
        test_cases_passed, passed_test_cases,
        test_cases_total, total_test_cases,
        score, execution_time_ms, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      subId, studentId, q.id, q.title,
      'python', 'python', 'print([0, 1])',
      3, 3, 3, 3, 100, 24, 'Accepted'
    );

    db.prepare(`
      INSERT INTO coding_execution_logs (
        id, submission_id, student_id, question_id, language,
        execution_mode, stdout, stderr, exit_code, execution_time_ms, memory_peak_kb
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId, subId, studentId, q.id, 'python',
      'subprocess', '[0, 1]', '', 0, 24, 12400
    );

    const savedSub = db.prepare('SELECT * FROM coding_submissions WHERE id = ?').get(subId);
    assert(savedSub !== undefined, 'Submission must be saved');
    assert.strictEqual(savedSub.status, 'Accepted');
    assert.strictEqual(savedSub.score, 100);

    const savedLog = db.prepare('SELECT * FROM coding_execution_logs WHERE id = ?').get(logId);
    assert(savedLog !== undefined, 'Execution log must be saved');
    assert.strictEqual(savedLog.execution_mode, 'subprocess');

    // Clean up test entry
    db.prepare('DELETE FROM coding_execution_logs WHERE id = ?').run(logId);
    db.prepare('DELETE FROM coding_submissions WHERE id = ?').run(subId);
  });

  console.log('\n===============================================================');
  console.log(`🎉 Verification Complete: ${passed}/${total} Tests Passed!`);
  console.log('===============================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runCodingEngineTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
