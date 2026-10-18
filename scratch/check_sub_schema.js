const Database = require('better-sqlite3');
const db = new Database('./data/studyflow.db');
console.log('Index list for submissions:');
console.log(db.prepare("PRAGMA index_list('submissions')").all());
console.log('SQL for submissions:');
console.log(db.prepare("SELECT sql FROM sqlite_master WHERE name='submissions'").get());
