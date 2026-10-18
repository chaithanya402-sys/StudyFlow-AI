const Database = require('better-sqlite3');
const db = new Database('./data/studyflow.db');
const u = db.prepare("SELECT * FROM users WHERE email='pallachandu65@gmail.com'").get();
console.log('User:', u);
