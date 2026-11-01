const fs = require('fs');
const dbJs = fs.readFileSync('db.js', 'utf8');

const tableMatches = dbJs.match(/CREATE TABLE IF NOT EXISTS ([a-zA-Z0-9_]+)/g);
console.log('Current tables in db.js:', tableMatches);
