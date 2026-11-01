const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const panes = [];
for (let i = 0; i < lines.length; i++) {
  const match = lines[i].match(/id="(pane-[^"]+)"/);
  if (match) {
    panes.push({ line: i + 1, id: match[1], snippet: lines[i].trim() });
  }
}
console.log(JSON.stringify(panes, null, 2));
