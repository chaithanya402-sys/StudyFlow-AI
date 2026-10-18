const http = require('http');
const Database = require('better-sqlite3');
const db = new Database('./data/studyflow.db');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      ...options
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function testTeja() {
  const token = 'test_teja_' + Date.now();
  db.prepare("INSERT OR REPLACE INTO sessions (token, user_id, role, expires_at) VALUES (?, 'std_mvcogb6x', 'student', datetime('now', '+1 day'))").run(token);

  console.log('Testing PUT /api/student/profile for teja...');
  const res = await request({
    path: '/api/student/profile',
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  }, {
    name: 'teja',
    email: 'charan@gmail.com',
    phone: '',
    degree: 'B.Tech',
    branch: 'CSE',
    college: 'College of Engineering, Hyderabad',
    currentYear: '2nd Year',
    city: 'Hyderabad',
    state: 'Telangana'
  });

  console.log('Response status:', res.status);
  console.log('Response data:', res.data);
}

testTeja().catch(console.error);
