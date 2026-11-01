const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// Replace \` with `
// Replace \${ with ${
appJs = appJs.split('\\`').join('`');
appJs = appJs.split('\\${').join('${');

fs.writeFileSync('app.js', appJs, 'utf8');
console.log('Successfully unescaped app.js');
