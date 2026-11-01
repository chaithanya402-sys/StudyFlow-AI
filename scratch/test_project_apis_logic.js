const { db } = require('../db');

console.log('Testing DB queries for group projects...');

// Check faculty subject assignments
const subjects = db.prepare('SELECT * FROM faculty_subject_assignments').all();
console.log('Faculty subject assignments:', subjects);

// Check if fac_001 and fac_002 exist
const facultyList = db.prepare("SELECT id, full_name, email, department FROM users WHERE role = 'faculty'").all();
console.log('Faculty list:', facultyList);

// Check student list
const studentList = db.prepare("SELECT id, full_name, email, roll_no FROM users WHERE role = 'student'").all();
console.log('Student list count:', studentList.length, studentList.slice(0, 3));
