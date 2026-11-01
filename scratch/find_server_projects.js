const fs = require('fs');
const serverJs = fs.readFileSync('server.js', 'utf8');

const matches = [];
let idx = 0;
while ((idx = serverJs.indexOf('/api/projects', idx)) !== -1) {
  matches.push(serverJs.substring(idx - 30, idx + 100));
  idx += 13;
}
console.log('Matches for /api/projects in server.js:', matches);
