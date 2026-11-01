const fs = require('fs');
const serverJs = fs.readFileSync('server.js', 'utf8');

const idx = serverJs.indexOf("app.get('/api/state'");
console.log(serverJs.substring(idx + 1200, idx + 2500));
