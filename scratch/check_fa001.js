const Database = require('better-sqlite3');
const db = new Database('./data/studyflow.db');
const a = db.prepare("SELECT id, meta_json FROM assignments WHERE id='fa_001'").get();
console.log('fa_001 meta_json parsed:');
console.log(JSON.parse(a.meta_json));
