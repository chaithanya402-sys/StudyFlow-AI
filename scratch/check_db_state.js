const Database = require('better-sqlite3');
const db = new Database('./data/studyflow.db');

for (const tbl of ['users', 'student_profiles', 'assignments', 'submissions']) {
  console.log(`\n--- ${tbl} schema ---`);
  console.log(db.prepare(`PRAGMA table_info(${tbl})`).all().map(c => `${c.name} (${c.type})`));
}

console.log('\n--- Users ---');
console.log(db.prepare("SELECT * FROM users").all());

console.log('\n--- Student Profiles ---');
console.log(db.prepare("SELECT * FROM student_profiles").all());

console.log('\n--- Assignments ---');
console.log(db.prepare("SELECT id, title, type, category, target_class, status FROM assignments").all());

console.log('\n--- Submissions ---');
console.log(db.prepare("SELECT * FROM submissions").all());
