const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.lastIndexOf('modal-submission-details');
console.log(html.substring(idx + 1000, idx + 2500));
