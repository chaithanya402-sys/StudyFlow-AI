const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

function showModal(id) {
  const idx = html.indexOf(`id="${id}"`);
  if (idx === -1) return console.log(`Modal ${id} not found`);
  console.log(`=== ${id} ===`);
  console.log(html.substring(idx - 100, idx + 1200));
}

showModal('modal-create-assignment');
showModal('modal-grade-submission');
