const code = `
  // Project Details Workspace Modal
  window.openProjectDetailsModal = async function(projectId) {
    const modal = document.getElementById('modal-project-details');
    if (!modal) return;

    try {
      const res = await store.getProjectDetails(projectId);
      if (!res || !res.success || !res.project) {
        window.showToast?.(res?.error || 'Project could not be found.', 'error');
        return;
      }

      const p = res.project;
      window._currentActiveProject = p;

      // Populate header & meta
      document.getElementById('pd-domain-badge').textContent = p.domain || 'Engineering Capstone';
      const statusBadge = document.getElementById('pd-status-badge');
      let statusClass = 'teal';
      let statusLabel = p.status;
      if (p.status === 'Approved' || p.status === 'Development in Progress') {
        statusClass = 'success';
        statusLabel = 'Development in Progress';
      } else if (p.status === 'Changes Requested') {
        statusClass = 'warning';
        statusLabel = 'Changes Requested';
      } else if (p.status === 'Rejected') {
        statusClass = 'error';
        statusLabel = 'Rejected';
      } else if (p.status === 'Completed') {
        statusClass = 'success';
        statusLabel = 'Completed';
      }
      statusBadge.className = 'badge-status ' + statusClass;
      statusBadge.textContent = statusLabel;

      document.getElementById('pd-project-title').textContent = p.title;
      document.getElementById('pd-meta-subtitle').innerHTML = \`Subject: <strong>\${p.subject}</strong> &bull; Team: <strong>\${p.team_name}</strong>\`;

      // Status/Feedback Banner
      const fbBanner = document.getElementById('pd-feedback-banner');
      if (fbBanner) {
        if (p.status === 'Changes Requested') {
          fbBanner.style.display = 'block';
          fbBanner.style.background = '#FFFBEB';
          fbBanner.style.border = '1px solid #FCD34D';
          fbBanner.style.color = '#92400E';
          fbBanner.innerHTML = \`
            <div style="font-weight: 700; margin-bottom: 4px;">✎ Revisions Requested by Subject Faculty</div>
            <div style="font-size: 12.5px; line-height: 1.45;">"\${p.faculty_feedback || 'Please update your proposal scope and deliverables.'}"</div>
          \`;
        } else if (p.status === 'Rejected') {
          fbBanner.style.display = 'block';
          fbBanner.style.background = '#FEF2F2';
          fbBanner.style.border = '1px solid #FCA5A5';
          fbBanner.style.color = '#991B1B';
          fbBanner.innerHTML = \`
            <div style="font-weight: 700; margin-bottom: 4px;">✕ Proposal Rejected</div>
            <div style="font-size: 12.5px; line-height: 1.45;">Reason: "\${p.rejection_reason || 'Does not align with syllabus requirements.'}"</div>
          \`;
        } else if (p.status === 'Approved' || p.status === 'Development in Progress') {
          fbBanner.style.display = 'block';
          fbBanner.style.background = '#F0FDF4';
          fbBanner.style.border = '1px solid #BBF7D0';
          fbBanner.style.color = '#166534';
          fbBanner.innerHTML = \`
            <div style="font-weight: 700; margin-bottom: 2px;">✓ Proposal Approved by Subject Faculty</div>
            <div style="font-size: 12px;">\${p.faculty_feedback ? '"' + p.faculty_feedback + '"' : 'Team may proceed through scheduled development milestones.'}</div>
          \`;
        } else {
          fbBanner.style.display = 'block';
          fbBanner.style.background = '#EFF6FF';
          fbBanner.style.border = '1px solid #BFDBFE';
          fbBanner.style.color = '#1E40AF';
          fbBanner.innerHTML = \`
            <div style="font-weight: 600; font-size: 12.5px;">⏳ Proposal Submitted for Subject-Faculty Review</div>
            <div style="font-size: 11.5px; margin-top: 2px;">Designated reviewing faculty: <strong>\${p.approver_name || 'Subject Faculty'}</strong></div>
          \`;
        }
      }

      // Milestones progress
      const pct = p.progress_pct || 0;
      document.getElementById('pd-progress-pct-text').textContent = pct + '%';
      document.getElementById('pd-progress-bar').style.width = pct + '%';
      document.getElementById('pd-current-milestone-text').textContent = 'Stage: ' + (p.current_milestone || '1. Problem definition and requirements');

      // Milestone steps highlight
      const steps = [
        '1. Problem definition and requirements',
        '2. Literature review and planning',
        '3. System design and architecture',
        '4. Implementation and development',
        '5. Testing and evaluation',
        '6. Final report and demonstration'
      ];
      const curIdx = steps.findIndex(s => s.toLowerCase() === (p.current_milestone || '').toLowerCase());
      for (let i = 1; i <= 6; i++) {
        const el = document.getElementById('pd-mstep-' + i);
        if (el) {
          if (curIdx >= i - 1 || pct >= (i / 6) * 100) {
            el.style.background = '#0D9488';
            el.style.color = '#FFFFFF';
            el.style.fontWeight = '700';
          } else {
            el.style.background = '#F1F5F9';
            el.style.color = '#64748B';
            el.style.fontWeight = 'normal';
          }
        }
      }

      // Problem & Objectives
      document.getElementById('pd-problem-statement').textContent = p.problem_statement || 'No problem statement recorded.';
      document.getElementById('pd-objectives').textContent = p.objectives || 'No objectives recorded.';

      // Tech chips
      const chipsContainer = document.getElementById('pd-tech-chips');
      if (chipsContainer) {
        const techList = (p.tech_stack || '').split(',').map(s => s.trim()).filter(Boolean);
        chipsContainer.innerHTML = techList.map(t => \`<span class="skill-chip-pill" style="font-size: 11px; padding: 2px 8px;">\${t}</span>\`).join('');
      }

      // Dates & Links
      document.getElementById('pd-dates-info').textContent = \`Timeline: \${p.start_date || 'Started'} to \${p.target_date || 'Target'}\`;
      const linksContainer = document.getElementById('pd-links-container');
      if (linksContainer) {
        linksContainer.innerHTML = '';
        if (p.proposal_doc_url) {
          linksContainer.innerHTML += \`<a href="\${p.proposal_doc_url}" target="_blank" class="sub-file-badge" style="font-size: 11px;">📄 Proposal PDF</a>\`;
        }
        if (p.github_url) {
          linksContainer.innerHTML += \`<a href="\${p.github_url}" target="_blank" class="sub-file-badge" style="font-size: 11px;">GitHub Repo ↗</a>\`;
        }
      }

      // Approver & Mentor
      document.getElementById('pd-approver-name').textContent = p.approver_name || 'Pending Subject Assignment';
      document.getElementById('pd-mentor-name').textContent = p.mentor_name ? \`\${p.mentor_name} (\${p.mentor_status || 'Assigned'})\` : 'Not Assigned';

      // Final Grade
      const gradeBox = document.getElementById('pd-final-grade-box');
      if (gradeBox) {
        if (p.final_grade) {
          document.getElementById('pd-final-grade-text').textContent = \`\${p.final_grade} \${p.final_evaluation_notes ? '— ' + p.final_evaluation_notes : ''}\`;
          gradeBox.style.display = 'block';
        } else {
          gradeBox.style.display = 'none';
        }
      }

      // Team Roster
      const rosterContainer = document.getElementById('pd-team-roster');
      if (rosterContainer) {
        const members = Array.isArray(p.members) ? p.members : [];
        rosterContainer.innerHTML = members.map(m => {
          const isLead = m.role === 'Leader' || m.student_id === p.leader_id;
          return \`
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; padding: 4px 0; border-bottom: 1px solid #F1F5F9;">
              <div>
                <strong>\${m.student_name}</strong>
                <div style="font-size: 10.5px; color: #64748B;">\${m.email} \${m.roll_no ? '&bull; ' + m.roll_no : ''}</div>
              </div>
              <span class="badge-status \${isLead ? 'blue' : 'teal'}" style="font-size: 10px; padding: 2px 7px;">\${isLead ? 'Leader' : 'Member'}</span>
            </div>
          \`;
        }).join('');
      }

      // Action left button
      const actLeft = document.getElementById('pd-action-left');
      if (actLeft) {
        actLeft.innerHTML = '';
        if (p.status === 'Changes Requested' || p.status === 'Draft') {
          actLeft.innerHTML = \`
            <button type="button" class="btn-primary btn-sm" onclick="promptResubmitProposal('\${p.id}')">
              ✎ Edit & Resubmit Proposal
            </button>
          \`;
        }
      }

      // Progress Update Button visibility
      const btnSubmitUpdate = document.getElementById('btn-open-submit-update');
      if (btnSubmitUpdate) {
        btnSubmitUpdate.style.display = (p.status === 'Approved' || p.status === 'Development in Progress') ? 'inline-flex' : 'none';
      }

      // Render Updates Timeline
      const timeline = document.getElementById('pd-updates-timeline');
      if (timeline) {
        const updates = Array.isArray(p.updates) ? p.updates : [];
        if (updates.length === 0) {
          timeline.innerHTML = \`
            <div style="padding: 16px; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; text-align: center; font-size: 12px; color: #64748B;">
              No development updates recorded yet. Team members can post milestone progress once the proposal is approved.
            </div>
          \`;
        } else {
          timeline.innerHTML = updates.map(u => \`
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="badge-status teal" style="font-size: 11px;">\${u.stage_milestone}</span>
                <span style="font-size: 11.5px; font-weight: 700; color: #0D9488;">\${u.progress_pct}% Progress</span>
              </div>
              <div style="font-size: 12.5px; font-weight: 600; color: #1E293B; margin-bottom: 4px;">\${u.summary}</div>
              \${u.tasks_completed ? \`<div style="font-size: 11.5px; color: #334155; margin-bottom: 4px;"><strong>Completed:</strong> \${u.tasks_completed}</div>\` : ''}
              \${u.tasks_remaining ? \`<div style="font-size: 11.5px; color: #334155; margin-bottom: 4px;"><strong>Remaining:</strong> \${u.tasks_remaining}</div>\` : ''}
              \${u.challenges_blockers ? \`<div style="font-size: 11.5px; color: #DC2626; margin-bottom: 4px;"><strong>Blockers:</strong> \${u.challenges_blockers}</div>\` : ''}
              \${u.github_url ? \`<div style="margin-top: 6px;"><a href="\${u.github_url}" target="_blank" class="sub-file-badge" style="font-size: 10.5px;">GitHub Code ↗</a></div>\` : ''}
              \${u.faculty_feedback ? \`
                <div style="margin-top: 8px; padding: 8px 10px; background: #F0FDF4; border-left: 3px solid #10B981; border-radius: 4px; font-size: 11.5px; color: #166534;">
                  <strong>Supervisor Guidance (\${u.faculty_name || 'Faculty'}):</strong> \${u.faculty_feedback}
                </div>
              \` : ''}
              <div style="font-size: 10.5px; color: #94A3B8; margin-top: 6px; text-align: right;">
                Submitted by \${u.author_name} &bull; \${u.created_at}
              </div>
            </div>
          \`).join('');
        }
      }

      modal.style.display = 'flex';
    } catch (err) {
      window.showToast?.('Error loading project: ' + err.message, 'error');
    }
  };

  window.closeProjectDetailsModal = function() {
    const modal = document.getElementById('modal-project-details');
    if (modal) modal.style.display = 'none';
  };

  window.openSubmitProjectUpdateModal = function(projectId) {
    const pId = projectId || window._currentActiveProject?.id;
    if (!pId) {
      window.showToast?.('No active project selected.', 'error');
      return;
    }

    const modal = document.getElementById('modal-submit-project-update');
    if (!modal) return;

    document.getElementById('prup-project-id').value = pId;
    const errBox = document.getElementById('prup-error');
    if (errBox) { errBox.style.display = 'none'; errBox.textContent = ''; }

    const form = document.getElementById('form-submit-project-update');
    if (form) form.reset();

    // Default stage & progress
    if (window._currentActiveProject) {
      const stageSelect = document.getElementById('prup-stage');
      if (stageSelect && window._currentActiveProject.current_milestone) {
        stageSelect.value = window._currentActiveProject.current_milestone;
      }
      const progInput = document.getElementById('prup-progress');
      if (progInput) {
        progInput.value = window._currentActiveProject.progress_pct || 20;
      }
      const gitInput = document.getElementById('prup-github-url');
      if (gitInput && window._currentActiveProject.github_url) {
        gitInput.value = window._currentActiveProject.github_url;
      }
    }

    modal.style.display = 'flex';
  };

  window.closeSubmitProjectUpdateModal = function() {
    const modal = document.getElementById('modal-submit-project-update');
    if (modal) modal.style.display = 'none';
  };

  window.handleSaveProjectUpdate = async function(e) {
    if (e) e.preventDefault();
    const pId = document.getElementById('prup-project-id')?.value;
    if (!pId) return;

    const errBox = document.getElementById('prup-error');
    if (errBox) { errBox.style.display = 'none'; errBox.textContent = ''; }

    const stage = document.getElementById('prup-stage')?.value;
    const progress = parseInt(document.getElementById('prup-progress')?.value, 10);
    const summary = document.getElementById('prup-summary')?.value?.trim();
    const tasks_completed = document.getElementById('prup-tasks-completed')?.value?.trim();
    const tasks_remaining = document.getElementById('prup-tasks-remaining')?.value?.trim();
    const challenges = document.getElementById('prup-challenges')?.value?.trim();
    const next_steps = document.getElementById('prup-next-steps')?.value?.trim();
    const github_url = document.getElementById('prup-github-url')?.value?.trim();
    const attachments_url = document.getElementById('prup-attachments-url')?.value?.trim();

    if (isNaN(progress) || progress < 0 || progress > 100) {
      if (errBox) { errBox.textContent = 'Progress must be a number between 0 and 100.'; errBox.style.display = 'block'; }
      return;
    }
    if (!summary) {
      if (errBox) { errBox.textContent = 'Summary is required.'; errBox.style.display = 'block'; }
      return;
    }

    const saveBtn = document.getElementById('btn-save-project-update');
    if (saveBtn) saveBtn.disabled = true;

    try {
      const res = await store.submitProjectUpdate(pId, {
        stage_milestone: stage,
        progress_pct: progress,
        summary,
        tasks_completed,
        tasks_remaining,
        challenges_blockers: challenges,
        next_steps,
        github_url,
        attachments_url
      });

      if (res && res.success) {
        window.showToast?.('Milestone progress update recorded!', 'success');
        closeSubmitProjectUpdateModal();
        openProjectDetailsModal(pId);
        renderAllViews();
      } else {
        const msg = res?.error || 'Failed to record update.';
        if (errBox) { errBox.textContent = msg; errBox.style.display = 'block'; }
        window.showToast?.(msg, 'error');
      }
    } catch (err) {
      if (errBox) { errBox.textContent = err.message; errBox.style.display = 'block'; }
      window.showToast?.(err.message, 'error');
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  };

  // Faculty Review & Supervision Modal
  window.openFacultyProjectReviewModal = async function(projectId) {
    const modal = document.getElementById('modal-faculty-project-review');
    if (!modal) return;

    try {
      const res = await store.getProjectDetails(projectId);
      if (!res || !res.success || !res.project) {
        window.showToast?.('Project not found', 'error');
        return;
      }

      const p = res.project;
      window._facultyReviewActiveProject = p;

      document.getElementById('fpr-project-id').value = p.id;
      document.getElementById('fpr-title').textContent = \`Supervise Project: \${p.title}\`;
      document.getElementById('fpr-summary-title').textContent = p.title;
      document.getElementById('fpr-subject-badge').textContent = p.subject;
      document.getElementById('fpr-status-badge').textContent = p.status;
      document.getElementById('fpr-team-lead').textContent = \`Team: \${p.team_name} (\${p.leader_name} - Lead)\`;
      document.getElementById('fpr-summary-desc').textContent = p.description || p.problem_statement;

      const members = Array.isArray(p.members) ? p.members : [];
      document.getElementById('fpr-members-text').textContent = members.map(m => \`\${m.student_name} (\${m.role})\`).join(', ');
      document.getElementById('fpr-tech-text').textContent = p.tech_stack || 'None specified';

      const docRow = document.getElementById('fpr-proposal-doc-row');
      const docLink = document.getElementById('fpr-doc-link');
      if (p.proposal_doc_url) {
        docLink.href = p.proposal_doc_url;
        docRow.style.display = 'block';
      } else {
        docRow.style.display = 'none';
      }

      const feedbackInput = document.getElementById('fpr-feedback-text');
      if (feedbackInput) feedbackInput.value = '';

      const alertErr = document.getElementById('fpr-alert-error');
      if (alertErr) { alertErr.style.display = 'none'; alertErr.textContent = ''; }

      // Toggle proposal section vs active supervision section
      const propSection = document.getElementById('fpr-proposal-actions-section');
      const supSection = document.getElementById('fpr-supervision-section');

      if (p.status === 'Approved' || p.status === 'Development in Progress' || p.status === 'Completed') {
        if (propSection) propSection.style.display = 'none';
        if (supSection) supSection.style.display = 'block';
      } else {
        if (propSection) propSection.style.display = 'block';
        if (supSection) supSection.style.display = 'none';
      }

      modal.style.display = 'flex';
    } catch (err) {
      window.showToast?.('Error opening review: ' + err.message, 'error');
    }
  };

  window.closeFacultyProjectReviewModal = function() {
    const modal = document.getElementById('modal-faculty-project-review');
    if (modal) modal.style.display = 'none';
  };

  window.handleFacultyApproveProposal = async function() {
    const p = window._facultyReviewActiveProject;
    if (!p) return;
    const feedback = document.getElementById('fpr-feedback-text')?.value?.trim();

    try {
      const res = await store.approveGroupProject(p.id, feedback || 'Approved for development.');
      if (res && res.success) {
        window.showToast?.(res.message, 'success');
        closeFacultyProjectReviewModal();
        renderAllViews();
      } else {
        const errBox = document.getElementById('fpr-alert-error');
        if (errBox) { errBox.textContent = res?.error || 'Approval failed'; errBox.style.display = 'block'; }
        window.showToast?.(res?.error || 'Approval failed', 'error');
      }
    } catch (err) {
      window.showToast?.(err.message, 'error');
    }
  };

  window.handleFacultyRejectProposal = async function() {
    const p = window._facultyReviewActiveProject;
    if (!p) return;
    const reason = document.getElementById('fpr-feedback-text')?.value?.trim();
    if (!reason) {
      const errBox = document.getElementById('fpr-alert-error');
      if (errBox) { errBox.textContent = 'A rejection reason is required.'; errBox.style.display = 'block'; }
      window.showToast?.('Rejection reason is required.', 'error');
      return;
    }

    try {
      const res = await store.rejectGroupProject(p.id, reason);
      if (res && res.success) {
        window.showToast?.(res.message, 'success');
        closeFacultyProjectReviewModal();
        renderAllViews();
      } else {
        const errBox = document.getElementById('fpr-alert-error');
        if (errBox) { errBox.textContent = res?.error || 'Rejection failed'; errBox.style.display = 'block'; }
        window.showToast?.(res?.error || 'Rejection failed', 'error');
      }
    } catch (err) {
      window.showToast?.(err.message, 'error');
    }
  };

  window.handleFacultyRequestChanges = async function() {
    const p = window._facultyReviewActiveProject;
    if (!p) return;
    const feedback = document.getElementById('fpr-feedback-text')?.value?.trim();
    if (!feedback) {
      const errBox = document.getElementById('fpr-alert-error');
      if (errBox) { errBox.textContent = 'Feedback detailing required revisions is required.'; errBox.style.display = 'block'; }
      window.showToast?.('Feedback is required to request changes.', 'error');
      return;
    }

    try {
      const res = await store.requestChangesGroupProject(p.id, feedback);
      if (res && res.success) {
        window.showToast?.(res.message, 'success');
        closeFacultyProjectReviewModal();
        renderAllViews();
      } else {
        const errBox = document.getElementById('fpr-alert-error');
        if (errBox) { errBox.textContent = res?.error || 'Request changes failed'; errBox.style.display = 'block'; }
        window.showToast?.(res?.error || 'Failed', 'error');
      }
    } catch (err) {
      window.showToast?.(err.message, 'error');
    }
  };

  window.handleFacultySubmitGuidance = async function() {
    const p = window._facultyReviewActiveProject;
    if (!p) return;
    const guidance = document.getElementById('fpr-guidance-input')?.value?.trim();
    if (!guidance) return;

    try {
      const res = await store.submitFacultyProjectFeedback(p.id, guidance);
      if (res && res.success) {
        window.showToast?.('Supervision guidance sent to student team.', 'success');
        document.getElementById('fpr-guidance-input').value = '';
        renderAllViews();
      } else {
        window.showToast?.(res?.error || 'Failed to submit guidance', 'error');
      }
    } catch (err) {
      window.showToast?.(err.message, 'error');
    }
  };

  window.handleFacultyGradeProject = async function() {
    const p = window._facultyReviewActiveProject;
    if (!p) return;
    const grade = document.getElementById('fpr-final-grade')?.value;
    const notes = document.getElementById('fpr-grade-notes')?.value?.trim();

    try {
      const res = await store.gradeGroupProject(p.id, grade, notes);
      if (res && res.success) {
        window.showToast?.(res.message, 'success');
        closeFacultyProjectReviewModal();
        renderAllViews();
      } else {
        window.showToast?.(res?.error || 'Evaluation failed', 'error');
      }
    } catch (err) {
      window.showToast?.(err.message, 'error');
    }
  };
`;
console.log('Tested handlers2 successfully. Length:', code.length);
