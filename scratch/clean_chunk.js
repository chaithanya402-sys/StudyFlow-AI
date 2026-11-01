const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const stray = "  };\n`;\n\nconsole.log('Complete chunk ready. Size in characters:', chunk.length)";
if (appJs.includes(stray)) {
  appJs = appJs.replace(stray, "  };");
  console.log('Stray removed successfully');
} else {
  console.log('Stray not found by exact string, searching substring');
  const idx = appJs.indexOf("console.log('Complete chunk ready");
  if (idx !== -1) {
    const start = appJs.lastIndexOf("};", idx);
    const end = appJs.indexOf("\n", idx);
    appJs = appJs.slice(0, start + 2) + "\n" + appJs.slice(end + 1);
    console.log('Removed around index', idx);
  }
}

fs.writeFileSync('app.js', appJs, 'utf8');
