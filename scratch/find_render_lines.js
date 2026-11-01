const fs = require('fs');
const lines = fs.readFileSync('app.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function renderStudentGroupProjects')) {
    console.log(`renderStudentGroupProjects at line ${i + 1}`);
  }
  if (lines[i].includes('faculty-group-projects-container')) {
    console.log(`faculty-group-projects-container at line ${i + 1}`);
  }
}
