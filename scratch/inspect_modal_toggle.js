const fs = require('fs');
const appJs = fs.readFileSync('app.js', 'utf8');

const idx = appJs.indexOf('function closeCreateAssignmentModal');
console.log(appJs.substring(idx, idx + 400));
