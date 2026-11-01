const fs = require('fs');
const serverJs = fs.readFileSync('server.js', 'utf8');

const startIdx = serverJs.indexOf("app.get('/api/state'");
const endIdx = serverJs.indexOf("res.json({", startIdx);
const stateCode = serverJs.substring(startIdx, endIdx);
const gpIdx = stateCode.indexOf('groupProjects');
console.log('groupProjects in state:', gpIdx);
if (gpIdx !== -1) {
  console.log(stateCode.substring(gpIdx - 100, gpIdx + 300));
}
