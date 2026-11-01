const fs = require('fs');
const dbJs = fs.readFileSync('db.js', 'utf8');

const idx = dbJs.indexOf('CREATE TABLE IF NOT EXISTS faculty_subject_assignments');
console.log(dbJs.substring(idx, idx + 3500));
