const fs = require('fs');
const ds = fs.readFileSync('dataStore.js', 'utf8');

const matches = [];
let idx = 0;
while ((idx = ds.indexOf('fetch(', idx)) !== -1) {
  matches.push(ds.substring(idx - 30, idx + 150));
  idx += 6;
  if (matches.length >= 5) break;
}
console.log('Fetch calls in dataStore.js:\n', matches.join('\n---\n'));
