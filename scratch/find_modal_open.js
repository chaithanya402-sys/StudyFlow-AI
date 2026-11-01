const fs = require('fs');

function findInFiles(files, term) {
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const idx = content.indexOf(term);
    if (idx !== -1) {
      console.log(`Found "${term}" in ${f} at ${idx}:`);
      console.log(content.substring(idx - 50, idx + 250));
    }
  }
}

findInFiles(['index.html', 'app.js', 'dataStore.js'], 'closeCreateAssignmentModal');
findInFiles(['index.html', 'app.js', 'dataStore.js'], 'modal-overlay');
