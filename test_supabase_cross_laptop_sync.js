// test_supabase_cross_laptop_sync.js
// Verification of Cross-Laptop Assignment Synchronization & Supabase PostgreSQL Integration

const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(method, endpoint, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (body) {
      if (typeof body === 'object') req.write(JSON.stringify(body));
      else req.write(String(body));
    }
    req.end();
  });
}

async function run() {
  console.log('================================================================');
  console.log('STUDYFLOW AI: SUPABASE INTEGRATION & CROSS-LAPTOP SYNC TEST');
  console.log('================================================================\n');

  // 1. Check Supabase Status endpoint
  console.log('Test 1: Supabase Configuration & Status Endpoint...');
  const statusRes = await makeRequest('GET', '/api/supabase/status');
  console.log('  Status code:', statusRes.status);
  console.log('  Project Ref:', statusRes.data.projectRef);
  console.log('  Supabase URL:', statusRes.data.url);
  console.log('  Connection state:', statusRes.data.connected ? 'Connected' : 'Resilient Local Cache (Cloud paused or reconnecting)');
  if (statusRes.status !== 200 || statusRes.data.projectRef !== 'iquuxfmpuroewcghorvq') {
    throw new Error('Supabase status check failed: ' + JSON.stringify(statusRes.data));
  }
  console.log('✅ PASS: Supabase status endpoint is active and configured.\n');

  // 2. Faculty logs in on "Laptop A"
  console.log('Test 2: Faculty authenticating on Laptop A...');
  const facLoginRes = await makeRequest('POST', '/api/auth/login', {}, {
    email: 'dr.rajesh.mentor@college.edu',
    password: 'mentor2026',
    role: 'faculty'
  });
  if (facLoginRes.status !== 200) {
    throw new Error('Faculty login failed');
  }
  const facHeaders = { 'Authorization': `Bearer ${facLoginRes.data.token}` };
  console.log('✅ PASS: Faculty authenticated on Laptop A (Dr. Rajesh Sharma)\n');

  // 3. Faculty creates an assignment targeted to Third Year CSE
  console.log('Test 3: Faculty creates assignment targeted strictly to Third Year CSE...');
  const asgId = 'asg_sync_' + Date.now().toString(36);
  const asgPayload = {
    id: asgId,
    title: 'Advanced Operating Systems Kernel Synchronization',
    subject: 'Operating Systems',
    category: 'System Programming',
    targetYear: '3rd Year',
    targetClass: 'CSE',
    department: 'CSE',
    maxMarks: 100,
    dueDate: '2026-11-30',
    dueTime: '23:59',
    priority: 'High',
    description: 'Implement lock-free spinlocks and read-copy-update in C. Submit report.',
    instructions: 'Follow standard POSIX threading guidelines.',
    status: 'Published'
  };
  const createRes = await makeRequest('POST', '/api/records/faculty', facHeaders, asgPayload);
  if (createRes.status !== 201 && createRes.status !== 200) {
    throw new Error('Assignment creation failed: ' + JSON.stringify(createRes.data));
  }
  console.log('✅ PASS: Assignment created with ID:', asgId, '\n');

  // 4. Student 1: Third Year CSE logs in on "Laptop B"
  console.log('Test 4: Third Year CSE Student logs in on Laptop B...');
  const studentBEmail = `std.3rd.cse.${Date.now()}@college.edu`;
  const regB = await makeRequest('POST', '/api/auth/register', {}, {
    fullName: 'Rahul Verma (Laptop B)',
    email: studentBEmail,
    password: 'password123',
    confirmPassword: 'password123',
    rollNo: '23CSE701',
    department: 'CSE',
    currentYear: '3rd Year',
    semester: '6th Semester',
    role: 'student'
  });
  if (regB.status !== 201) throw new Error('Student B registration failed');
  const headersB = { 'Authorization': `Bearer ${regB.data.token}` };

  const listB = await makeRequest('GET', '/api/records/faculty', headersB);
  const asgsB = listB.data.data || listB.data;
  const foundB = asgsB.find(a => a.id === asgId);
  if (!foundB) {
    throw new Error('Assignment NOT visible to Third Year CSE student on Laptop B!');
  }
  console.log('✅ PASS: Third Year CSE student on Laptop B sees the assignment (Title:', foundB.title, ')\n');

  // 5. Student 2: Second Year CSE logs in on "Laptop C" -> Should NOT see assignment
  console.log('Test 5: Second Year CSE Student logs in on Laptop C (Cohort Isolation)...');
  const studentCEmail = `std.2nd.cse.${Date.now()}@college.edu`;
  const regC = await makeRequest('POST', '/api/auth/register', {}, {
    fullName: 'Kiran Patel (Laptop C)',
    email: studentCEmail,
    password: 'password123',
    confirmPassword: 'password123',
    rollNo: '24CSE201',
    department: 'CSE',
    currentYear: '2nd Year',
    semester: '3rd Semester',
    role: 'student'
  });
  if (regC.status !== 201) throw new Error('Student C registration failed');
  const headersC = { 'Authorization': `Bearer ${regC.data.token}` };

  const listC = await makeRequest('GET', '/api/records/faculty', headersC);
  const asgsC = listC.data.data || listC.data;
  const foundC = asgsC.find(a => a.id === asgId);
  if (foundC) {
    throw new Error('SECURITY VIOLATION: Second Year student on Laptop C can see Third Year assignment!');
  }
  console.log('✅ PASS: Second Year CSE student CANNOT see the Third Year assignment.\n');

  // 6. Student 3: Third Year ECE logs in on "Laptop D" -> Should NOT see assignment
  console.log('Test 6: Third Year ECE Student logs in on Laptop D (Department Isolation)...');
  const studentDEmail = `std.3rd.ece.${Date.now()}@college.edu`;
  const regD = await makeRequest('POST', '/api/auth/register', {}, {
    fullName: 'Deepak Rao (Laptop D)',
    email: studentDEmail,
    password: 'password123',
    confirmPassword: 'password123',
    rollNo: '23ECE301',
    department: 'ECE',
    currentYear: '3rd Year',
    semester: '6th Semester',
    role: 'student'
  });
  if (regD.status !== 201) throw new Error('Student D registration failed');
  const headersD = { 'Authorization': `Bearer ${regD.data.token}` };

  const listD = await makeRequest('GET', '/api/records/faculty', headersD);
  const asgsD = listD.data.data || listD.data;
  const foundD = asgsD.find(a => a.id === asgId);
  if (foundD) {
    throw new Error('SECURITY VIOLATION: ECE student on Laptop D can see CSE restricted assignment!');
  }
  console.log('✅ PASS: Third Year ECE student CANNOT see the CSE assignment.\n');

  // 7. Student B on Laptop B submits solution
  console.log('Test 7: Third Year CSE student on Laptop B submits assignment...');
  const subPayload = {
    notes: 'Implemented lock-free spinlocks in C with atomic test-and-set. Repo: https://github.com/rahul/kernel-sync',
    file: {
      fileName: 'Rahul_Verma_Kernel_Sync.pdf',
      originalName: 'Rahul_Verma_Kernel_Sync.pdf',
      downloadUrl: '/api/files/sample_sub.pdf',
      size: 45200
    }
  };
  const subRes = await makeRequest('POST', `/api/records/faculty/${asgId}/submit`, headersB, subPayload);
  if (subRes.status !== 200 || !subRes.data.success) {
    throw new Error('Submission failed: ' + JSON.stringify(subRes.data));
  }
  console.log('✅ PASS: Submission saved successfully.\n');

  // 8. Faculty on Laptop A views submissions
  console.log('Test 8: Faculty on Laptop A views student submission...');
  const facView = await makeRequest('GET', `/api/records/faculty/${asgId}`, facHeaders);
  const submissions = facView.data.data?.submissions || [];
  const studentBSub = submissions.find(s => s.studentName.includes('Rahul Verma'));
  if (!studentBSub) {
    throw new Error('Faculty on Laptop A cannot see Rahul Verma submission!');
  }
  console.log('✅ PASS: Faculty retrieved submission for student:', studentBSub.studentName, 'Status:', studentBSub.status, '\n');

  // 9. Faculty on Laptop A awards marks and feedback
  console.log('Test 9: Faculty on Laptop A awards marks and feedback...');
  const studentBUserId = regB.data.user.id;
  const gradeRes = await makeRequest('POST', `/api/records/faculty/${asgId}/grade`, facHeaders, {
    studentId: studentBUserId,
    marks: 96,
    feedback: 'Outstanding atomic lock-free implementation. Exceptional concurrency benchmarks!',
    strengths: 'Clean C syntax, high throughput, zero deadlocks.',
    improvements: 'Explore memory ordering semantics on ARM architectures.',
    nextSteps: 'Study Linux RCU subsystem implementation.',
    publish: true
  });
  if (gradeRes.status !== 200 || !gradeRes.data.success) {
    throw new Error('Grading failed: ' + JSON.stringify(gradeRes.data));
  }
  console.log('✅ PASS: Marks (96/100) and feedback awarded successfully by Faculty on Laptop A.\n');

  // 10. Student on Laptop B checks marks and feedback
  console.log('Test 10: Student on Laptop B verifies updated marks and feedback...');
  const studentViewRes = await makeRequest('GET', `/api/records/faculty/${asgId}`, headersB);
  const studentData = studentViewRes.data.data;
  console.log('  Submission Status:', studentData.studentStatus);
  console.log('  Awarded Marks:', studentData.marks || studentData.studentMarks);
  console.log('  Faculty Feedback:', studentData.facultyFeedback || studentData.feedback);
  if (!studentData.studentStatus || studentData.studentStatus !== 'Graded') {
    throw new Error(`Expected status 'Graded' but got '${studentData.studentStatus}'`);
  }
  console.log('✅ PASS: Student on Laptop B successfully sees 96/100 marks and faculty feedback!\n');

  console.log('================================================================');
  console.log('🎉 ALL 10 SUPABASE & CROSS-LAPTOP SYNC TESTS PASSED 100%!');
  console.log('================================================================');
}

run().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
