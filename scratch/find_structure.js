const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

const paneRegex = /id="(pane-[^"]+)"/g;
let match;
const panes = [];
while ((match = paneRegex.exec(indexHtml)) !== null) {
  panes.push(match[1]);
}
console.log('Panes in index.html:', panes);

const modalRegex = /id="(modal-[^"]+)"/g;
const modals = [];
while ((match = modalRegex.exec(indexHtml)) !== null) {
  modals.push(match[1]);
}
console.log('Modals in index.html:', modals);

// Check for faculty routes or sections in app.js
const appJs = fs.readFileSync('app.js', 'utf8');
const routeMatches = appJs.match(/#\/(?:student|faculty|officer)\/[a-zA-Z0-9_-]+/g);
console.log('Unique routes in app.js:', [...new Set(routeMatches)]);
