const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

function extractPane(id) {
  const startIdx = html.indexOf(`id="${id}"`);
  if (startIdx === -1) return 'NOT FOUND';
  return html.substring(startIdx, startIdx + 2000);
}

console.log('--- pane-student-projects ---');
console.log(extractPane('pane-student-projects'));
console.log('--- pane-faculty-submissions-projects ---');
console.log(extractPane('pane-faculty-submissions-projects'));
