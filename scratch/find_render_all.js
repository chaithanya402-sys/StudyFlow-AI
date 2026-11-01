const fs = require('fs');
const lines = fs.readFileSync('app.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function renderAllViews')) {
    console.log(`renderAllViews at line ${i + 1}`);
    for (let j = i; j < i + 30; j++) {
      console.log(lines[j]);
    }
    break;
  }
}
