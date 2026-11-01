const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const regex = /border-top:\s*3px\s*solid\s*[^;"]+/g;
const matches = content.match(regex) || [];
console.log('Count:', matches.length);
