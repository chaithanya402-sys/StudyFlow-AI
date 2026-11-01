const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const modals = [];
for (let i = 3200; i < lines.length; i++) {
  const match = lines[i].match(/id="(modal-[^"]+)"/);
  if (match) {
    modals.push({ line: i + 1, id: match[1], snippet: lines[i].trim() });
  }
}
console.log(JSON.stringify(modals, null, 2));
