const fs = require('fs');
const dbJs = fs.readFileSync('db.js', 'utf8');

const idx = dbJs.indexOf('function ensureFacultySubjectAssignments');
console.log(dbJs.substring(idx, idx + 2000));
