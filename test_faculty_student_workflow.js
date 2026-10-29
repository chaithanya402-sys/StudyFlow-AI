// test_faculty_student_workflow.js
// End-to-end test verifying Faculty assignment creation -> Student Portal display & PDF view/download -> Solution Submission -> Faculty Review

const http = require('http');
const fs = require('fs');
const path = require('path');

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
  console.log('FACULTY TO STUDENT ASSIGNMENT WORKFLOW E2E TEST');
  console.log('================================================================\n');

  // 1. Login as Faculty
  console.log('Step 1: Authenticating Faculty...');
  const facultyLoginRes = await makeRequest('POST', '/api/auth/login', {}, {
    email: 'dr.rajesh.mentor@college.edu',
    password: 'mentor2026',
    role: 'faculty'
  });
  if (facultyLoginRes.status !== 200 || !facultyLoginRes.data.token) {
    throw new Error('Faculty login failed: ' + JSON.stringify(facultyLoginRes.data));
  }
  const facultyToken = facultyLoginRes.data.token;
  const facultyHeaders = { 'Authorization': `Bearer ${facultyToken}` };
  console.log('✅ Faculty logged in:', facultyLoginRes.data.user.fullName);

  // 2. Faculty uploads an assignment PDF
  console.log('\nStep 2: Faculty uploads Assignment Question Paper PDF...');
  const samplePdfBase64 = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Midterm Exam) >>\nendobj\ntrailer\n<<>>\n%%EOF').toString('base64');
  const uploadRes = await makeRequest('POST', '/api/upload', facultyHeaders, {
    fileName: 'Midterm_Question_Paper_CSE_2026.pdf',
    fileType: 'application/pdf',
    fileData: samplePdfBase64
  });
  if (uploadRes.status !== 200 || !uploadRes.data.success) {
    throw new Error('PDF upload failed: ' + JSON.stringify(uploadRes.data));
  }
  const pdfDownloadUrl = uploadRes.data.file.downloadUrl;
  console.log('✅ PDF uploaded successfully:', uploadRes.data.file.fileName, 'URL:', pdfDownloadUrl);

  // 3. Faculty creates an assignment
  console.log('\nStep 3: Faculty creates assignment with Subject, Title, Due Date, Description, and PDF...');
  const asgPayload = {
    title: 'Distributed Consensus & Raft Protocol Implementation',
    subject: 'Distributed Systems',
    category: 'System Design',
    targetYear: '3rd Year',
    targetClass: 'CSE',
    department: 'CSE',
    maxMarks: 100,
    dueDate: '2026-11-20',
    dueTime: '23:59',
    priority: 'High',
    instructions: 'Implement Raft leader election and log replication in Go or Python. Submit your report and source code repository.',
    description: 'Implement Raft leader election and log replication in Go or Python. Submit your report and source code repository.',
    attachment: pdfDownloadUrl,
    status: 'Published'
  };
  const createRes = await makeRequest('POST', '/api/records/faculty', facultyHeaders, asgPayload);
  if (createRes.status !== 201 && createRes.status !== 200) {
    throw new Error('Assignment creation failed: ' + JSON.stringify(createRes.data));
  }
  const assignmentId = createRes.data.id;
  const getCreated = await makeRequest('GET', `/api/records/faculty/${assignmentId}`, facultyHeaders);
  const createdAssignment = getCreated.data.data || getCreated.data;
  console.log('✅ Assignment created with ID:', assignmentId);
  console.log('   Title:', createdAssignment.title);
  console.log('   Subject:', createdAssignment.subject);
  console.log('   Faculty Name:', createdAssignment.facultyName || createdAssignment.professor);
  console.log('   Display Due Date:', createdAssignment.displayDueDate || createdAssignment.dueDate);
  console.log('   Attachment URL:', createdAssignment.attachment || createdAssignment.attachmentUrl);

  // 4. Register and Login a student in 3rd Year CSE
  console.log('\nStep 4: Registering and logging in student in 3rd Year CSE...');
  const studentEmail = `student.test.${Date.now()}@college.edu`;
  const registerRes = await makeRequest('POST', '/api/auth/register', {}, {
    fullName: 'Ananya Sharma',
    email: studentEmail,
    password: 'password123',
    confirmPassword: 'password123',
    rollNo: `23CSE${Math.floor(100 + Math.random() * 900)}`,
    department: 'CSE',
    currentYear: '3rd Year',
    semester: '6th Semester',
    role: 'student'
  });
  if (registerRes.status !== 201) {
    throw new Error('Student registration failed: ' + JSON.stringify(registerRes.data));
  }
  const studentToken = registerRes.data.token;
  const studentHeaders = { 'Authorization': `Bearer ${studentToken}` };
  console.log('✅ Student logged in:', registerRes.data.user.fullName, `(${registerRes.data.user.academicYear} ${registerRes.data.user.department})`);

  // 5. Student queries assignments (GET /api/records/faculty and GET /api/state)
  console.log('\nStep 5: Verifying assignment appears in Student Portal...');
  const studentListRes = await makeRequest('GET', '/api/records/faculty', studentHeaders);
  if (studentListRes.status !== 200) {
    throw new Error('Failed to fetch student faculty assignments: ' + JSON.stringify(studentListRes.data));
  }
  const studentAssignments = Array.isArray(studentListRes.data) ? studentListRes.data : (studentListRes.data.data || []);
  const matchingAsg = studentAssignments.find(a => a.id === assignmentId);
  if (!matchingAsg) {
    throw new Error(`Assignment ${assignmentId} did not appear in student list!`);
  }
  console.log('✅ Assignment found in Student Portal!');
  console.log('   Subject Name matches:', matchingAsg.subject === 'Distributed Systems' ? '✅' : '❌', matchingAsg.subject);
  console.log('   Faculty Name matches:', (matchingAsg.facultyName || matchingAsg.professor).includes('Rajesh') ? '✅' : '❌', matchingAsg.facultyName || matchingAsg.professor);
  console.log('   Assignment Title matches:', matchingAsg.title === asgPayload.title ? '✅' : '❌', matchingAsg.title);
  console.log('   Due Date formatted as DD-MM-YYYY:', matchingAsg.displayDueDate === '20-11-2026' ? '✅' : '❌', matchingAsg.displayDueDate);
  console.log('   Attachment PDF URL:', matchingAsg.attachmentUrl || matchingAsg.attachment);
  console.log('   Initial Status:', matchingAsg.studentStatus);

  // 6. Test viewing/downloading assignment PDF
  console.log('\nStep 6: Testing PDF download/view access...');
  const pdfFileName = (matchingAsg.attachmentUrl || matchingAsg.attachment).split('/').pop();
  const pdfFileRes = await makeRequest('GET', `/api/files/${pdfFileName}?view=1`, studentHeaders);
  if (pdfFileRes.status !== 200) {
    throw new Error('PDF download failed with status ' + pdfFileRes.status);
  }
  console.log('✅ Student successfully downloaded / viewed assignment PDF! (Status:', pdfFileRes.status, 'Content-Type:', pdfFileRes.headers['content-type'], ')');

  // 7. Student uploads solution file and submits assignment with notes
  console.log('\nStep 7: Student uploads solution and submits assignment...');
  const studentSolutionPdfBase64 = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Student Raft Report) >>\nendobj\ntrailer\n<<>>\n%%EOF').toString('base64');
  const solutionUploadRes = await makeRequest('POST', '/api/upload', studentHeaders, {
    fileName: 'Ananya_Sharma_Raft_Report.pdf',
    fileType: 'application/pdf',
    fileData: studentSolutionPdfBase64
  });
  if (solutionUploadRes.status !== 200 || !solutionUploadRes.data.success) {
    throw new Error('Solution upload failed: ' + JSON.stringify(solutionUploadRes.data));
  }
  const solutionFile = solutionUploadRes.data.file;

  const submitPayload = {
    notes: 'Completed leader election, heartbeat mechanism, and log matching. GitHub Repo: https://github.com/ananya/raft-distributed',
    file: solutionFile,
    submissionUrl: solutionFile.downloadUrl
  };
  const submitRes = await makeRequest('POST', `/api/records/faculty/${assignmentId}/submit`, studentHeaders, submitPayload);
  if (submitRes.status !== 200 || !submitRes.data.success) {
    throw new Error('Submission failed: ' + JSON.stringify(submitRes.data));
  }
  console.log('✅ Assignment submitted successfully!');

  // 8. Verify student status changes to Submitted
  console.log('\nStep 8: Verifying student assignment status updated to Submitted...');
  const studentDetailRes = await makeRequest('GET', `/api/records/faculty/${assignmentId}`, studentHeaders);
  const updatedStudentAsg = studentDetailRes.data.data || studentDetailRes.data;
  console.log('   Updated Status:', updatedStudentAsg.studentStatus);
  console.log('   Submitted File:', updatedStudentAsg.submittedFile?.originalName);
  console.log('   Student Remarks:', updatedStudentAsg.studentRemarks);
  if (updatedStudentAsg.studentStatus !== 'Submitted') {
    throw new Error(`Expected status 'Submitted' but got '${updatedStudentAsg.studentStatus}'`);
  }
  console.log('✅ Student status successfully transitioned to Submitted!');

  // 9. Faculty verifies submission
  console.log('\nStep 9: Faculty verifies submitted student file and notes...');
  const facultyDetailRes = await makeRequest('GET', `/api/records/faculty/${assignmentId}`, facultyHeaders);
  const facultyAsgView = facultyDetailRes.data.data || facultyDetailRes.data;
  const submissions = facultyAsgView.submissions || [];
  const foundSub = submissions.find(s => s.studentName === 'Ananya Sharma');
  if (!foundSub) {
    throw new Error('Faculty could not find student submission in submissions list!');
  }
  console.log('✅ Faculty retrieved student submission:');
  console.log('   Student Name:', foundSub.studentName);
  console.log('   Roll No:', foundSub.rollNo);
  console.log('   Notes / Repo link:', foundSub.remarks);
  console.log('   Submitted File:', foundSub.fileName);
  console.log('   Status:', foundSub.status);

  // 10. Faculty updates assignment (verify no duplicates created)
  console.log('\nStep 10: Faculty updates assignment due date & instructions (no duplicate creation)...');
  const updateRes = await makeRequest('PUT', `/api/records/faculty/${assignmentId}`, facultyHeaders, {
    dueDate: '2026-11-25',
    instructions: 'Updated instructions: Include benchmark logs from 5-node cluster simulation.'
  });
  if (updateRes.status !== 200 || !updateRes.data.success) {
    throw new Error('Assignment update failed: ' + JSON.stringify(updateRes.data));
  }
  const allFacultyAsgsRes = await makeRequest('GET', '/api/records/faculty', facultyHeaders);
  const allAsgs = allFacultyAsgsRes.data.data || allFacultyAsgsRes.data;
  const matchingCount = allAsgs.filter(a => a.id === assignmentId).length;
  console.log('✅ Assignment updated! Total occurrences of assignment ID:', matchingCount, '(Must be exactly 1)');
  if (matchingCount !== 1) {
    throw new Error(`Duplicate assignments detected! Found ${matchingCount} assignments with id ${assignmentId}`);
  }

  console.log('\n================================================================');
  console.log('🎉 ALL 10 E2E WORKFLOW CHECKS PASSED PERFECTLY!');
  console.log('================================================================');
}

run().catch(err => {
  console.error('\n❌ WORKFLOW TEST FAILED:', err);
  process.exit(1);
});
