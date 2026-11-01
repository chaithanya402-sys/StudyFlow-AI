const path = require('path');
const { db } = require('../db.js');

async function testTasks() {
  const user = db.prepare("SELECT * FROM users WHERE role = 'student' LIMIT 1").get();
  console.log('Testing with student:', user.email, user.id);

  // Check tasks in DB for this student
  const tasks = db.prepare('SELECT * FROM mentor_tasks WHERE student_id = ?').all(user.id);
  console.log('Current tasks in DB for student:', tasks.length);
  tasks.forEach(t => console.log(' - Task:', t.id, t.title, '| Status:', t.status));

  // Now test HTTP GET /api/tasks with student query
  const res = await fetch(`http://localhost:3000/api/tasks?studentId=${user.id}`);
  const json = await res.json();
  console.log('GET /api/tasks response count:', json.count, 'success:', json.success);
}

testTasks().catch(console.error);
