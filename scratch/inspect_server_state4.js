const fs = require('fs');
const serverJs = fs.readFileSync('server.js', 'utf8');

const startIdx = serverJs.indexOf("app.get('/api/state'");
const endIdx = serverJs.indexOf("res.json({", startIdx);
console.log(serverJs.substring(endIdx - 200, endIdx + 600));
