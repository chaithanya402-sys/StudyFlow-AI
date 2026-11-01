const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
let appContent = fs.readFileSync(appPath, 'utf8');

const startMarker = '// 3. Aptitude Assessment Controller';
const endMarker = '// 4. Coding Assessment Controller';

const startIndex = appContent.indexOf(startMarker);
const endIndex = appContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
  console.error('Could not locate markers in app.js');
  process.exit(1);
}

const newAptitudeController = `// 3. Aptitude Assessment Controller
  let aptitudeQuestionsList = [];
  let aptitudeCurrentIndex = 0;
  let aptitudeUserAnswers = {};
  let aptitudeTimerInterval = null;
  let aptitudeSecondsRemaining = 900; // 15 mins
  let aptitudeAssessmentId = null;
  let aptitudeAutoSaveTimeout = null;
  let aptitudeDurationSeconds = 900;

  window.initAptitudeAssessment = function() {
    loadAptitudeQuestions(false);
    loadAptitudeHistory();
  };

  window.restartAptitudeTest = function() {
    const answered = Object.keys(aptitudeUserAnswers).length;
    if (answered > 0 && aptitudeSecondsRemaining > 0) {
      if (!confirm('Start a new examination? Your current progress will be reset and a fresh randomized set of 15 questions from the Excel question bank will be generated.')) {
        return;
      }
    }
    loadAptitudeQuestions(true);
  };

  window.loadAptitudeQuestions = async function(forceRestart = false) {
    try {
      const url = \`/api/aptitude/questions\${forceRestart ? '?restart=true' : ''}\`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) {
        window.showToast?.(data.error || 'Failed to load questions.', 'error');
        return;
      }

      aptitudeAssessmentId = data.assessment_id || null;
      aptitudeQuestionsList = data.questions || [];
      aptitudeCurrentIndex = 0;
      aptitudeUserAnswers = data.saved_answers ? { ...data.saved_answers } : {};
      aptitudeDurationSeconds = data.duration_seconds || 900;
      aptitudeSecondsRemaining = (data.seconds_remaining != null) ? data.seconds_remaining : aptitudeDurationSeconds;

      const paletteContainer = document.getElementById('apt-palette-container');
      if (paletteContainer) {
        paletteContainer.innerHTML = aptitudeQuestionsList.map((q, idx) => {
          const isAnswered = Boolean(aptitudeUserAnswers[q.id]);
          return \`
            <button type="button" class="palette-btn \${idx === 0 ? 'active' : ''} \${isAnswered ? 'answered' : ''}" id="apt-pal-\${idx}" onclick="jumpToAptitudeQuestion(\${idx})">
              \${idx + 1}
            </button>
          \`;
        }).join('');
      }

      startAptitudeTimer();
      renderAptitudeQuestion(0);

      const resultsBox = document.getElementById('apt-results-container');
      if (resultsBox) resultsBox.style.display = 'none';

      if (data.is_resumed) {
        window.showToast?.(\`Resumed active assessment (\${Object.keys(aptitudeUserAnswers).length} answers saved).\`, 'info');
      } else if (forceRestart) {
        window.showToast?.('Fresh randomized 15-question examination loaded from Excel bank!', 'success');
      }
    } catch (err) {
      console.warn('[StudyFlow] Error loading aptitude questions:', err);
      window.showToast?.('Error loading examination questions.', 'error');
    }
  };

  function startAptitudeTimer() {
    if (aptitudeTimerInterval) clearInterval(aptitudeTimerInterval);
    const timerText = document.getElementById('apt-timer-text');
    const timerBox = document.getElementById('apt-timer-display');

    const updateDisplay = () => {
      const mins = Math.max(0, Math.floor(aptitudeSecondsRemaining / 60));
      const secs = Math.max(0, aptitudeSecondsRemaining % 60);
      if (timerText) {
        timerText.textContent = \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
      }
      if (timerBox) {
        timerBox.classList.toggle('warning', aptitudeSecondsRemaining < 120);
      }
    };

    updateDisplay();

    aptitudeTimerInterval = setInterval(() => {
      aptitudeSecondsRemaining--;
      if (aptitudeSecondsRemaining <= 0) {
        clearInterval(aptitudeTimerInterval);
        updateDisplay();
        window.showToast?.('Time expired! Submitting your examination answers automatically...', 'warning');
        submitAptitudeAssessment(true);
        return;
      }
      updateDisplay();
    }, 1000);
  }

  window.renderAptitudeQuestion = function(idx) {
    if (!aptitudeQuestionsList || idx < 0 || idx >= aptitudeQuestionsList.length) return;
    aptitudeCurrentIndex = idx;
    const q = aptitudeQuestionsList[idx];

    const counter = document.getElementById('apt-question-counter');
    const catLabel = document.getElementById('apt-q-category');
    const diffLabel = document.getElementById('apt-q-difficulty');
    const qText = document.getElementById('apt-q-text');
    const optAText = document.getElementById('apt-opt-a-text');
    const optBText = document.getElementById('apt-opt-b-text');
    const optCText = document.getElementById('apt-opt-c-text');
    const optDText = document.getElementById('apt-opt-d-text');
    const catTopPill = document.getElementById('apt-category-pill');

    if (counter) counter.textContent = \`Question \${idx + 1} of \${aptitudeQuestionsList.length}\`;
    if (catLabel) catLabel.textContent = q.category || 'Quantitative Aptitude';
    if (catTopPill) catTopPill.textContent = q.topic ? \`\${q.category} • \${q.topic}\` : (q.category || 'Aptitude');
    if (diffLabel) diffLabel.textContent = \`\${q.difficulty || 'Medium'} Difficulty\`;
    if (qText) qText.textContent = q.question_text;
    if (optAText) optAText.textContent = q.option_a || 'Option A';
    if (optBText) optBText.textContent = q.option_b || 'Option B';
    if (optCText) optCText.textContent = q.option_c || 'Option C';
    if (optDText) optDText.textContent = q.option_d || 'Option D';

    const chosen = aptitudeUserAnswers[q.id];
    const options = document.querySelectorAll('#apt-options-container .mcq-option');
    options.forEach(opt => {
      const letter = opt.querySelector('.mcq-letter')?.textContent?.trim();
      opt.classList.toggle('selected', letter === chosen);
    });

    document.querySelectorAll('.palette-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === idx);
    });
  };

  window.jumpToAptitudeQuestion = function(idx) {
    renderAptitudeQuestion(idx);
  };

  window.selectAptitudeOption = function(optionLetter) {
    const q = aptitudeQuestionsList[aptitudeCurrentIndex];
    if (!q) return;
    aptitudeUserAnswers[q.id] = optionLetter;

    const options = document.querySelectorAll('#apt-options-container .mcq-option');
    options.forEach(opt => {
      const letter = opt.querySelector('.mcq-letter')?.textContent?.trim();
      opt.classList.toggle('selected', letter === optionLetter);
    });

    const palBtn = document.getElementById(\`apt-pal-\${aptitudeCurrentIndex}\`);
    if (palBtn) palBtn.classList.add('answered');

    // Debounced autosave to active session
    if (aptitudeAssessmentId) {
      clearTimeout(aptitudeAutoSaveTimeout);
      aptitudeAutoSaveTimeout = setTimeout(() => {
        fetch(\`/api/aptitude/assessment/\${aptitudeAssessmentId}/save\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ answers: aptitudeUserAnswers })
        }).catch(() => {});
      }, 400);
    }
  };

  window.nextAptitudeQuestion = function() {
    if (aptitudeCurrentIndex < aptitudeQuestionsList.length - 1) {
      renderAptitudeQuestion(aptitudeCurrentIndex + 1);
    } else {
      window.showToast?.('Reached final question. Review your answers or click Submit Test.', 'info');
    }
  };

  window.prevAptitudeQuestion = function() {
    if (aptitudeCurrentIndex > 0) {
      renderAptitudeQuestion(aptitudeCurrentIndex - 1);
    }
  };

  window.clearAptitudeSelection = function() {
    const q = aptitudeQuestionsList[aptitudeCurrentIndex];
    if (!q) return;
    delete aptitudeUserAnswers[q.id];
    document.querySelectorAll('#apt-options-container .mcq-option').forEach(opt => opt.classList.remove('selected'));
    const palBtn = document.getElementById(\`apt-pal-\${aptitudeCurrentIndex}\`);
    if (palBtn) palBtn.classList.remove('answered');

    if (aptitudeAssessmentId) {
      fetch(\`/api/aptitude/assessment/\${aptitudeAssessmentId}/save\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers: aptitudeUserAnswers })
      }).catch(() => {});
    }
  };

  window.submitAptitudeAssessment = async function(isAutoSubmit = false) {
    if (aptitudeTimerInterval) clearInterval(aptitudeTimerInterval);

    const answeredCount = Object.keys(aptitudeUserAnswers).length;
    const totalCount = aptitudeQuestionsList.length;

    if (!isAutoSubmit && answeredCount < totalCount) {
      const confirmSubmit = confirm(\`You have answered \${answeredCount} of \${totalCount} questions. Unanswered questions will receive 0 marks. Do you want to submit now?\`);
      if (!confirmSubmit) {
        startAptitudeTimer();
        return;
      }
    }

    const timeTaken = Math.max(1, aptitudeDurationSeconds - aptitudeSecondsRemaining);

    try {
      const res = await fetch('/api/aptitude/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assessment_id: aptitudeAssessmentId,
          category: 'Placement Aptitude Examination (Excel Question Bank)',
          answers: aptitudeUserAnswers,
          time_taken_seconds: timeTaken
        })
      });
      const data = await res.json();
      if (!data.success) {
        window.showToast?.(data.error || 'Failed to submit test.', 'error');
        return;
      }

      const att = data.attempt;
      const review = data.review || [];

      const kpiScore = document.getElementById('apt-kpi-score');
      const kpiAcc = document.getElementById('apt-kpi-accuracy');
      if (kpiScore) kpiScore.textContent = \`\${att.accuracy_percentage}%\`;
      if (kpiAcc) kpiAcc.textContent = \`\${att.formula_accuracy != null ? att.formula_accuracy : att.accuracy_percentage}%\`;

      const resBox = document.getElementById('apt-results-container');
      const resCorrect = document.getElementById('apt-res-correct');
      const resIncorrect = document.getElementById('apt-res-incorrect');
      const resAccuracy = document.getElementById('apt-res-accuracy');
      const resTime = document.getElementById('apt-res-time');
      const reviewList = document.getElementById('apt-review-list');
      const categoryBreakdown = document.getElementById('apt-res-category-breakdown');

      if (resBox) {
        resBox.style.display = 'block';
        resBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (resCorrect) resCorrect.textContent = att.correct_answers;
      if (resIncorrect) resIncorrect.textContent = att.incorrect_answers;
      if (resAccuracy) resAccuracy.textContent = \`\${att.accuracy_percentage}%\`;
      if (resTime) resTime.textContent = \`\${Math.floor(att.time_taken_seconds / 60)}m \${att.time_taken_seconds % 60}s\`;

      // Render 5-category breakdown
      if (categoryBreakdown && att.category_scores) {
        categoryBreakdown.innerHTML = Object.entries(att.category_scores).map(([cat, stats]) => {
          const acc = stats.accuracy_percentage || 0;
          const color = acc >= 75 ? '#15803D' : (acc >= 40 ? '#2563EB' : '#DC2626');
          const bg = acc >= 75 ? '#F0FDF4' : (acc >= 40 ? '#EFF6FF' : '#FEF2F2');
          const border = acc >= 75 ? '#BBF7D0' : (acc >= 40 ? '#BFDBFE' : '#FECACA');
          return \`
            <div style="background: \${bg}; border: 1px solid \${border}; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 11px; font-weight: 700; color: #1E293B; margin-bottom: 4px;">\${cat}</div>
              <div style="font-size: 18px; font-weight: 800; color: \${color};">\${stats.correct} / \${stats.total}</div>
              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
                Accuracy: <strong>\${acc}%</strong> &bull; Attempted: \${stats.attempted}/\${stats.total}
              </div>
            </div>
          \`;
        }).join('');
      }

      if (reviewList) {
        reviewList.innerHTML = review.map((r, i) => {
          const isCorrect = r.isCorrect;
          const borderColor = isCorrect ? '#86EFAC' : '#FCA5A5';
          const badgeBg = isCorrect ? 'teal' : 'red';
          const badgeText = isCorrect ? 'Correct (+1)' : (r.isAttempted ? 'Incorrect (0)' : 'Unanswered (0)');

          return \`
            <div style="background: #FFFFFF; border: 1px solid \${borderColor}; border-radius: 8px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <strong style="font-size: 13px; color: #1E293B;">Q\${i + 1}.</strong>
                  <span style="font-size: 11px; color: #2563EB; font-weight: 600;">[\${r.category || 'Aptitude'}]</span>
                  <span style="font-size: 11px; color: #64748B;">Topic: \${r.topic || 'General'}</span>
                </div>
                <span class="badge-status \${badgeBg}">\${badgeText}</span>
              </div>
              <div style="font-size: 13px; color: #0F172A; margin-bottom: 8px; font-weight: 500;">
                \${r.question}
              </div>
              <div style="font-size: 12px; margin-bottom: 6px; display: flex; flex-wrap: wrap; gap: 12px;">
                <span>Your Answer: <strong>\${r.studentAnswer ? \`Option \${r.studentAnswer} (\${r.studentAnswerText || ''})\` : 'Not Answered'}</strong></span>
                <span style="color: #15803D;">Correct Answer: <strong>Option \${r.correctAnswer} (\${r.correctAnswerText || ''})</strong></span>
              </div>
              <div style="font-size: 11.5px; color: #475569; background: #F8FAFC; padding: 8px 10px; border-radius: 6px; border: 1px solid #E2E8F0;">
                <strong>Explanation:</strong> \${r.explanation || 'Refer to standard mathematical principles and formula rules.'}
              </div>
            </div>
          \`;
        }).join('');
      }

      window.showToast?.(\`✓ Assessment submitted! Scored \${att.correct_answers}/\${att.total_questions} (\${att.accuracy_percentage}% accuracy).\`, 'success');
      loadAptitudeHistory();
      if (typeof fetchPlacementPrediction === 'function') {
        fetchPlacementPrediction();
      }
    } catch (err) {
      window.showToast?.(err.message, 'error');
    }
  };

  window.loadAptitudeHistory = async function() {
    try {
      const res = await fetch('/api/aptitude/history', { credentials: 'include' });
      const data = await res.json();
      if (!data.success) return;

      const history = data.history || [];
      const tbody = document.getElementById('apt-history-tbody');
      const countEl = document.getElementById('apt-kpi-attempts-count');
      if (countEl) countEl.textContent = history.length;

      if (history.length > 0) {
        const latest = history[0];
        const kpiScore = document.getElementById('apt-kpi-score');
        const kpiAcc = document.getElementById('apt-kpi-accuracy');
        if (kpiScore && latest.accuracy_percentage != null) {
          kpiScore.textContent = \`\${latest.accuracy_percentage}%\`;
        }
        if (kpiAcc && latest.accuracy_percentage != null) {
          kpiAcc.textContent = \`\${latest.accuracy_percentage}%\`;
        }
      }

      if (tbody) {
        if (history.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 16px;">No attempts recorded yet. Click \\'New Question Set\\' to begin.</td></tr>';
        } else {
          tbody.innerHTML = history.map((h, idx) => {
            const dateStr = h.created_at ? new Date(h.created_at).toLocaleString() : 'Recent';
            const attNum = h.attempt_number || (history.length - idx);
            const statusClass = (h.accuracy_percentage >= 70) ? 'teal' : ((h.accuracy_percentage >= 40) ? 'blue' : 'neutral');
            const statusLabel = (h.accuracy_percentage >= 70) ? 'High Score' : ((h.accuracy_percentage >= 40) ? 'Passed' : 'Needs Practice');
            return \`
              <tr>
                <td>\${dateStr}</td>
                <td><strong>Attempt #\${attNum}</strong><div style="font-size: 11px; color: var(--text-secondary);">\${h.category}</div></td>
                <td><strong>\${h.correct_answers}</strong> / \${h.total_questions}</td>
                <td><span class="kpi-pill \${h.accuracy_percentage >= 75 ? 'teal' : 'blue'}">\${h.accuracy_percentage}%</span></td>
                <td>\${h.time_taken_seconds}s</td>
                <td><span class="badge-status \${statusClass}">\${statusLabel}</span></td>
              </tr>
            \`;
          }).join('');
        }
      }
    } catch (err) {
      console.warn('[StudyFlow] Error loading aptitude history:', err);
    }
  };

  `;

appContent = appContent.slice(0, startIndex) + newAptitudeController + appContent.slice(endIndex);
fs.writeFileSync(appPath, appContent, 'utf8');
console.log('app.js aptitude controller patched successfully!');

