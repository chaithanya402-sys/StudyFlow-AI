const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.lastIndexOf('modal-overlay');
console.log('Last modal-overlay index:', idx);
console.log(html.substring(idx - 50, idx + 800));
