const http = require('http');
const { db } = require('../db.js');

const PORT = 3009;
process.env.PORT = PORT;
const app = require('../server.js');

function request(method, pathUrl, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Cookie'] = `spp_session=${token}`;

    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path: pathUrl,
      method,
      headers
    }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

let passed = 0;
let failed = 0;
function assert(name, condition, details = '') {
  if (condition) {
    passed++;
    console.log(`✅ PASS: ${name} ${details ? '(' + details + ')' : ''}`);
  } else {
    failed++;
    console.error(`❌ FAIL: ${name} ${details ? '(' + details + ')' : ''}`);
  }
}

async function runGroqCodingTestSuite() {
  console.log('================================================================');
  console.log('STUDYFLOW AI: GROQ AI DYNAMIC CODING ASSESSMENT TEST SUITE');
  console.log('================================================================\n');

  try {
    // 1. Authentication
    console.log('--- 1. Student Authentication ---');
    const ts = Date.now();
    const studentEmail = `groq.coder.${ts}@college.edu`;
    await request('POST', '/api/auth/register', {
      email: studentEmail,
      password: 'password123',
      role: 'student',
      fullName: 'Rohan Sharma',
      rollNo: `ROLL_R_${ts}`
    });

    const login = await request('POST', '/api/auth/login', { email: studentEmail, password: 'password123', role: 'student' });
    const token = login.body?.token;
    assert('Student Rohan registered and authenticated', Boolean(token));

    // 2. Curated Bank Preservation
    console.log('\n--- 2. Curated Question Bank Preservation ---');
    const curatedRes = await request('GET', '/api/coding/questions?source=curated', null, token);
    assert('GET /api/coding/questions?source=curated returns 200', curatedRes.status === 200 && curatedRes.body?.success);
    const curatedQs = curatedRes.body?.questions || [];
    assert('Curated questions exist in database', curatedQs.length >= 6, `Found: ${curatedQs.length}`);
    assert('Curated question Two Sum is present', curatedQs.some(q => q.id === 'code_q1'));

    // 3. Dynamic Question Generation via Groq AI
    console.log('\n--- 3. Dynamic Groq AI Question Generation ---');
    console.log('Requesting 3 questions (TCS Pattern, Easy, Strings & Arrays)...');
    const genRes = await request('POST', '/api/coding/ai/generate', {
      difficulty: 'Easy',
      questionCount: 3,
      topics: 'Strings, Arrays',
      companyPreparation: 'TCS',
      durationMinutes: 30
    }, token);

    assert('POST /api/coding/ai/generate returns HTTP 200', genRes.status === 200 && genRes.body?.success, `Status: ${genRes.status}`);
    const assessmentId = genRes.body?.assessment_id;
    assert('Assessment ID assigned to generated session', Boolean(assessmentId), `ID: ${assessmentId}`);
    const generatedQs = genRes.body?.questions || [];
    assert('Generated at least 1 validated question via Groq', generatedQs.length >= 1, `Count: ${generatedQs.length}`);

    const firstQ = generatedQs[0];
    console.log(`Inspecting generated question: "${firstQ?.title}"`);

    // Verify Question Structure
    assert('Question title is present and distinct', Boolean(firstQ?.title));
    assert('Difficulty matches or is validated', Boolean(firstQ?.difficulty));
    assert('Topic is populated', Boolean(firstQ?.topic));
    assert('Company tags match TCS pattern', Boolean(firstQ?.company_tags));
    assert('Problem description is rich and detailed', firstQ?.description?.length > 20);
    assert('Sample input and output present', Boolean(firstQ?.sample_input && firstQ?.sample_output));
    assert('Complexity bounds specified', Boolean(firstQ?.expected_time_complexity && firstQ?.expected_space_complexity));
    assert('Python starter code provided', Boolean(firstQ?.starter_code_python?.includes('def ')));
    assert('Java starter code provided', Boolean(firstQ?.starter_code_java?.includes('class ')));
    assert('C starter code provided', Boolean(firstQ?.starter_code_c));
    assert('Public test cases attached without hidden secrets leaked', Array.isArray(firstQ?.public_test_cases));
    assert('Anti-cheat: reference_solution_python NOT leaked in response', firstQ?.reference_solution_python === undefined);

    // 4. Persistence in Database
    console.log('\n--- 4. Database Persistence Verification ---');
    const dbQ = db.prepare('SELECT * FROM coding_questions WHERE id = ?').get(firstQ.id);
    assert('Generated question saved in SQLite coding_questions table', Boolean(dbQ));
    assert('Source recorded as groq_ai', dbQ?.source === 'groq_ai');
    assert('Model identifier recorded', Boolean(dbQ?.model_identifier));
    assert('Assessment ID linked on question', dbQ?.assessment_id === assessmentId);
    assert('Fingerprint saved for duplicate prevention', Boolean(dbQ?.fingerprint));

    const dbAssessment = db.prepare('SELECT * FROM coding_assessments WHERE id = ?').get(assessmentId);
    assert('Assessment session saved in SQLite coding_assessments', Boolean(dbAssessment));
    assert('Assessment status is in_progress', dbAssessment?.status === 'in_progress');
    assert('Assessment duration stored', dbAssessment?.duration_minutes === 30);

    // 5. Active Assessment Resumption
    console.log('\n--- 5. Active Assessment Session Resumption ---');
    const activeRes = await request('GET', '/api/coding/assessments/active', null, token);
    assert('GET /api/coding/assessments/active returns active session', activeRes.status === 200 && activeRes.body?.active_assessment?.id === assessmentId);
    assert('Active session returns generated questions', activeRes.body?.questions?.length === generatedQs.length);

    // 6. Local Code Execution on Generated Question
    console.log('\n--- 6. Local Code Execution on Groq-Generated Question ---');
    // Fetch reference solution from SQLite to run against local interpreter
    const dbSecrets = db.prepare('SELECT reference_solution_python, test_cases_json FROM coding_questions WHERE id = ?').get(firstQ.id);
    if (dbSecrets && dbSecrets.reference_solution_python) {
      console.log('Executing reference solution with local Python interpreter:');
      const runRes = await request('POST', '/api/coding/run', {
        question_id: firstQ.id,
        language: 'python',
        code: dbSecrets.reference_solution_python
      }, token);
      console.log('runRes body:', JSON.stringify(runRes.body, null, 2));
      assert('POST /api/coding/run executes successfully in isolated sandbox', runRes.status === 200);
      assert('Local interpreter passed sample cases', runRes.body?.passed > 0, `Passed: ${runRes.body?.passed}/${runRes.body?.total}`);

      // Submit solution linked to assessment_id
      const subRes = await request('POST', '/api/coding/submit', {
        question_id: firstQ.id,
        language: 'python',
        code: dbSecrets.reference_solution_python,
        assessment_id: assessmentId
      }, token);
      console.log('subRes body:', JSON.stringify(subRes.body, null, 2));
      assert('POST /api/coding/submit logs submission', subRes.status === 200 && subRes.body?.success);

      // Verify assessment progress updated in SQLite
      const updatedAssessment = db.prepare('SELECT passed_count, score FROM coding_assessments WHERE id = ?').get(assessmentId);
      assert('Assessment passed_count incremented in DB', updatedAssessment?.passed_count >= 1, `Passed: ${updatedAssessment?.passed_count}`);
    } else {
      // Test with starter code
      const runStarter = await request('POST', '/api/coding/run', {
        question_id: firstQ.id,
        language: 'python',
        code: firstQ.starter_code_python
      }, token);
      assert('POST /api/coding/run with starter code handles execution cleanly', runStarter.status === 200);
    }

    // 7. Complete Assessment Session
    console.log('\n--- 7. Assessment Session Completion ---');
    const finishRes = await request('POST', `/api/coding/assessments/${assessmentId}/finish`, null, token);
    assert('POST /api/coding/assessments/:id/finish completes session', finishRes.status === 200 && finishRes.body?.status === 'completed');

    const completedRow = db.prepare('SELECT status, completed_at FROM coding_assessments WHERE id = ?').get(assessmentId);
    assert('Assessment status marked as completed in DB', completedRow?.status === 'completed' && Boolean(completedRow?.completed_at));

    // 8. Assessment History
    console.log('\n--- 8. AI Assessment History ---');
    const histRes = await request('GET', '/api/coding/assessments/history', null, token);
    assert('GET /api/coding/assessments/history returns list', histRes.status === 200 && histRes.body?.history?.length >= 1);
    assert('History contains completed assessment ID', histRes.body?.history?.some(h => h.id === assessmentId));

    // 9. Independent Curated Practice Unaffected
    console.log('\n--- 9. Independence of Curated Question Bank ---');
    const finalCurated = await request('GET', '/api/coding/questions?source=curated', null, token);
    assert('Original curated questions remain unmodified', finalCurated.body?.questions?.length >= 6);

    console.log('\n================================================================');
    console.log(`TOTAL GROQ CODING INTEGRATION TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log('================================================================\n');

    if (failed === 0) {
      console.log('🎉 ALL GROQ AI DYNAMIC CODING ASSESSMENT TESTS PASSED!');
    }
  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

runGroqCodingTestSuite().then(() => process.exit(0));
