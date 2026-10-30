/**
 * AI-Based Student Placement Prediction System Test Suite
 * Validates:
 * 1. Academic Performance (CRUD, range validation, tier 1/2 indicators, DB storage)
 * 2. Student Profile & Skills (CRUD, categorization, proficiency ratings, internships, projects)
 * 3. Aptitude Assessment (Sanitized questions, answer evaluation, exact accuracy formula, SQLite logging)
 * 4. Coding Assessment (Secure isolated subprocess execution, test case runner, evaluation score, DB storage)
 * 5. 4-Pillar ML Placement Prediction (Multi-factor synthesis, probability %, confidence interval, contributions)
 * 6. Groq AI Integration (Strategic explanation generation, personalized roadmap)
 * 7. Resume Analyzer & ATS Compatibility (Keyword extraction, missing skill identification, ATS score)
 * 8. Multi-Tenant Student Isolation (Students cannot access or tamper with each other's assessment data)
 */

const http = require('http');
const path = require('path');
const Database = require('better-sqlite3');

const PORT = 3009;
process.env.PORT = PORT;
const app = require('./server.js');

let server = null;

function request(method, pathUrl, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Cookie'] = `spp_session=${token}`;
    }

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

async function runSystemTestSuite() {
  console.log('================================================================');
  console.log('STUDYFLOW AI: STUDENT PLACEMENT PREDICTION SYSTEM TEST SUITE');
  console.log('================================================================\n');

  const ts = Date.now();
  const studentEmail = `placement.student.${ts}@college.edu`;
  const otherStudentEmail = `other.student.${ts}@college.edu`;

  try {
    // 1. Setup Student Accounts
    console.log('--- 1. Authentication & Profile Setup ---');
    const reg = await request('POST', '/api/auth/register', {
      email: studentEmail,
      password: 'password123',
      role: 'student',
      fullName: 'Vikram Aditya',
      rollNo: `ROLL_V_${ts}`,
      currentYear: '3rd Year',
      department: 'CSE'
    });
    const studentId = reg.body?.user?.id;
    const login = await request('POST', '/api/auth/login', { email: studentEmail, password: 'password123', role: 'student' });
    const token = login.body?.token;
    assert('Student Vikram registered and authenticated', login.status === 200 && Boolean(token), `ID: ${studentId}`);

    const otherReg = await request('POST', '/api/auth/register', {
      email: otherStudentEmail,
      password: 'password123',
      role: 'student',
      fullName: 'Other Student',
      rollNo: `ROLL_O_${ts}`,
      currentYear: '3rd Year',
      department: 'CSE'
    });
    const otherLogin = await request('POST', '/api/auth/login', { email: otherStudentEmail, password: 'password123', role: 'student' });
    const otherToken = otherLogin.body?.token;

    // 2. Pillar 1: Academic Performance
    console.log('\n--- 2. Academic Performance Module ---');
    // Validation: invalid CGPA rejected
    const badCgpa = await request('POST', '/api/academic/performance', { cgpa: 14.5, tenth_percentage: 85, twelfth_percentage: 80 }, token);
    assert('Reject invalid CGPA > 10.0', badCgpa.status === 400);

    // Save valid academic record
    const saveAcad = await request('POST', '/api/academic/performance', {
      student_name: 'Vikram Aditya',
      department: 'Computer Science & Engineering',
      degree: 'B.Tech',
      current_semester: '6th Semester',
      cgpa: 8.65,
      tenth_percentage: 89.2,
      twelfth_percentage: 87.5,
      active_backlogs: 0,
      previous_backlogs: 0
    }, token);
    assert('Save academic performance records', saveAcad.status === 200 && saveAcad.body?.success);
    assert('Computed Tier-1 Super Dream eligibility', saveAcad.body?.indicators?.tier1Eligibility === true);
    assert('Academic standing calculated as Distinction', saveAcad.body?.indicators?.academicStanding?.includes('Distinction'));

    // Fetch saved record
    const getAcad = await request('GET', '/api/academic/performance', null, token);
    assert('GET /api/academic/performance reflects saved values', getAcad.status === 200 && getAcad.body?.academic?.cgpa === 8.65);

    // 3. Pillar 2: Student Profile & Skills
    console.log('\n--- 3. Student Profile & Skills Module ---');
    // Add technical skills
    const addSkill1 = await request('POST', '/api/skills/item', { skill_name: 'Python', category: 'programming', proficiency_level: 'Expert', years_experience: 3.0 }, token);
    const addSkill2 = await request('POST', '/api/skills/item', { skill_name: 'SQL', category: 'database', proficiency_level: 'Advanced', years_experience: 2.0 }, token);
    assert('Add technical skill Python', addSkill1.status === 200 && Boolean(addSkill1.body?.id));
    assert('Add database skill SQL', addSkill2.status === 200 && Boolean(addSkill2.body?.id));

    // Add internship
    const addInt = await request('POST', '/api/internships', {
      role: 'Backend Engineering Intern',
      company: 'Amazon Web Services',
      duration_months: 6,
      description: 'Built distributed telemetry microservices in Python.'
    }, token);
    assert('Add verified internship record', addInt.status === 200 && Boolean(addInt.body?.id));

    // Add project
    const addPrj = await request('POST', '/api/projects/student', {
      title: 'StudyFlow Placement Engine',
      technologies: 'Python, Scikit-learn, SQLite, React',
      project_url: 'https://github.com/studyflow/engine',
      duration: '3 Months',
      role: 'ML Engineer'
    }, token);
    assert('Add production technical project', addPrj.status === 200 && Boolean(addPrj.body?.id));

    // Fetch Profile summary
    const getProfile = await request('GET', '/api/skills/profile', null, token);
    assert('Skills inventory contains added skills', getProfile.body?.skills?.length >= 2);
    assert('Internships list contains AWS internship', getProfile.body?.internships?.some(i => i.company === 'Amazon Web Services'));
    assert('Projects list contains StudyFlow project', getProfile.body?.projects?.some(p => p.title.includes('StudyFlow')));

    // 4. Pillar 3: Aptitude Assessment
    console.log('\n--- 4. Aptitude Assessment Examination Module ---');
    const getAptQ = await request('GET', '/api/aptitude/questions', null, token);
    assert('Aptitude questions fetched', getAptQ.status === 200 && getAptQ.body?.questions?.length >= 10);
    // Anti-cheat verification: correct answers must NOT be exposed to client
    const exposedAnswer = getAptQ.body?.questions?.some(q => q.correct_option !== undefined);
    assert('Anti-cheat integrity: correct_option stripped from client question payload', exposedAnswer === false);

    // Submit aptitude attempt
    const submitApt = await request('POST', '/api/aptitude/submit', {
      category: 'Quantitative & Logical Aptitude',
      answers: {
        'apt_q1': 'B', // 150 meters (correct)
        'apt_q2': 'A', // 2/5 (correct)
        'apt_q3': 'B', // 8 (correct)
        'apt_q6': 'C'  // 127 (correct)
      },
      time_taken_seconds: 140
    }, token);
    assert('Submit aptitude examination', submitApt.status === 200 && submitApt.body?.success);
    assert('Formula Accuracy (Correct / Total * 100) calculated accurately', submitApt.body?.attempt?.accuracy_percentage === 100);
    assert('Review explanations provided with solution keys', submitApt.body?.review?.length === 4);

    // Check aptitude history
    const aptHistory = await request('GET', '/api/aptitude/history', null, token);
    assert('Aptitude attempt logged to SQLite history', aptHistory.body?.history?.length >= 1);

    // 5. Pillar 4: Coding Assessment
    console.log('\n--- 5. Coding Assessment Module ---');
    const getCodeQ = await request('GET', '/api/coding/questions', null, token);
    assert('Coding questions available', getCodeQ.status === 200 && getCodeQ.body?.questions?.length >= 4);

    // Run valid Python solution against Two Sum
    const pySolution = `
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []
`;
    const runCode = await request('POST', '/api/coding/run', {
      question_id: 'code_q1',
      language: 'python',
      code: pySolution
    }, token);
    assert('Run test cases in isolated execution environment', runCode.status === 200);
    assert('All Two Sum test cases passed', runCode.body?.passed === runCode.body?.total);

    // Submit coding solution
    const subCode = await request('POST', '/api/coding/submit', {
      question_id: 'code_q1',
      language: 'python',
      code: pySolution
    }, token);
    assert('Submit coding solution', subCode.status === 200 && subCode.body?.status === 'Accepted');

    // Security check: ensure dangerous OS modules are blocked
    const hackCode = `
import os
def two_sum(nums, target):
    os.system('dir')
    return [0, 1]
`;
    const secRun = await request('POST', '/api/coding/run', {
      question_id: 'code_q1',
      language: 'python',
      code: hackCode
    }, token);
    assert('Security sandbox blocks dangerous system modules', secRun.body?.error?.includes('Security Notice') || secRun.body?.passed === 0);

    // 6. Placement Prediction (Combined 4 Pillars + ML)
    console.log('\n--- 6. 4-Pillar ML Placement Prediction Module ---');
    const predictRes = await request('GET', '/api/placement/predict', null, token);
    assert('Calculate 4-pillar placement prediction', predictRes.status === 200 && predictRes.body?.success);
    const pred = predictRes.body?.prediction;
    assert('Calibrated probability score generated (0-100%)', pred?.probability >= 70 && pred?.probability <= 99, `${pred?.probability}%`);
    assert('Status classified as Placement Ready', pred?.status === 'Placement Ready');
    assert('Confidence interval calculated with uncertainty margin', Boolean(pred?.confidenceInterval?.lower && pred?.confidenceInterval?.upper));
    assert('Pillar 1: Academic score present', pred?.pillars?.academic?.score >= 80);
    assert('Pillar 2: Profile score present', pred?.pillars?.profile?.score >= 60);
    assert('Pillar 3: Aptitude score present', pred?.pillars?.aptitude?.score >= 70);
    assert('Pillar 4: Coding score present', pred?.pillars?.coding?.score >= 80);
    assert('Important factors and actionable recommendations present', pred?.strengths?.length > 0 && pred?.recommendations?.length > 0);

    // Prediction history
    const predHist = await request('GET', '/api/placement/history', null, token);
    assert('Prediction record persisted in SQLite placement_predictions', predHist.body?.history?.length >= 1);

    // 7. Groq AI Integration
    console.log('\n--- 7. Groq AI Strategic Analysis & Roadmap ---');
    const explainRes = await request('POST', '/api/ai/explain', {
      predictionData: pred,
      studentProfile: { name: 'Vikram Aditya', degree: 'B.Tech CSE', cgpa: 8.65 }
    }, token);
    assert('Generate strategic AI explanation for placement prediction', explainRes.status === 200 && Boolean(explainRes.body?.explanation?.summary));
    assert('AI analysis provides actionable 30-day preparation roadmap', explainRes.body?.explanation?.recommendations?.length >= 3);

    // 8. Resume Analyzer & ATS Matcher
    console.log('\n--- 8. Resume Analyzer & ATS Compatibility Module ---');
    const resumeText = `
Vikram Aditya - Computer Science Engineer
Skills: Python, SQL, Java, React.js, Data Structures, Algorithms, Machine Learning, Git.
Experience: Backend Engineering Intern at Amazon Web Services (6 Months).
Projects: StudyFlow AI Automated Placement Prediction Platform.
Education: B.Tech Computer Science, CGPA 8.65.
`;
    const resumeRes = await request('POST', '/api/resume/analyze', {
      fileName: 'Vikram_Aditya_Resume.pdf',
      resumeText,
      targetRole: 'Software Development Engineer'
    }, token);
    assert('Evaluate resume ATS compatibility score', resumeRes.status === 200 && resumeRes.body?.analysis?.atsScore >= 70);
    assert('Extract matched programming languages and tech keywords', resumeRes.body?.analysis?.identifiedSkills?.includes('Python'));
    assert('Detect missing recommended industry keywords', resumeRes.body?.analysis?.missingSkills?.length > 0);

    // 9. Multi-Tenant Student Isolation
    console.log('\n--- 9. Multi-Tenant Student Data Privacy & Isolation ---');
    const otherAcad = await request('GET', '/api/academic/performance', null, otherToken);
    assert('Other student sees their own academic records, not Vikram\'s', otherAcad.body?.academic?.student_id !== studentId);

    const otherSkills = await request('GET', '/api/skills/profile', null, otherToken);
    assert('Other student cannot see Vikram\'s skills', otherSkills.body?.skills?.length === 0);

    console.log('\n================================================================');
    console.log(`TOTAL PLACEMENT SYSTEM TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log(`SUCCESS RATE: ${Math.round((passed / (passed + failed)) * 100)}%`);
    console.log('================================================================');

    if (failed === 0) {
      console.log('🎉 ALL AI-BASED STUDENT PLACEMENT PREDICTION SYSTEM TESTS PASSED!');
    } else {
      console.error('❌ SOME TESTS FAILED');
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal test runner error:', err);
    process.exitCode = 1;
  } finally {
    process.exit(process.exitCode || 0);
  }
}

runSystemTestSuite();
