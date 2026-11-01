const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('/api/faculty/subjects')) {
    console.log(`Route /api/faculty/subjects at line ${i + 1}`);
  }
  if (lines[i].includes('API endpoint not found')) {
    console.log(`API endpoint not found 404 handler at line ${i + 1}`);
  }
}
