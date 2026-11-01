const fs = require('fs');
const dbJs = fs.readFileSync('db.js', 'utf8');

const idx = dbJs.indexOf('-- 21. Project Development Updates Table');
console.log(dbJs.substring(idx, idx + 2500));
