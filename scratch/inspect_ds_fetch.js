const fs = require('fs');
const ds = fs.readFileSync('dataStore.js', 'utf8');

const idx = ds.indexOf('fetchTasks');
console.log(ds.substring(idx, idx + 800));
