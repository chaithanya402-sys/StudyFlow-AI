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

async function runAptitudeVerificationSuite() {
  console.log('================================================================');
  console.log('STUDYFLOW AI: EXCEL APTITUDE QUESTION BANK VERIFICATION SUITE');
  console.log('================================================================\n');

  try {
    // 1. Verify SQLite Question Bank from Excel import
    console.log('--- 1. Database Question Bank Validation ---');
    const quantCount = db.prepare("SELECT COUNT(*) as c FROM aptitude_questions WHERE category LIKE '%Quantitative%'").get().c;
    const logicalCount = db.prepare("SELECT COUNT(*) as c FROM aptitude_questions WHERE category LIKE '%Logical%'").get().c;
    const verbalCount = db.prepare("SELECT COUNT(*) as c FROM aptitude_questions WHERE category LIKE '%Verbal%'").get().c;
    const diCount = db.prepare("SELECT COUNT(*) as c FROM aptitude_questions WHERE category LIKE '%Data Interpretation%'").get().c;
    const techCount = db.prepare("SELECT COUNT(*) as c FROM aptitude_questions WHERE category LIKE '%Technical%'").get().c;
    const totalCount = db.prepare("SELECT COUNT(*) as c FROM aptitude_questions").get().c;

    assert('Quantitative Aptitude has at least 200 questions', quantCount >= 200, `Found ${quantCount}`);
    assert('Logical Reasoning has at least 200 questions', logicalCount >= 200, `Found ${logicalCount}`);
    assert('Verbal Ability has at least 148 questions', verbalCount >= 148, `Found ${verbalCount}`);
    assert('Data Interpretation has at least 100 questions', diCount >= 100, `Found ${diCount}`);
    assert('Technical Aptitude has at least 152 questions', techCount >= 152, `Found ${techCount}`);
    assert('Total Master Question Bank in DB exceeds 1,100 questions', totalCount >= 1100, `Found ${totalCount}`);

    // Check for null or empty options
    const brokenOptions = db.prepare("SELECT COUNT(*) as c FROM aptitude_questions WHERE option_a IS NULL OR option_b IS NULL OR option_c IS NULL OR option_d IS NULL").get().c;
    assert('Zero questions with missing or null options', brokenOptions === 0, `Broken: ${brokenOptions}`);

    // 2. Student Authentication
    console.log('\n--- 2. Multi-Student Examination Setup ---');
    const ts = Date.now();
    const student1Email = `apt.student1.${ts}@college.edu`;
    const student2Email = `apt.student2.${ts}@college.edu`;

    await request('POST', '/api/auth/register', { email: student1Email, password: 'password123', role: 'student', fullName: 'Aarav Sharma', rollNo: `AARAV_${ts}` });
    const login1 = await request('POST', '/api/auth/login', { email: student1Email, password: 'password123', role: 'student' });
    const token1 = login1.body?.token;
    assert('Student 1 (Aarav) authenticated', Boolean(token1));

    await request('POST', '/api/auth/register', { email: student2Email, password: 'password123', role: 'student', fullName: 'Diya Patel', rollNo: `DIYA_${ts}` });
    const login2 = await request('POST', '/api/auth/login', { email: student2Email, password: 'password123', role: 'student' });
    const token2 = login2.body?.token;
    assert('Student 2 (Diya) authenticated', Boolean(token2));

    // 3. Exam Generation: 15 questions, exactly 3 from each category
    console.log('\n--- 3. 15-Question Balanced Exam Generation ---');
    const exam1 = await request('GET', '/api/aptitude/questions', null, token1);
    assert('Exam 1 generated successfully', exam1.status === 200 && exam1.body?.success);
    const qs1 = exam1.body?.questions || [];
    assert('Exam 1 contains exactly 15 questions', qs1.length === 15, `Count: ${qs1.length}`);
    assert('Assessment ID assigned to session', Boolean(exam1.body?.assessment_id));
    assert('15 minutes duration initialized', exam1.body?.duration_seconds === 900);

    // Verify 3 questions per category
    const catMap = {};
    qs1.forEach(q => {
      catMap[q.category] = (catMap[q.category] || 0) + 1;
    });
    console.log('Category distribution in Exam 1:', catMap);
    assert('Quantitative has 3 questions', catMap['Quantitative Aptitude'] === 3);
    assert('Logical Reasoning has 3 questions', catMap['Logical Reasoning'] === 3);
    assert('Verbal Ability has 3 questions', catMap['Verbal Ability'] === 3);
    assert('Data Interpretation has 3 questions', catMap['Data Interpretation'] === 3);
    assert('Technical Aptitude has 3 questions', catMap['Technical Aptitude'] === 3);

    // Anti-cheat verification
    const leaksSecret = qs1.some(q => q._correct_option !== undefined || q.correct_option !== undefined || q.explanation !== undefined);
    assert('Sanitization: No answers or explanations leaked before submission', !leaksSecret);

    // 4. Student-Specific Randomization: Compare Student 1 vs Student 2
    console.log('\n--- 4. Student-Specific Randomization & Isolation ---');
    const exam2 = await request('GET', '/api/aptitude/questions', null, token2);
    const qs2 = exam2.body?.questions || [];
    assert('Exam 2 generated for Student 2 with 15 questions', qs2.length === 15);

    const ids1 = new Set(qs1.map(q => q.id));
    const ids2 = new Set(qs2.map(q => q.id));
    let commonCount = 0;
    ids1.forEach(id => { if (ids2.has(id)) commonCount++; });
    assert('Student 1 and Student 2 receive randomized question sets (not identical)', commonCount < 15, `Common questions: ${commonCount}/15`);

    // 5. Active Session Resumption & Mid-Exam Auto-Save
    console.log('\n--- 5. Active Session Resumption & Auto-Save ---');
    const q1 = qs1[0];
    const q2 = qs1[1];
    const partialAnswers = {};
    partialAnswers[q1.id] = 'B';
    partialAnswers[q2.id] = 'D';

    const saveRes = await request('PUT', `/api/aptitude/assessment/${exam1.body.assessment_id}/save`, { answers: partialAnswers }, token1);
    assert('Incremental answer saving succeeds', saveRes.status === 200 && saveRes.body?.success);

    // Resume exam without restart
    const resumeRes = await request('GET', '/api/aptitude/questions', null, token1);
    assert('Active exam resumes automatically on page refresh', resumeRes.body?.is_resumed === true);
    assert('Saved answers are restored in resumed session', resumeRes.body?.saved_answers?.[q1.id] === 'B');
    assert('Session ID preserved', resumeRes.body?.assessment_id === exam1.body.assessment_id);

    // 6. Examination Submission and Auto-Scoring
    console.log('\n--- 6. Exam Submission & Comprehensive Scoring ---');
    // Fetch backend secrets from SQLite to simulate correct answers for testing
    const sessionRow = db.prepare('SELECT questions_json FROM aptitude_assessments WHERE id = ?').get(exam1.body.assessment_id);
    const examQuestionsWithSecrets = JSON.parse(sessionRow.questions_json);

    // Answer 10 questions correctly, 3 incorrectly, leave 2 unanswered
    const submitAnswers = {};
    examQuestionsWithSecrets.forEach((q, idx) => {
      if (idx < 10) {
        submitAnswers[q.id] = q._correct_option; // Correct
      } else if (idx < 13) {
        // Incorrect
        const wrongOpts = ['A', 'B', 'C', 'D'].filter(o => o !== q._correct_option);
        submitAnswers[q.id] = wrongOpts[0];
      }
      // idx 13, 14 left unanswered
    });

    const submitRes = await request('POST', '/api/aptitude/submit', {
      assessment_id: exam1.body.assessment_id,
      category: 'Placement Aptitude Examination (Excel Question Bank)',
      answers: submitAnswers,
      time_taken_seconds: 480
    }, token1);

    assert('Submit assessment returns HTTP 200', submitRes.status === 200 && submitRes.body?.success);
    const att = submitRes.body?.attempt;
    assert('Total questions equals 15', att?.total_questions === 15);
    assert('Attempted questions equals 13', att?.attempted_questions === 13);
    assert('Correct answers equals 10', att?.correct_answers === 10);
    assert('Incorrect answers equals 3', att?.incorrect_answers === 3);
    assert('Unanswered count equals 2', att?.unanswered_questions === 2);
    assert('Formula accuracy: 10/15 = 66.7%', att?.formula_accuracy === 66.7, `Got: ${att?.formula_accuracy}%`);
    assert('Attempted accuracy: 10/13 = 76.9%', att?.accuracy_percentage === 76.9, `Got: ${att?.accuracy_percentage}%`);

    // Verify 5-Category Breakdown in Attempt Response
    assert('Category breakdown present in attempt response', Boolean(att?.category_scores));
    const catScores = att?.category_scores;
    assert('All 5 Excel categories present in score report', 
      catScores['Quantitative Aptitude'] && 
      catScores['Logical Reasoning'] && 
      catScores['Verbal Ability'] && 
      catScores['Data Interpretation'] && 
      catScores['Technical Aptitude']
    );

    // Solution Review
    const review = submitRes.body?.review || [];
    assert('Review explanations provided for all 15 questions', review.length === 15);
    assert('Review includes student answer, correct answer, and explanation', 
      Boolean(review[0]?.studentAnswer && review[0]?.correctAnswer && review[0]?.explanation)
    );

    // 7. Reattempt Generates Fresh Non-Overlapping Questions
    console.log('\n--- 7. Reattempt Question Set Generation ---');
    const reattemptRes = await request('GET', '/api/aptitude/questions?restart=true', null, token1);
    assert('Reattempt with restart=true succeeds', reattemptRes.status === 200 && reattemptRes.body?.success);
    assert('Reattempt creates new assessment ID', reattemptRes.body?.assessment_id !== exam1.body.assessment_id);
    const reattemptQs = reattemptRes.body?.questions || [];
    assert('Reattempt has 15 questions', reattemptQs.length === 15);

    const reattemptIds = new Set(reattemptQs.map(q => q.id));
    let repeatFromExam1 = 0;
    ids1.forEach(id => { if (reattemptIds.has(id)) repeatFromExam1++; });
    assert('Reattempt excludes previously taken questions from 1100+ question bank', repeatFromExam1 === 0, `Repeated: ${repeatFromExam1}`);

    // 8. Integration with Pillar 3 of 4-Pillar ML Placement Prediction
    console.log('\n--- 8. 4-Pillar ML Placement Prediction Integration ---');
    const predRes = await request('GET', '/api/placement/predict', null, token1);
    assert('Placement prediction calculated for Student 1', predRes.status === 200 && predRes.body?.success);
    const pred = predRes.body?.prediction;
    assert('Pillar 3 (Aptitude) score reflects completed test attempt', pred?.pillars?.aptitude?.score > 0, `Aptitude Pillar Score: ${pred?.pillars?.aptitude?.score}`);
    assert('Aptitude Pillar metric shows logged attempts', pred?.pillars?.aptitude?.metrics?.attempts >= 1, `Attempts: ${pred?.pillars?.aptitude?.metrics?.attempts}`);

    console.log('\n================================================================');
    console.log(`TOTAL APTITUDE EXCEL ENGINE TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log('================================================================\n');

    if (failed === 0) {
      console.log('🎉 ALL EXCEL-BASED APTITUDE ASSESSMENT ENGINE TESTS PASSED!');
    }
  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

runAptitudeVerificationSuite().then(() => process.exit(0));
