const fs = require('fs');
const serverJs = fs.readFileSync('server.js', 'utf8');

const idx = serverJs.indexOf("app.get('/api/state'");
console.log(serverJs.substring(idx, idx + 1200));
