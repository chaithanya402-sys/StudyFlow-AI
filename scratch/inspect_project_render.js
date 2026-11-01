const fs = require('fs');
const appJs = fs.readFileSync('app.js', 'utf8');

function showFunc(name, len = 2500) {
  const idx = appJs.indexOf(name);
  if (idx === -1) {
    console.log(`Func ${name} not found`);
    return;
  }
  console.log(`=== ${name} ===`);
  console.log(appJs.substring(idx, idx + len));
}

showFunc('function renderStudentGroupProjects');
showFunc('faculty-group-projects-container');
