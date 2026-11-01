const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Header Button
const target1 = `<button class="btn-outline btn-sm" onclick="loadAptitudeQuestions('All')">
              <span>Restart Test</span>
            </button>`;
const repl1 = `<button class="btn-outline btn-sm" onclick="restartAptitudeTest()" title="Generate a fresh randomized set of 15 questions from the Excel question bank">
              <span>New Question Set 🔄</span>
            </button>`;

if (content.includes(target1)) {
  content = content.replace(target1, repl1);
  console.log('Target 1 replaced');
} else {
  console.log('Target 1 not found via exact string, trying normalized match...');
  const rx1 = /<button class="btn-outline btn-sm" onclick="loadAptitudeQuestions\('All'\)">\s*<span>Restart Test<\/span>\s*<\/button>/;
  if (rx1.test(content)) {
    content = content.replace(rx1, repl1);
    console.log('Target 1 replaced via regex');
  } else {
    console.warn('Target 1 failed to match');
  }
}

// 2. Update Results Container Buttons
const target2 = `<button class="btn-primary btn-sm" onclick="navigateToRoute('/student/placement-prediction')">
                <span>Unlock Placement Prediction &rarr;</span>
              </button>`;
const repl2 = `<div style="display: flex; gap: 8px;">
                <button class="btn-outline btn-sm" onclick="restartAptitudeTest()" style="background: #FFFFFF;">
                  <span>Reattempt Test 🔄</span>
                </button>
                <button class="btn-primary btn-sm" onclick="navigateToRoute('/student/placement-prediction')">
                  <span>Unlock Placement Prediction &rarr;</span>
                </button>
              </div>`;

if (content.includes(target2)) {
  content = content.replace(target2, repl2);
  console.log('Target 2 replaced');
} else {
  const rx2 = /<button class="btn-primary btn-sm" onclick="navigateToRoute\('\/student\/placement-prediction'\)">\s*<span>Unlock Placement Prediction &rarr;<\/span>\s*<\/button>/;
  if (rx2.test(content)) {
    content = content.replace(rx2, repl2);
    console.log('Target 2 replaced via regex');
  } else {
    console.warn('Target 2 failed to match');
  }
}

// 3. Add Category Performance Breakdown before Review Accordion
const target3 = `<!-- Review Accordion -->`;
const repl3 = `<!-- 5-Category Breakdown Chips -->
            <h4 style="font-size: 13px; font-weight: 700; color: #1E293B; margin-bottom: 8px;">Category Performance Breakdown</h4>
            <div id="apt-res-category-breakdown" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 16px;"></div>

            <!-- Review Accordion -->`;

if (!content.includes('id="apt-res-category-breakdown"')) {
  if (content.includes(target3)) {
    content = content.replace(target3, repl3);
    console.log('Target 3 replaced');
  } else {
    console.warn('Target 3 failed to match');
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('index.html updated successfully!');

