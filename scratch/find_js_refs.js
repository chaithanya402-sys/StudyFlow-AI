const fs = require('fs');

function searchFile(filename, keywords) {
  const content = fs.readFileSync(filename, 'utf8');
  console.log(`=== Results for ${filename} ===`);
  for (const kw of keywords) {
    let count = 0;
    let idx = 0;
    while ((idx = content.indexOf(kw, idx)) !== -1) {
      count++;
      const snippet = content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 200));
      console.log(`--- Match for "${kw}" at index ${idx}:`);
      console.log(snippet.replace(/\n+/g, ' '));
      idx += kw.length;
      if (count >= 3) break;
    }
    if (count === 0) {
      console.log(`No matches for "${kw}"`);
    }
  }
}

searchFile('app.js', ['student-projects-container', 'faculty-group-projects-container', 'renderStudentGroupProjects', 'group_projects']);
searchFile('dataStore.js', ['group_projects', 'projects', 'fetchGroupProjects']);
