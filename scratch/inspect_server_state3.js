const fs = require('fs');
const serverJs = fs.readFileSync('server.js', 'utf8');

const idx = serverJs.indexOf("groupProjects:");
if (idx !== -1) {
  console.log(serverJs.substring(idx - 100, idx + 400));
} else {
  const endIdx = serverJs.indexOf("res.json({ success: true, data:", serverJs.indexOf("app.get('/api/state'"));
  console.log(serverJs.substring(endIdx, endIdx + 800));
}
