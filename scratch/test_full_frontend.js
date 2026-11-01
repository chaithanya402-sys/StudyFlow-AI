const fs = require('fs');

// We test whether parsing the new functions with babel/node parser succeeds
const appJsContent = fs.readFileSync('app.js', 'utf8');

console.log('Original app.js length:', appJsContent.length);
