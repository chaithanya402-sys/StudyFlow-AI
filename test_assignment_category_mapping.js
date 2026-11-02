/**
 * StudyFlow AI - Category Routing & Mapping End-to-End Verification Suite
 * Tests all 8 categories individually per user specification:
 * 1. General Assignments -> Student Assignments (general)
 * 2. Lab Assignments -> Student Lab Assignments (lab)
 * 3. Coding Practice -> Student Faculty Assignments (faculty)
 * 4. Aptitude Practice -> Student Faculty Assignments (faculty)
 * 5. Project Work -> Student Faculty Assignments (faculty)
 * 6. Placement Preparation -> Student Faculty Assignments (faculty)
 * 7. Learning Records -> Student Learning Records (learning)
 * 8. Practice Records -> Student Practice Records (practice)
 */

const http = require('http');
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'studyflow.db');
const db = new Database(DB_PATH);

// Helper for HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) {}
        resolve({ status: res.statusCode, headers: res.headers, body: data, json });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function parseCookies(resHeaders) {
  const setCookie = resHeaders['set-cookie'];
  if (!setCookie) return '';
  return (Array.isArray(setCookie) ? setCookie : [setCookie])
    .map(c => c.split(';')[0])
    .join('; ');
}

async function runTests() {
  console.log('================================================================');
  console.log('STUDYFLOW AI: 8-CATEGORY ASSIGNMENT ROUTING VERIFICATION SUITE');
  console.log('================================================================\n');

  // Start test server on dynamic port
  const PORT = 3012;
  process.env.PORT = PORT;
  process.env.SESSION_SECRET = 'test_secret_key_cat_mapping_2026';
  const server = require('./server.js');

  await new Promise(r => setTimeout(r, 1200));

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate Faculty (Dr. Rajesh Sharma)
    console.log('--- 1. Faculty Authentication ---');
    const facultyLogin = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'dr.rajesh.mentor@college.edu',
      password: 'mentor2026'
    });
    assert(facultyLogin.status === 200 && facultyLogin.json.success, 'Faculty logged in successfully');
    const facultyCookie = parseCookies(facultyLogin.headers);

    // Ensure fac_001 has standard authorized subjects in place
    // fac_001: Machine Learning & AI, Distributed Systems & Cloud Computing, Data Structures & Algorithms, Computer Science

    // 2. Register & Authenticate CSE 3rd Year Student
    console.log('\n--- 2. Student Authentication ---');
    const stamp = Date.now().toString(36) + '_' + Math.floor(Math.random() * 1000);
    const studentEmail = `student.cse.${stamp}@college.edu`;
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Chaitanya Student',
      email: studentEmail,
      password: 'password123',
      role: 'student',
      department: 'CSE',
      currentYear: '3rd Year',
      branch: 'CSE',
      rollNo: '23CSE' + Math.floor(1000 + Math.random() * 9000)
    });
    assert((regRes.status === 200 || regRes.status === 201) && regRes.json?.success, 'Student registered successfully');
    const studentCookie = parseCookies(regRes.headers);
    const studentToken = regRes.json?.token || '';
    const studentId = regRes.json?.user?.id || '';
    const studentHeaders = {
      'Content-Type': 'application/json',
      'Cookie': studentCookie,
      'Authorization': `Bearer ${studentToken}`
    };

    // Setup academic profile so student target matching has current_year & branch
    await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/student/academic-profile',
      method: 'POST',
      headers: studentHeaders
    }, {
      currentYear: '3rd Year',
      branch: 'CSE',
      department: 'CSE',
      cgpa: 8.9,
      semester: '5th Semester'
    });

    // 3. Define the 8 Categories and their Expected Destinations
    const categoriesToTest = [
      {
        category: 'General Assignments',
        expectedDest: 'general',
        stateKey: 'generalAssignments',
        testTitle: 'Distributed Systems Consensus Models',
        subject: 'Distributed Systems & Cloud Computing'
      },
      {
        category: 'Lab Assignments',
        expectedDest: 'lab',
        stateKey: 'labAssignments',
        testTitle: 'Distributed Systems Raft Consensus Lab',
        subject: 'Distributed Systems & Cloud Computing'
      },
      {
        category: 'Coding Practice',
        expectedDest: 'faculty',
        stateKey: 'facultyAssignments',
        testTitle: 'Binary Search Trees & Dynamic Programming',
        subject: 'Data Structures & Algorithms'
      },
      {
        category: 'Aptitude Practice',
        expectedDest: 'faculty',
        stateKey: 'facultyAssignments',
        testTitle: 'Quantitative Probability & Combinatorics Drill',
        subject: 'Data Structures & Algorithms'
      },
      {
        category: 'Project Work',
        expectedDest: 'faculty',
        stateKey: 'facultyAssignments',
        testTitle: 'Machine Learning Classification Capstone',
        subject: 'Machine Learning & AI'
      },
      {
        category: 'Placement Preparation',
        expectedDest: 'faculty',
        stateKey: 'facultyAssignments',
        testTitle: 'Technical Coding & Data Structures Mock',
        subject: 'Data Structures & Algorithms'
      },
      {
        category: 'Learning Records',
        expectedDest: 'learning',
        stateKey: 'learningRecords',
        testTitle: 'Cloud Computing Architecture Professional Certificate',
        subject: 'Distributed Systems & Cloud Computing'
      },
      {
        category: 'Practice Records',
        expectedDest: 'practice',
        stateKey: 'practiceRecords',
        testTitle: 'LeetCode Graph Traversal 14-Day Challenge',
        subject: 'Data Structures & Algorithms'
      }
    ];

    console.log('\n--- 3. Testing 8 Categories Individually ---');
    const createdAssignments = {};

    for (let i = 0; i < categoriesToTest.length; i++) {
      const item = categoriesToTest[i];
      const stamp = Date.now().toString(36) + '_' + i;
      const title = `[AutoTest ${i+1}] ${item.testTitle} (${stamp})`;

      // A. Create assignment as faculty via POST /api/records/faculty
      const createRes = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/records/faculty',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': facultyCookie
        }
      }, {
        title,
        subject: item.subject,
        category: item.category,
        targetYear: '3rd Year',
        targetClass: 'CSE',
        department: 'CSE',
        maxMarks: 50,
        dueDate: '2026-11-30',
        dueTime: '23:59',
        priority: 'High',
        instructions: `Please complete the ${item.category} task on time.`,
        status: 'Published'
      });

      assert(createRes.status === 201 && createRes.json.success, `Category [${item.category}] created successfully by faculty (ID: ${createRes.json?.id})`);
      const newId = createRes.json.id;
      createdAssignments[item.category] = { id: newId, title };

      // B. Verify database record
      const dbRow = db.prepare('SELECT id, type, category, title FROM assignments WHERE id = ?').get(newId);
      assert(dbRow && dbRow.category === item.category, `Database correctly persists category="${item.category}"`);
      assert(dbRow && dbRow.type === item.expectedDest, `Database sets effective type="${item.expectedDest}" for category="${item.category}"`);
    }

    // 4. Verify Student Portal State and Categorization
    console.log('\n--- 4. Verify Student Portal State & Routing Isolation ---');
    const stateRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/state',
      method: 'GET',
      headers: {
        'Cookie': studentCookie
      }
    });
    assert(stateRes.status === 200 && stateRes.json.success, 'Student retrieved /api/state successfully');
    const state = stateRes.json.data || stateRes.json.state;

    // Check each category destination in state
    for (const item of categoriesToTest) {
      const created = createdAssignments[item.category];
      const targetList = state[item.stateKey] || [];
      const foundInTarget = targetList.some(a => a.id === created.id);
      assert(foundInTarget, `Category [${item.category}] appears in Student ${item.stateKey} list`);

      // Verify it does NOT leak into unintended destination lists
      const otherKeys = ['generalAssignments', 'labAssignments', 'learningRecords', 'practiceRecords']
        .filter(k => k !== item.stateKey);
      if (item.stateKey !== 'facultyAssignments') {
        otherKeys.push('facultyAssignments');
      }

      let leaked = false;
      for (const otherKey of otherKeys) {
        if (Array.isArray(state[otherKey]) && state[otherKey].some(a => a.id === created.id)) {
          leaked = true;
          console.error(`Leak detected: ${created.id} found in ${otherKey}`);
        }
      }
      assert(!leaked, `Category [${item.category}] is isolated and does NOT leak into other assignment lists`);
    }

    // 5. Verify the 4 Faculty Assignment categories appear together in facultyAssignments
    console.log('\n--- 5. Verify Grouping of 4 Categories in Faculty Assignments ---');
    const faCategories = ['Coding Practice', 'Aptitude Practice', 'Project Work', 'Placement Preparation'];
    const faList = state.facultyAssignments || [];
    for (const cat of faCategories) {
      const created = createdAssignments[cat];
      const inFa = faList.find(a => a.id === created.id);
      assert(inFa && inFa.category === cat, `Grouped Faculty Assignment [${cat}] has matching category tag`);
    }

    // 6. Verify REST Endpoints: GET /api/records/:type
    console.log('\n--- 6. Verify REST Endpoints GET /api/records/:type ---');
    // General
    const genRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/records/general',
      method: 'GET',
      headers: { 'Cookie': studentCookie }
    });
    assert(genRes.status === 200 && genRes.json.data.some(a => a.id === createdAssignments['General Assignments'].id), 'GET /api/records/general returns General Assignment');

    // Lab
    const labRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/records/lab',
      method: 'GET',
      headers: { 'Cookie': studentCookie }
    });
    assert(labRes.status === 200 && labRes.json.data.some(a => a.id === createdAssignments['Lab Assignments'].id), 'GET /api/records/lab returns faculty-created Lab Assignment (Bug fixed!)');

    // Faculty
    const facRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/records/faculty',
      method: 'GET',
      headers: { 'Cookie': studentCookie }
    });
    assert(facRes.status === 200 && faCategories.every(cat => facRes.json.data.some(a => a.id === createdAssignments[cat].id)), 'GET /api/records/faculty returns all 4 practice/prep categories together');

    // Learning
    const learnRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/records/learning',
      method: 'GET',
      headers: { 'Cookie': studentCookie }
    });
    assert(learnRes.status === 200 && learnRes.json.data.some(a => a.id === createdAssignments['Learning Records'].id), 'GET /api/records/learning returns Learning Record');

    // Practice
    const pracRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/records/practice',
      method: 'GET',
      headers: { 'Cookie': studentCookie }
    });
    assert(pracRes.status === 200 && pracRes.json.data.some(a => a.id === createdAssignments['Practice Records'].id), 'GET /api/records/practice returns Practice Record');

    // 7. Verify Student Submission across categories
    console.log('\n--- 7. Verify Student Submission Functionality ---');
    const subTarget = createdAssignments['Coding Practice'];
    const submitRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/records/faculty/${subTarget.id}/submit`,
      method: 'POST',
      headers: studentHeaders
    }, {
      notes: 'Implemented AVL Tree self-balancing algorithm with rotation unit tests.',
      submissionUrl: '/api/files/avl_tree_solution.pdf'
    });
    if (submitRes.status !== 200 || !submitRes.json?.success) {
      console.log('Submit error debug:', submitRes.status, submitRes.body);
    }
    assert(submitRes.status === 200 && submitRes.json?.success, `Student submitted solution for ${subTarget.title}`);

    // Verify submission is persisted in database
    const dbSub = db.prepare('SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?').get(subTarget.id, studentId);
    assert(dbSub && dbSub.status === 'Submitted', 'Submission record persisted in SQLite submissions table');

    // 8. Cohort Access Control: A student in 1st Year ECE cannot view this 3rd Year CSE assignment
    console.log('\n--- 8. Cohort Isolation & Access Control ---');
    const otherStudentLogin = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Vikram ECE',
      email: `vikram.ece.${Date.now()}@college.edu`,
      password: 'password123',
      role: 'student',
      department: 'ECE',
      currentYear: '1st Year'
    });
    const otherCookie = parseCookies(otherStudentLogin.headers);
    const otherStateRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/state',
      method: 'GET',
      headers: { 'Cookie': otherCookie }
    });
    const otherState = otherStateRes.json.data || otherStateRes.json.state;
    const sawTarget = (otherState.facultyAssignments || []).some(a => a.id === subTarget.id);
    assert(!sawTarget, 'Cohort Isolation: 1st Year ECE student cannot view 3rd Year CSE assignment');

    console.log('\n================================================================');
    console.log(`TOTAL CATEGORY ROUTING TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log(`SUCCESS RATE: ${Math.round((passed / (passed + failed)) * 100)}%`);
    console.log('================================================================\n');

    if (failed === 0) {
      console.log('🎉 ALL 8 CATEGORY ROUTING & DESTINATION MAPPING TESTS PASSED!');
    } else {
      console.error('❌ SOME TESTS FAILED');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    try { server.close(); } catch (_) {}
    process.exit(failed === 0 ? 0 : 1);
  }
}

runTests();
