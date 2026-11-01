const fs = require('fs');
const appJs = fs.readFileSync('app.js', 'utf8');

const idx = appJs.indexOf('faculty-group-projects-container');
console.log(appJs.substring(idx + 1000, idx + 2500));
