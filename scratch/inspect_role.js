const fs = require('fs');
const serverJs = fs.readFileSync('server.js', 'utf8');

const idx = serverJs.indexOf('function requireRole');
console.log('=== requireRole ===');
console.log(serverJs.substring(idx, idx + 600));
