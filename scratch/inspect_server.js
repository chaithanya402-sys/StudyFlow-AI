const fs = require('fs');
const serverJs = fs.readFileSync('server.js', 'utf8');

const idx = serverJs.indexOf('authenticateToken');
console.log('=== authenticateToken definition ===');
console.log(serverJs.substring(idx, idx + 1000));

// Check where assignment routes or other routes are defined
const routeLines = serverJs.split('\n').filter(line => line.includes('app.get(') || line.includes('app.post(') || line.includes('app.put('));
console.log('=== Sample API routes ===');
console.log(routeLines.slice(0, 25).join('\n'));
