const express = require('express');
const { db } = require('../db');
const { registerProjectRoutes } = require('./project_router');

const app = express();
app.use(express.json());

// Mock auth middleware for testing
let mockUser = null;
app.use((req, res, next) => {
  req.user = mockUser;
  next();
});

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles.`
      });
    }
    next();
  };
}

registerProjectRoutes(app, { requireRole });

const server = app.listen(4567, async () => {
  console.log('Test server running on port 4567');
  const baseUrl = 'http://localhost:4567';

  try {
    // 1. Test GET /api/faculty/subjects
    console.log('\n--- 1. Testing GET /api/faculty/subjects ---');
    let res = await fetch(`${baseUrl}/api/faculty/subjects`);
    let data = await res.json();
    console.log('Subjects found:', data.subjects.length, 'Faculty found:', data.faculty.length);
    if (!data.success || data.subjects.length === 0) throw new Error('Failed GET /api/faculty/subjects');

    // 2. Test GET /api/students/eligible
    console.log('\n--- 2. Testing GET /api/students/eligible ---');
    res = await fetch(`${baseUrl}/api/students/eligible`);
    data = await res.json();
    console.log('Eligible students count:', data.students.length);
    if (!data.success || data.students.length < 2) throw new Error('Failed GET /api/students/eligible');

    const student1 = data.students[0];
    const student2 = data.students[1];
    console.log(`Using Student 1: ${student1.full_name} (${student1.id}), Student 2: ${student2.full_name} (${student2.id})`);

    // 3. Test POST /api/projects with only 1 member (should fail validation)
    console.log('\n--- 3. Testing POST /api/projects (Reject 1-person team) ---');
    mockUser = { id: student1.id, fullName: student1.full_name, email: student1.email, role: 'student' };
    res = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Solo Project Attempt',
        subject: 'Machine Learning & AI',
        domain: 'Artificial Intelligence',
        description: 'Should fail due to team size.',
        team_name: 'Solo Team',
        members: [] // Only student1, team size = 1
      })
    });
    data = await res.json();
    console.log('1-person team rejection result:', res.status, data.error);
    if (res.status !== 400 || !data.error.includes('minimum of 2')) {
      throw new Error('Did not properly reject 1-person team');
    }

    // 4. Test POST /api/projects with 6 members (should fail validation)
    console.log('\n--- 4. Testing POST /api/projects (Reject >5 members) ---');
    res = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Huge Team Attempt',
        subject: 'Machine Learning & AI',
        domain: 'Artificial Intelligence',
        description: 'Should fail due to >5 members.',
        team_name: 'Huge Team',
        members: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6']
      })
    });
    data = await res.json();
    console.log('6-person team rejection result:', res.status, data.error);
    if (res.status !== 400 || !data.error.includes('maximum of 5')) {
      throw new Error('Did not properly reject >5 team members');
    }

    // 5. Test POST /api/projects with valid 2-student team
    console.log('\n--- 5. Testing POST /api/projects (Valid 2-member creation) ---');
    res = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Autonomous Campus Placement Forecasting Engine',
        subject: 'Machine Learning & AI',
        domain: 'Artificial Intelligence & Predictive Analytics',
        problem_statement: 'Students lack real-time predictive insights on academic placement readiness.',
        objectives: 'Build an end-to-end ML pipeline with regression and classification models.',
        description: 'Collaborative machine learning solution connecting student profile metrics to placement outcomes.',
        tech_stack: 'Python, Scikit-Learn, SQLite, Express.js, Chart.js',
        deliverables: 'Working model, web interface, technical documentation, evaluation report.',
        start_date: '2026-10-18',
        target_date: '2026-12-15',
        team_name: 'Team NeuroFlow',
        leader_id: student1.id,
        mentor_id: 'fac_001',
        members: [student1.id, student2.id]
      })
    });
    data = await res.json();
    console.log('Project creation result:', res.status, data.message);
    if (res.status !== 201 || !data.project) throw new Error('Failed to create project: ' + JSON.stringify(data));
    const createdProject = data.project;
    console.log('Created project ID:', createdProject.id, 'Assigned Approver:', createdProject.approver_name, 'Status:', createdProject.status);
    if (createdProject.approver_id !== 'fac_001') {
      throw new Error(`Expected approver fac_001 for 'Machine Learning & AI', got: ${createdProject.approver_id}`);
    }

    // 6. Test GET /api/projects as Student
    console.log('\n--- 6. Testing GET /api/projects (Student View) ---');
    res = await fetch(`${baseUrl}/api/projects`);
    data = await res.json();
    console.log('Student visible projects:', data.projects.length);
    const foundProj = data.projects.find(p => p.id === createdProject.id);
    if (!foundProj) throw new Error('Created project not found in student project list');
    console.log('Found project in list with members:', foundProj.members.length);

    // 7. Test Subject-based Authorization: fac_002 tries to approve fac_001's subject (Should be rejected with 403 Forbidden!)
    console.log('\n--- 7. Testing Unauthorized Faculty Approval by fac_002 ---');
    mockUser = { id: 'fac_002', fullName: 'Prof. Anita Rao', email: 'anita.rao@college.edu', role: 'faculty' };
    res = await fetch(`${baseUrl}/api/projects/${createdProject.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback: 'Unauthorized approval attempt.' })
    });
    data = await res.json();
    console.log('Unauthorized approval result:', res.status, data.error);
    if (res.status !== 403) {
      throw new Error('Unrelated faculty was able to approve project! Expected 403 Forbidden.');
    }

    // 8. Test Authorized Approval by fac_001 (Designated Subject Faculty)
    console.log('\n--- 8. Testing Authorized Faculty Approval by fac_001 ---');
    mockUser = { id: 'fac_001', fullName: 'Dr. Rajesh Sharma', email: 'dr.rajesh.mentor@college.edu', role: 'faculty' };
    res = await fetch(`${baseUrl}/api/projects/${createdProject.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback: 'Strong proposal and methodology. Approved for development.' })
    });
    data = await res.json();
    console.log('Authorized approval result:', res.status, data.message);
    if (!data.success) throw new Error('Authorized approval failed');

    // 9. Test Student submitting Development Update
    console.log('\n--- 9. Testing Student Development Update Submission ---');
    mockUser = { id: student1.id, fullName: student1.full_name, email: student1.email, role: 'student' };
    res = await fetch(`${baseUrl}/api/projects/${createdProject.id}/updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage_milestone: '3. System design and architecture',
        progress_pct: 45,
        summary: 'Completed data schema modeling and baseline model benchmark comparison.',
        tasks_completed: 'Cleaned feature matrix, trained Random Forest and Gradient Boosting baselines.',
        tasks_remaining: 'Hyperparameter tuning and REST API integration.',
        challenges_blockers: 'Data imbalance in high-package tier resolved with SMOTE.',
        next_steps: 'Deploy model artifact to production server.',
        github_url: 'https://github.com/studyflow-ai/capstone-ml-engine'
      })
    });
    data = await res.json();
    console.log('Development update result:', res.status, data.message);
    if (!data.success) throw new Error('Failed to record development update');

    // 10. Test Faculty Supervision Feedback
    console.log('\n--- 10. Testing Faculty Supervision Feedback ---');
    mockUser = { id: 'fac_001', fullName: 'Dr. Rajesh Sharma', email: 'dr.rajesh.mentor@college.edu', role: 'faculty' };
    res = await fetch(`${baseUrl}/api/projects/${createdProject.id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback: 'Good progress on baseline metrics. Ensure cross-validation folds are stratified.' })
    });
    data = await res.json();
    console.log('Supervision feedback result:', res.status, data.message);
    if (!data.success) throw new Error('Failed to record faculty feedback');

    // 11. Test Faculty Final Evaluation & Grading
    console.log('\n--- 11. Testing Faculty Final Evaluation & Grading ---');
    res = await fetch(`${baseUrl}/api/projects/${createdProject.id}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        final_grade: 'A+ (96/100)',
        evaluation_notes: 'Exemplary project execution, thorough documentation, and working demonstration.'
      })
    });
    data = await res.json();
    console.log('Final evaluation result:', res.status, data.message);
    if (!data.success) throw new Error('Failed to record final grade');

    // 12. Verify Project Details
    console.log('\n--- 12. Verify Final Project Details ---');
    mockUser = { id: student1.id, fullName: student1.full_name, email: student1.email, role: 'student' };
    res = await fetch(`${baseUrl}/api/projects/${createdProject.id}`);
    data = await res.json();
    const finalProj = data.project;
    console.log('Project status:', finalProj.status);
    console.log('Project final grade:', finalProj.final_grade);
    console.log('Project updates count:', finalProj.updates.length);
    console.log('Project supervisor feedback:', finalProj.faculty_feedback);
    if (finalProj.status !== 'Completed' || finalProj.final_grade !== 'A+ (96/100)' || finalProj.updates.length === 0) {
      throw new Error('Final project verification failed!');
    }

    console.log('\n>>> ALL 12 BACKEND UNIT AND SECURITY TESTS PASSED PERFECTLY! <<<');
  } catch (e) {
    console.error('\nTEST FAILED:', e);
  } finally {
    server.close();
  }
});
