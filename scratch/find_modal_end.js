const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.lastIndexOf('modal-submission-details');
const endIdx = html.indexOf('</div>\n  </div>', idx);
console.log(html.substring(endIdx, endIdx + 600));
