const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("app.get('/api/state'")) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
    for (let j = i; j < i + 100; j++) {
      if (lines[j].includes('groupProjects')) {
        console.log(`Line ${j + 1}: ${lines[j]}`);
      }
    }
    break;
  }
}
