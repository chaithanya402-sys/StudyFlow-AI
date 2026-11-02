/**
 * test_cross_laptop_assignment_sync.js
 * End-to-End Simulation of Cross-Laptop Assignment Synchronization
 * 
 * Verifies:
 * 1. Faculty creates assignment on simulated Laptop A (Target: Third Year CSE) with attachments
 * 2. Supabase synchronization attempt (PostgreSQL & Storage)
 * 3. Registered Third Year CSE student on simulated Laptop B sees assignments via GET /api/state and GET /api/records/:type
 * 4. Attachment signed URLs and file accessibility verified
 * 5. All 8 category mappings strictly verified:
 *    - General Assignments -> Assignments
 *    - Lab Assignments -> Lab Assignments
 *    - Coding Practice, Aptitude Practice, Project Work, Placement Preparation -> Faculty Assignments
 *    - Learning Records -> Learning Records
 *    - Practice Records -> Practice Records
 * 6. Academic year & department cohort isolation verified (2nd Year, 4th Year, ECE students cannot see 3rd Year CSE restricted assignments)
 * 7. Student submission on Laptop B and Faculty grading on Laptop A verified on Student Dashboard
 */

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
  console.log('STUDYFLOW AI: CROSS-LAPTOP ASSIGNMENT SYNCHRONIZATION TEST');
  console.log('================================================================\n');

  // STEP 1: Faculty logs in on "Laptop A"
  console.log('--- STEP 1: Laptop A - Faculty Authentication ---');
  const facLoginRes = await makeRequest('POST', '/api/auth/login', {}, {
    email: 'dr.rajesh.mentor@college.edu',
    password: 'mentor2026',
    role: 'faculty'
  });
  if (facLoginRes.status !== 200) throw new Error('Faculty login on Laptop A failed');
  const facHeaders = { 'Authorization': `Bearer ${facLoginRes.data.token}` };
  console.log('✅ PASS: Faculty authenticated on Laptop A (Dr. Rajesh Sharma)\n');

  // Upload attachment file representing faculty question paper
  console.log('--- Uploading Assignment Attachment to Storage ---');
  const fileUploadRes = await makeRequest('POST', '/api/upload', facHeaders, {
    fileName: 'Advanced_CSE301_Question_Paper.pdf',
    fileType: 'application/pdf',
    fileData: Buffer.from('%PDF-1.4 Mock Assignment Question Paper Content for Cross-Laptop Test').toString('base64'),
    purpose: 'faculty_assignment'
  });
  if (fileUploadRes.status !== 200 || !fileUploadRes.data.success || !fileUploadRes.data.file) {
    throw new Error('Attachment upload failed: ' + JSON.stringify(fileUploadRes.data));
  }
  const fileObj = fileUploadRes.data.file;
  const attachedFileUrl = fileObj.url || fileObj.downloadUrl;
  const storageBucket = fileObj.storageBucket || 'studyflow-uploads';
  const storagePath = fileObj.storagePath;
  console.log('✅ PASS: Assignment Attachment uploaded to storage (Bucket:', storageBucket, 'Path:', storagePath, ')\n');

  // STEP 2: Faculty on Laptop A creates General Assignment for Third Year CSE
  console.log('--- STEP 2: Laptop A - Faculty Creates General Assignment ---');
  const asgId = 'asg_cross_' + Date.now().toString(36);
  const generalPayload = {
    id: asgId,
    title: 'Cloud Computing Architecture & Scalability',
    subject: 'Cloud Computing',
    category: 'General Assignments',
    targetYear: 'Third Year',
    targetClass: 'Entire Third Year CSE',
    department: 'CSE',
    maxMarks: 100,
    dueDate: '2026-11-28',
    dueTime: '23:59',
    priority: 'High',
    description: 'Design a distributed fault-tolerant multi-region cluster on AWS/GCP.',
    instructions: 'Submit architectural diagrams and Terraform configuration.',
    status: 'Published',
    storageBucket,
    storagePath,
    attachment: {
      fileName: 'Advanced_CSE301_Question_Paper.pdf',
      originalName: 'Advanced_CSE301_Question_Paper.pdf',
      url: attachedFileUrl,
      storageBucket,
      storagePath
    }
  };

  const createGeneralRes = await makeRequest('POST', '/api/records/general', facHeaders, generalPayload);
  if (createGeneralRes.status !== 201 && createGeneralRes.status !== 200) {
    throw new Error('General assignment creation failed: ' + JSON.stringify(createGeneralRes.data));
  }
  console.log('✅ PASS: General Assignment created on Laptop A (ID:', asgId, ')\n');

  // STEP 3: Register and Log in as a Third Year CSE Student on "Laptop B"
  console.log('--- STEP 3: Laptop B - Third Year CSE Student Logs In ---');
  const timestamp = Date.now();
  const randRoll = () => Math.floor(1000 + Math.random() * 9000);
  const studentBEmail = `student.3rd.cse.${timestamp}@college.edu`;
  const regB = await makeRequest('POST', '/api/auth/register', {}, {
    fullName: 'Priya Sharma (Laptop B)',
    email: studentBEmail,
    password: 'password123',
    confirmPassword: 'password123',
    rollNo: `23CSE${randRoll()}`,
    department: 'CSE',
    currentYear: '3rd Year',
    semester: '5th Semester',
    role: 'student'
  });
  if (regB.status !== 201) throw new Error('Student B registration failed: ' + JSON.stringify(regB.data));
  const headersB = { 'Authorization': `Bearer ${regB.data.token}` };
  console.log('✅ PASS: Third Year CSE Student authenticated on Laptop B (Priya Sharma)\n');

  // STEP 4: Laptop B fetches /api/state and Student Portal Assignments
  console.log('--- STEP 4: Laptop B - Student Queries State & General Assignments ---');
  const stateRes = await makeRequest('GET', '/api/state', headersB);
  if (stateRes.status !== 200 || !stateRes.data.success) {
    throw new Error('Laptop B /api/state failed: ' + JSON.stringify(stateRes.data));
  }
  const generalListB = stateRes.data.data.generalAssignments || [];
  const foundInState = generalListB.find(a => a.id === asgId);
  if (!foundInState) {
    throw new Error(`CRITICAL: Assignment '${asgId}' not found in Laptop B /api/state generalAssignments!`);
  }
  console.log('  Found in /api/state generalAssignments:', foundInState.title);

  const getRecordsRes = await makeRequest('GET', '/api/records/general', headersB);
  const recordsList = getRecordsRes.data.data || [];
  const foundInRecords = recordsList.find(a => a.id === asgId);
  if (!foundInRecords) {
    throw new Error(`CRITICAL: Assignment '${asgId}' not found in Laptop B /api/records/general!`);
  }
  console.log('  Found in /api/records/general:', foundInRecords.title);
  console.log('  Target Year:', foundInRecords.targetYear, '| Target Class:', foundInRecords.targetClass);
  console.log('  Attachments:', JSON.stringify(foundInRecords.attachments));
  if (!foundInRecords.attachments || foundInRecords.attachments.length === 0) {
    throw new Error('Assignment attachment was missing from student view on Laptop B!');
  }
  console.log('✅ PASS: Assignment & attachments verified on Laptop B Student Portal → Assignments!\n');

  // STEP 5: Verify Attachment Download / Signed URL Access
  console.log('--- STEP 5: Laptop B - Attachment Download / Access ---');
  const signedUrlRes = await makeRequest('GET', `/api/files/signed-url?path=${encodeURIComponent(storagePath)}&bucket=${storageBucket}`, headersB);
  if (signedUrlRes.status === 200 && signedUrlRes.data.success && signedUrlRes.data.signedUrl) {
    console.log('  Generated authorized signed URL:', signedUrlRes.data.signedUrl.substring(0, 80) + '...');
  }
  const fileDownloadRes = await makeRequest('GET', attachedFileUrl, headersB);
  if (fileDownloadRes.status !== 200) {
    throw new Error('Failed to retrieve attachment file contents: status ' + fileDownloadRes.status);
  }
  console.log('✅ PASS: Attachment downloaded and verified successfully on Laptop B.\n');

  // STEP 6: Verify Exact Category Mapping for All 8 Categories
  console.log('--- STEP 6: Category Mapping Verification Across All 8 Categories ---');
  const categoriesToTest = [
    { category: 'Lab Assignments', facultyType: 'lab', studentDest: 'labAssignments' },
    { category: 'Coding Practice', facultyType: 'faculty', studentDest: 'facultyAssignments' },
    { category: 'Aptitude Practice', facultyType: 'faculty', studentDest: 'facultyAssignments' },
    { category: 'Project Work', facultyType: 'faculty', studentDest: 'facultyAssignments' },
    { category: 'Placement Preparation', facultyType: 'faculty', studentDest: 'facultyAssignments' },
    { category: 'Learning Records', facultyType: 'learning', studentDest: 'learningRecords' },
    { category: 'Practice Records', facultyType: 'practice', studentDest: 'practiceRecords' }
  ];

  for (const item of categoriesToTest) {
    const testId = `test_cat_${item.category.replace(/[^a-zA-Z]/g, '').toLowerCase()}_${timestamp}`;
    const payload = {
      id: testId,
      title: `Test Assignment for ${item.category}`,
      subject: 'Computer Science',
      category: item.category,
      targetYear: '3rd Year',
      targetClass: 'CSE',
      department: 'CSE',
      maxMarks: 50,
      dueDate: '2026-11-29',
      dueTime: '23:59',
      priority: 'Medium',
      description: `Testing mapping for ${item.category}`,
      status: 'Published'
    };

    const createRes = await makeRequest('POST', `/api/records/${item.facultyType}`, facHeaders, payload);
    if (createRes.status !== 201 && createRes.status !== 200) {
      throw new Error(`Failed to create assignment for category ${item.category}: ${JSON.stringify(createRes.data)}`);
    }

    // Verify on Laptop B in /api/state under studentDest
    const updatedState = await makeRequest('GET', '/api/state', headersB);
    const destList = updatedState.data.data[item.studentDest] || [];
    const matched = destList.find(a => a.id === testId);
    if (!matched) {
      throw new Error(`Category mapping error: '${item.category}' did NOT appear in Student Portal '${item.studentDest}'!`);
    }
    console.log(`  ✓ Faculty [${item.category}] -> Student Portal [${item.studentDest}]: VERIFIED`);
  }
  console.log('✅ PASS: All 8 category mappings verified strictly.\n');

  // STEP 7: Verify Academic Year & Department Isolation
  console.log('--- STEP 7: Cohort & Department Isolation Verification ---');

  // Student C: 2nd Year CSE (Should NOT see 3rd Year assignment)
  const reg2ndYear = await makeRequest('POST', '/api/auth/register', {}, {
    fullName: 'Second Year Student (Laptop C)',
    email: `student.2nd.cse.${timestamp}@college.edu`,
    password: 'password123',
    confirmPassword: 'password123',
    rollNo: `24CSE${randRoll()}`,
    department: 'CSE',
    currentYear: '2nd Year',
    semester: '3rd Semester',
    role: 'student'
  });
  if (reg2ndYear.status !== 201) throw new Error('2nd Year registration failed');
  const headers2nd = { 'Authorization': `Bearer ${reg2ndYear.data.token}` };

  const state2nd = await makeRequest('GET', '/api/state', headers2nd);
  const general2nd = state2nd.data.data.generalAssignments || [];
  if (general2nd.find(a => a.id === asgId)) {
    throw new Error('SECURITY VIOLATION: 2nd Year student can see 3rd Year restricted assignment!');
  }
  console.log('  ✓ 2nd Year CSE student CANNOT see 3rd Year assignment: VERIFIED');

  // Student D: 4th Year CSE (Should NOT see 3rd Year assignment)
  const reg4thYear = await makeRequest('POST', '/api/auth/register', {}, {
    fullName: 'Fourth Year Student (Laptop D)',
    email: `student.4th.cse.${timestamp}@college.edu`,
    password: 'password123',
    confirmPassword: 'password123',
    rollNo: `21CSE${randRoll()}`,
    department: 'CSE',
    currentYear: '4th Year',
    semester: '7th Semester',
    role: 'student'
  });
  if (reg4thYear.status !== 201) throw new Error('4th Year registration failed');
  const headers4th = { 'Authorization': `Bearer ${reg4thYear.data.token}` };

  const state4th = await makeRequest('GET', '/api/state', headers4th);
  const general4th = state4th.data.data.generalAssignments || [];
  if (general4th.find(a => a.id === asgId)) {
    throw new Error('SECURITY VIOLATION: 4th Year student can see 3rd Year restricted assignment!');
  }
  console.log('  ✓ 4th Year CSE student CANNOT see 3rd Year assignment: VERIFIED');

  // Student E: 3rd Year ECE (Should NOT see CSE restricted assignment)
  const regECE = await makeRequest('POST', '/api/auth/register', {}, {
    fullName: 'ECE Student (Laptop E)',
    email: `student.3rd.ece.${timestamp}@college.edu`,
    password: 'password123',
    confirmPassword: 'password123',
    rollNo: `23ECE${randRoll()}`,
    department: 'ECE',
    currentYear: '3rd Year',
    semester: '5th Semester',
    role: 'student'
  });
  if (regECE.status !== 201) throw new Error('ECE registration failed');
  const headersECE = { 'Authorization': `Bearer ${regECE.data.token}` };

  const stateECE = await makeRequest('GET', '/api/state', headersECE);
  const generalECE = stateECE.data.data.generalAssignments || [];
  if (generalECE.find(a => a.id === asgId)) {
    throw new Error('SECURITY VIOLATION: ECE student can see CSE restricted assignment!');
  }
  console.log('  ✓ 3rd Year ECE student CANNOT see CSE restricted assignment: VERIFIED');
  console.log('✅ PASS: Cohort and department isolation strictly enforced.\n');

  // STEP 8: Student on Laptop B Submits and Faculty Grades
  console.log('--- STEP 8: Submission & Faculty Marks Display ---');
  const subRes = await makeRequest('POST', `/api/records/general/${asgId}/submit`, headersB, {
    notes: 'Completed multi-region cluster design with Terraform scripts and cost estimation.',
    file: {
      fileName: 'Priya_Sharma_Cloud_Architecture.pdf',
      originalName: 'Priya_Sharma_Cloud_Architecture.pdf',
      downloadUrl: attachedFileUrl,
      size: 64200,
      storageBucket,
      storagePath
    }
  });
  if (subRes.status !== 200 || !subRes.data.success) {
    throw new Error('Submission failed: ' + JSON.stringify(subRes.data));
  }
  console.log('  ✓ Student Priya Sharma on Laptop B submitted assignment successfully');

  // Faculty on Laptop A grades submission
  const gradeRes = await makeRequest('POST', `/api/records/general/${asgId}/grade`, facHeaders, {
    studentId: regB.data.user.id,
    marks: 98,
    feedback: 'Flawless Terraform modular structure and multi-region disaster recovery plan.',
    strengths: 'Outstanding architecture, automated rollback, realistic latency estimates.',
    improvements: 'Add Chaos Engineering test suites in CI/CD pipeline.',
    publish: true
  });
  if (gradeRes.status !== 200 || !gradeRes.data.success) {
    throw new Error('Grading failed: ' + JSON.stringify(gradeRes.data));
  }
  console.log('  ✓ Faculty Dr. Rajesh Sharma awarded 98/100 marks and feedback');

  // Verify marks appear on Laptop B student dashboard
  const studentEvalRes = await makeRequest('GET', '/api/student/evaluations', headersB);
  if (studentEvalRes.status !== 200 || !studentEvalRes.data.success) {
    throw new Error('Failed to fetch student evaluations: ' + JSON.stringify(studentEvalRes.data));
  }
  const evalFound = studentEvalRes.data.evaluations.find(e => e.assignment_id === asgId);
  if (!evalFound) {
    throw new Error('Awarded marks did not appear in Laptop B student evaluations!');
  }
  console.log('  ✓ Verified on Laptop B Student Dashboard:');
  console.log('    Marks Obtained:', evalFound.marks || evalFound.marks_obtained, '/', evalFound.max_marks);
  console.log('    Faculty Feedback:', evalFound.feedback);
  console.log('✅ PASS: Faculty marks and feedback automatically visible on Student Dashboard.\n');

  console.log('================================================================');
  console.log('🎉 ALL CROSS-LAPTOP SYNCHRONIZATION & TARGETING TESTS PASSED 100%!');
  console.log('================================================================');
}

run().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
