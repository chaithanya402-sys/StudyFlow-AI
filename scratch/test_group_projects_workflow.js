const http = require('http');
const path = require('path');
const Database = require('better-sqlite3');

const BASE_URL = 'http://localhost:3000';
const DB_PATH = path.join(__dirname, '..', 'data', 'studyflow.db');

function request(method, reqPath, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: reqPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const testResults = [];
function recordResult(testName, passed, details = '') {
  testResults.push({ testName, passed, details });
  const statusStr = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${statusStr}: ${testName} ${details ? '(' + details + ')' : ''}`);
}

async function runGroupProjectsWorkflowTests() {
  console.log('================================================================');
  console.log('STUDYFLOW AI: GROUP PROJECTS & FACULTY APPROVAL WORKFLOW VERIFICATION');
  console.log('================================================================\n');

  try {
    // Setup isolated test students and get faculty logins
    const testTimestamp = Date.now();
    const student1Email = `student.teamlead.${testTimestamp}@college.edu`;
    const student2Email = `student.member2.${testTimestamp}@college.edu`;
    const student3Email = `student.member3.${testTimestamp}@college.edu`;
    const outsiderStudentEmail = `student.outsider.${testTimestamp}@college.edu`;

    // 1. Register 3 isolated test student accounts
    console.log('--- Registering Isolated Student Accounts ---');
    const s1Reg = await request('POST', '/api/auth/register', {
      email: student1Email,
      password: 'password123',
      role: 'student',
      fullName: 'Aarav Patel (Lead)',
      rollNo: `26CSE${testTimestamp % 10000}A`,
      department: 'Computer Science & Engineering'
    });
    const s1Token = s1Reg.body.token;
    const s1Id = s1Reg.body.user.id;

    const s2Reg = await request('POST', '/api/auth/register', {
      email: student2Email,
      password: 'password123',
      role: 'student',
      fullName: 'Diya Sharma (Member)',
      rollNo: `26CSE${testTimestamp % 10000}B`,
      department: 'Computer Science & Engineering'
    });
    const s2Token = s2Reg.body.token;
    const s2Id = s2Reg.body.user.id;

    const s3Reg = await request('POST', '/api/auth/register', {
      email: student3Email,
      password: 'password123',
      role: 'student',
      fullName: 'Rohan Verma (Member)',
      rollNo: `26CSE${testTimestamp % 10000}C`,
      department: 'Computer Science & Engineering'
    });
    const s3Id = s3Reg.body.user.id;

    const outsiderReg = await request('POST', '/api/auth/register', {
      email: outsiderStudentEmail,
      password: 'password123',
      role: 'student',
      fullName: 'Vikram Joshi (Outsider)',
      rollNo: `26CSE${testTimestamp % 10000}D`,
      department: 'Computer Science & Engineering'
    });
    const outsiderToken = outsiderReg.body.token;

    // Login faculty members
    const fac1Login = await request('POST', '/api/auth/login', {
      email: 'dr.rajesh.mentor@college.edu',
      password: 'mentor2026'
    });
    const fac1Token = fac1Login.body.token;

    const fac2Login = await request('POST', '/api/auth/login', {
      email: 'anita.rao@college.edu',
      password: 'mentor2026'
    });
    const fac2Token = fac2Login.body.token;

    recordResult('Test Authentication & Isolated Fixtures Setup', Boolean(s1Token && s2Token && fac1Token && fac2Token), '2 Faculty & 4 Students authenticated');

    // TEST 1: Check GET /api/faculty/subjects and GET /api/students/eligible
    const subjRes = await request('GET', '/api/faculty/subjects');
    const hasSubjects = subjRes.body.success && subjRes.body.subjects.some(s => s.faculty_id === 'fac_001' && s.subject === 'Machine Learning & AI');
    recordResult('Subject-Faculty Mappings Available', hasSubjects, 'Found Machine Learning & AI assigned to Dr. Rajesh Sharma');

    const eligRes = await request('GET', '/api/students/eligible?q=Aarav');
    const foundEligible = eligRes.body.success && eligRes.body.students.some(s => s.id === s1Id);
    recordResult('Student Directory Search for Member Selection', foundEligible, 'Aarav Patel located in student directory');

    // TEST 2: Validation - Reject 1-Person Team
    const soloRes = await request('POST', '/api/projects', {
      title: 'Solo Project Attempt',
      subject: 'Machine Learning & AI',
      domain: 'Artificial Intelligence & Machine Learning',
      problem_statement: 'Solving solo',
      objectives: 'Solo objective',
      description: 'Solo description',
      tech_stack: 'Python',
      deliverables: 'Report',
      team_name: 'Team Solo',
      members: [s1Id] // Only 1 member
    }, s1Token);
    recordResult('Team Size Validation: Reject < 2 Members', soloRes.status === 400 && soloRes.body.error.includes('minimum of 2'), soloRes.body.error);

    // TEST 3: Validation - Reject > 5 Members
    const hugeTeamRes = await request('POST', '/api/projects', {
      title: 'Huge Team Attempt',
      subject: 'Machine Learning & AI',
      domain: 'Artificial Intelligence & Machine Learning',
      problem_statement: 'Too many members',
      objectives: 'Objectives',
      description: 'Description',
      tech_stack: 'Python',
      deliverables: 'Report',
      team_name: 'Team Huge',
      members: [s1Id, s2Id, s3Id, 'fake_std_1', 'fake_std_2', 'fake_std_3']
    }, s1Token);
    recordResult('Team Size Validation: Reject > 5 Members', hugeTeamRes.status === 400 && hugeTeamRes.body.error.includes('maximum of 5'), hugeTeamRes.body.error);

    // TEST 4: Validation - Reject Invalid / Non-existent Student Account
    const invalidMemberRes = await request('POST', '/api/projects', {
      title: 'Invalid Member Attempt',
      subject: 'Machine Learning & AI',
      domain: 'Artificial Intelligence & Machine Learning',
      problem_statement: 'Invalid user',
      objectives: 'Objectives',
      description: 'Description',
      tech_stack: 'Python',
      deliverables: 'Report',
      team_name: 'Team Invalid',
      members: [s1Id, 'non_existent_student_id_999']
    }, s1Token);
    recordResult('Student Account Validation: Reject Non-Existent User', invalidMemberRes.status === 400 && invalidMemberRes.body.error.includes('does not exist'), invalidMemberRes.body.error);

    // TEST 5: Create Valid 2-Student Group Project Proposal
    const createRes = await request('POST', '/api/projects', {
      title: 'Autonomous Edge-AI Embedded Vision Pipeline',
      subject: 'Machine Learning & AI',
      domain: 'Artificial Intelligence & Machine Learning',
      problem_statement: 'High latency and bandwidth saturation in centralized video analytics infrastructure.',
      objectives: 'Design quantized neural inference models deployed on distributed edge microcontrollers.',
      description: 'End-to-end computer vision and TinyML system performing on-device object detection and anomaly inference.',
      tech_stack: 'PyTorch, TensorRT, C++, OpenCV, SQLite, Raspberry Pi 4',
      deliverables: 'Quantized ONNX models, benchmark telemetry dashboard, hardware demonstration.',
      start_date: '2026-10-18',
      target_date: '2026-12-20',
      team_name: 'EdgeVision Labs',
      leader_id: s1Id,
      mentor_id: 'fac_001',
      members: [s1Id, s2Id]
    }, s1Token);

    const createdProject = createRes.body.project;
    const projectCreatedSuccess = createRes.status === 201 && createdProject && createdProject.approver_id === 'fac_001';
    recordResult('Student Create Project: 2 Confirmed Members & Subject Matching', projectCreatedSuccess, `Project ID: ${createdProject?.id}, Assigned Approver: ${createdProject?.approver_name}`);

    // TEST 6: Student Portal visibility
    const studentListRes = await request('GET', '/api/projects', null, s1Token);
    const inStudentList = studentListRes.body.projects?.some(p => p.id === createdProject.id);
    recordResult('Student Portal Persistence: Visible to Creator & Team Members', inStudentList, `Projects count: ${studentListRes.body.projects?.length}`);

    // Outsider student should NOT see this project
    const outsiderListRes = await request('GET', '/api/projects', null, outsiderToken);
    const inOutsiderList = outsiderListRes.body.projects?.some(p => p.id === createdProject.id);
    recordResult('Role & Membership Isolation: Unrelated Students Cannot View Project', !inOutsiderList, 'Project hidden from non-member student');

    // TEST 7: Subject-based Faculty Approval Queue
    // fac_001 is assigned to 'Machine Learning & AI' -> project MUST appear in fac_001's queue
    const fac1ProjectsRes = await request('GET', '/api/projects', null, fac1Token);
    const inFac1Queue = fac1ProjectsRes.body.projects?.some(p => p.id === createdProject.id);
    recordResult('Subject-Faculty Queue Matching: Visible to Authorized Faculty (Dr. Rajesh Sharma)', inFac1Queue, `Status: ${createdProject.status}`);

    // TEST 8: Subject-based Authorization Security Check
    // fac_002 is assigned to 'Database Management Systems', NOT 'Machine Learning & AI'
    // fac_002 MUST be forbidden from approving this project!
    const unauthApproveRes = await request('POST', `/api/projects/${createdProject.id}/approve`, {
      feedback: 'Unauthorized approval attempt.'
    }, fac2Token);
    const securityForbidden = unauthApproveRes.status === 403;
    recordResult('Security Enforcement: Unrelated Faculty Cannot Approve (403 Forbidden)', securityForbidden, unauthApproveRes.body.error);

    // TEST 9: Request Changes with Feedback
    const reqChangesRes = await request('POST', `/api/projects/${createdProject.id}/request-changes`, {
      feedback: 'Please include comparative FPS benchmarks and memory consumption metrics in the deliverables.'
    }, fac1Token);
    recordResult('Faculty Request Changes with Feedback', reqChangesRes.status === 200, reqChangesRes.body.message);

    // Verify status became 'Changes Requested'
    const projAfterChanges = await request('GET', `/api/projects/${createdProject.id}`, null, s1Token);
    const changesRecorded = projAfterChanges.body.project?.status === 'Changes Requested' && projAfterChanges.body.project?.faculty_feedback.includes('FPS benchmarks');
    recordResult('Workflow State Transition: Changes Requested Visible to Student Team', changesRecorded, projAfterChanges.body.project?.faculty_feedback);

    // TEST 10: Student Leader Resubmits Revised Proposal
    const resubmitRes = await request('PUT', `/api/projects/${createdProject.id}`, {
      deliverables: 'Quantized ONNX models, comparative FPS latency benchmark table, memory profiling report, hardware demonstration.',
      is_resubmitting: true
    }, s1Token);
    recordResult('Student Proposal Resubmission: Revised Proposal Submitted', resubmitRes.status === 200, resubmitRes.body.message);

    // TEST 11: Authorized Subject Faculty Approves Project
    const approveRes = await request('POST', `/api/projects/${createdProject.id}/approve`, {
      feedback: 'Revisions verified. Benchmark metrics methodology is sound. Approved for active development.'
    }, fac1Token);
    recordResult('Authorized Subject Faculty Approval', approveRes.status === 200, approveRes.body.message);

    // Verify status is now 'Development in Progress' and workspace is enabled
    const projAfterApproval = await request('GET', `/api/projects/${createdProject.id}`, null, s2Token); // Check member 2 view!
    const isDevelopmentActive = projAfterApproval.body.project?.status === 'Development in Progress' && projAfterApproval.body.project?.approval_status === 'Approved';
    recordResult('Development Workspace Activated for Student Team', isDevelopmentActive, `Status: ${projAfterApproval.body.project?.status}`);

    // TEST 12: Student Submits Development Progress Update
    const updateRes = await request('POST', `/api/projects/${createdProject.id}/updates`, {
      stage_milestone: '3. System design and architecture',
      progress_pct: 55,
      summary: 'Completed tensor quantization pipeline with INT8 calibration on NVIDIA Jetson / Raspberry Pi.',
      tasks_completed: 'Trained YOLOv8-Nano baseline, performed Post-Training Quantization (PTQ), verified accuracy drop < 1.2%.',
      tasks_remaining: 'Hardware acceleration via TensorRT engine export and multi-camera stream benchmarking.',
      challenges_blockers: 'Dynamic tensor shapes caused ONNX parser warning, resolved with fixed spatial dimension batching.',
      next_steps: 'Run continuous stress test over 24-hour thermal cycle.',
      github_url: 'https://github.com/studyflow-ai/autonomous-edge-vision'
    }, s2Token); // Member 2 submits update!
    recordResult('Student Team Development Progress Update Submission', updateRes.status === 201, `Update ID: ${updateRes.body.update_id}`);

    // TEST 13: Faculty Supervision & Progress Feedback
    const feedbackRes = await request('POST', `/api/projects/${createdProject.id}/feedback`, {
      feedback: 'Excellent work on the INT8 quantization calibration. Please log latency histograms during the thermal stress test.',
      update_id: updateRes.body.update_id
    }, fac1Token);
    recordResult('Faculty Supervision Feedback Recorded & Linked to Update', feedbackRes.status === 200, feedbackRes.body.message);

    // TEST 14: Final Evaluation and Completion
    const gradeRes = await request('POST', `/api/projects/${createdProject.id}/grade`, {
      final_grade: 'A+ (98/100)',
      evaluation_notes: 'Exceptional engineering achievement. Real-time embedded inference running stably with thorough documentation.'
    }, fac1Token);
    recordResult('Faculty Final Evaluation & Project Completion', gradeRes.status === 200, gradeRes.body.message);

    // TEST 15: Direct SQLite Database Persistence Verification
    const directDb = new Database(DB_PATH, { readonly: true });
    const dbProj = directDb.prepare('SELECT * FROM group_projects WHERE id = ?').get(createdProject.id);
    const dbMembers = directDb.prepare('SELECT * FROM project_members WHERE project_id = ?').all(createdProject.id);
    const dbUpdates = directDb.prepare('SELECT * FROM project_updates WHERE project_id = ?').all(createdProject.id);
    const dbNotifs = directDb.prepare("SELECT * FROM notifications WHERE message LIKE ?").all(`%${createdProject.title}%`);
    directDb.close();

    const dbVerified = dbProj?.status === 'Completed' &&
                       dbProj?.final_grade === 'A+ (98/100)' &&
                       dbProj?.progress_pct === 100 &&
                       dbMembers.length === 2 &&
                       dbUpdates.length === 1 &&
                       dbNotifs.length > 0;

    recordResult('Direct SQLite Database Audit & State Verification', dbVerified, `Members: ${dbMembers.length}, Updates: ${dbUpdates.length}, Notifications: ${dbNotifs.length}`);

    // TEST 16: Clean up test fixtures to preserve pure database
    const cleanDb = new Database(DB_PATH);
    cleanDb.prepare('DELETE FROM notifications WHERE message LIKE ?').run(`%${createdProject.title}%`);
    cleanDb.prepare('DELETE FROM project_updates WHERE project_id = ?').run(createdProject.id);
    cleanDb.prepare('DELETE FROM project_members WHERE project_id = ?').run(createdProject.id);
    cleanDb.prepare('DELETE FROM group_projects WHERE id = ?').run(createdProject.id);
    cleanDb.prepare('DELETE FROM student_profiles WHERE user_id IN (?, ?, ?, ?)').run(s1Id, s2Id, s3Id, outsiderReg.body.user.id);
    cleanDb.prepare('DELETE FROM sessions WHERE user_id IN (?, ?, ?, ?)').run(s1Id, s2Id, s3Id, outsiderReg.body.user.id);
    cleanDb.prepare('DELETE FROM users WHERE id IN (?, ?, ?, ?)').run(s1Id, s2Id, s3Id, outsiderReg.body.user.id);
    cleanDb.close();
    recordResult('Isolated Test Data Cleanup', true, 'Test student accounts and temporary project records cleanly purged');

    console.log('\n================================================================');
    const allPassed = testResults.every(r => r.passed);
    console.log(`SUMMARY: ${testResults.filter(r => r.passed).length}/${testResults.length} WORKFLOW & SECURITY TESTS PASSED (${allPassed ? '100% SUCCESS' : 'FAILURES DETECTED'})`);
    console.log('================================================================\n');

    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('Test Suite Failed with Exception:', err);
    process.exit(1);
  }
}

runGroupProjectsWorkflowTests();
