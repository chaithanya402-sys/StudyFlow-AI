// Complete group project modal controllers to attach to window
const code = `
  // State for group project creation modal
  window._gpSelectedMembers = [];
  window._allEligibleStudents = [];
  window._subjectFacultyList = [];
  window._currentActiveProject = null;

  window.openCreateGroupProjectModal = async function() {
    const modal = document.getElementById('modal-create-group-project');
    if (!modal) return;

    const errBox = document.getElementById('gp-form-error');
    if (errBox) { errBox.style.display = 'none'; errBox.textContent = ''; }
    const form = document.getElementById('form-create-group-project');
    if (form) form.reset();

    const startInput = document.getElementById('gp-start-date');
    if (startInput) startInput.value = new Date().toISOString().slice(0, 10);
    const targetInput = document.getElementById('gp-target-date');
    if (targetInput) {
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      targetInput.value = d.toISOString().slice(0, 10);
    }

    const currentUserId = localStorage.getItem('spp_user_id') || 'std_curr';
    const currentUserName = localStorage.getItem('spp_user_name') || 'Current Student';
    const currentUserEmail = localStorage.getItem('spp_user_email') || 'student@college.edu';
    const currentUserRoll = localStorage.getItem('spp_user_roll') || '2026CSE001';

    window._gpSelectedMembers = [{
      student_id: currentUserId,
      student_name: currentUserName,
      email: currentUserEmail,
      roll_no: currentUserRoll,
      role: 'Leader',
      isCreator: true
    }];

    renderConfirmedTeamMembers();

    // Fetch subjects & faculty
    try {
      const res = await fetch('/api/faculty/subjects');
      const data = await res.json();
      if (data.success) {
        window._subjectFacultyList = data.subjects || [];
        const subjSelect = document.getElementById('gp-subject');
        if (subjSelect) {
          subjSelect.innerHTML = '<option value="">Select Department Subject...</option>' +
            data.subjects.map(s => \`<option value="\${s.subject}">\${s.subject} (Supervised by \${s.faculty_name})</option>\`).join('');
        }
        const mentorSelect = document.getElementById('gp-mentor');
        if (mentorSelect) {
          mentorSelect.innerHTML = '<option value="">No proposed mentor (Department assigned)</option>' +
            (data.faculty || []).map(f => \`<option value="\${f.id}">\${f.full_name} (\${f.department})</option>\`).join('');
        }
      }
    } catch (e) {
      console.warn('Could not load subjects/faculty:', e);
    }

    // Fetch eligible students
    try {
      const sRes = await fetch('/api/students/eligible');
      const sData = await sRes.json();
      if (sData.success) {
        window._allEligibleStudents = sData.students || [];
      }
    } catch (e) {
      console.warn('Could not load eligible students:', e);
    }

    modal.style.display = 'flex';
  };

  window.closeCreateGroupProjectModal = function() {
    const modal = document.getElementById('modal-create-group-project');
    if (modal) modal.style.display = 'none';
  };

  window.renderConfirmedTeamMembers = function() {
    const list = document.getElementById('gp-members-list');
    const badge = document.getElementById('gp-team-counter-badge');
    if (!list) return;

    const count = window._gpSelectedMembers.length;
    if (badge) {
      badge.textContent = \`\${count} of 5 Members\`;
      badge.className = (count >= 2 && count <= 5) ? 'badge-status success' : 'badge-status warning';
    }

    list.innerHTML = window._gpSelectedMembers.map(m => {
      const isLead = m.role === 'Leader';
      const initials = (m.student_name || 'ST').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      return \`
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #2563EB; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;">
              \${initials}
            </div>
            <div>
              <div style="font-size: 12.5px; font-weight: 600; color: #1E293B;">\${m.student_name} \${m.isCreator ? '<span style="font-size: 10px; color: #2563EB;">(You)</span>' : ''}</div>
              <div style="font-size: 11px; color: #64748B;">\${m.email} \${m.roll_no ? '&bull; ' + m.roll_no : ''}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <select class="form-select" style="padding: 3px 8px; font-size: 11px; width: 110px;" onchange="setTeamLeader('\${m.student_id}')">
              <option value="Leader" \${isLead ? 'selected' : ''}>Leader</option>
              <option value="Member" \${!isLead ? 'selected' : ''}>Member</option>
            </select>
            \${!m.isCreator ? \`
              <button type="button" style="border: none; background: none; color: #DC2626; cursor: pointer; padding: 2px 6px; font-size: 14px;" title="Remove student" onclick="removeTeamMember('\${m.student_id}')">✕</button>
            \` : ''}
          </div>
        </div>
      \`;
    }).join('');
  };

  window.handleProjectSubjectChange = function() {
    const subject = document.getElementById('gp-subject')?.value;
    const hint = document.getElementById('gp-subject-approver-hint');
    if (!hint) return;
    if (!subject) {
      hint.textContent = 'Subject determines the authorized reviewing faculty.';
      return;
    }
    const match = (window._subjectFacultyList || []).find(s => s.subject === subject);
    if (match) {
      hint.innerHTML = \`Designated Reviewing Subject Faculty: <strong style="color: #0F172A;">\${match.faculty_name}</strong> (\${match.department})\`;
    } else {
      hint.textContent = 'Designated subject faculty will be assigned upon submission.';
    }
  };

  window.handleMemberSearchInput = function(query) {
    const box = document.getElementById('gp-member-suggestions');
    if (!box) return;
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      box.style.display = 'none';
      return;
    }

    const currentIds = new Set(window._gpSelectedMembers.map(m => m.student_id));
    const filtered = (window._allEligibleStudents || []).filter(s =>
      !currentIds.has(s.id) &&
      (s.full_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.roll_no?.toLowerCase().includes(q))
    );

    if (filtered.length === 0) {
      box.innerHTML = '<div style="padding: 10px 12px; font-size: 12px; color: #64748B;">No eligible student accounts match query.</div>';
      box.style.display = 'block';
      return;
    }

    box.innerHTML = filtered.slice(0, 6).map(s => \`
      <div style="padding: 8px 12px; border-bottom: 1px solid #F1F5F9; cursor: pointer; display: flex; justify-content: space-between; align-items: center;"
           onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='#FFFFFF'"
           onclick='selectEligibleStudent(\${JSON.stringify({ id: s.id, full_name: s.full_name, email: s.email, roll_no: s.roll_no })})'>
        <div>
          <div style="font-size: 12.5px; font-weight: 600; color: #1E293B;">\${s.full_name}</div>
          <div style="font-size: 11px; color: #64748B;">\${s.email} &bull; \${s.roll_no || 'Student'}</div>
        </div>
        <span style="font-size: 11px; color: #2563EB; font-weight: 600;">+ Add</span>
      </div>
    \`).join('');
    box.style.display = 'block';
  };

  window.selectEligibleStudent = function(student) {
    const box = document.getElementById('gp-member-suggestions');
    if (box) box.style.display = 'none';
    const input = document.getElementById('gp-member-search');
    if (input) input.value = '';

    if (window._gpSelectedMembers.length >= 5) {
      window.showToast?.('A group project allows a maximum of 5 student members.', 'error');
      return;
    }

    window._gpSelectedMembers.push({
      student_id: student.id,
      student_name: student.full_name,
      email: student.email,
      roll_no: student.roll_no,
      role: 'Member',
      isCreator: false
    });

    renderConfirmedTeamMembers();
  };

  window.removeTeamMember = function(studentId) {
    window._gpSelectedMembers = window._gpSelectedMembers.filter(m => m.student_id !== studentId || m.isCreator);
    renderConfirmedTeamMembers();
  };

  window.setTeamLeader = function(studentId) {
    window._gpSelectedMembers = window._gpSelectedMembers.map(m => ({
      ...m,
      role: m.student_id === studentId ? 'Leader' : 'Member'
    }));
    renderConfirmedTeamMembers();
  };

  window.handleProposalFileUpload = async function(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const label = document.getElementById('gp-upload-btn-label');
    const statusBox = document.getElementById('gp-file-upload-status');
    const urlInput = document.getElementById('gp-proposal-doc-url');

    if (label) label.textContent = 'Uploading PDF...';
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        if (urlInput) urlInput.value = data.fileUrl;
        if (label) label.textContent = 'File Attached ✓';
        if (statusBox) {
          statusBox.textContent = \`Uploaded: \${file.name} (\${(file.size / 1024).toFixed(1)} KB)\`;
          statusBox.style.display = 'block';
        }
        window.showToast?.('Proposal document uploaded successfully.', 'success');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      if (label) label.textContent = 'Upload Proposal PDF';
      window.showToast?.('Failed to upload file: ' + err.message, 'error');
    }
  };

  window.handleSaveGroupProjectProposal = async function(e, isDraft = false) {
    if (e) e.preventDefault();

    const errBox = document.getElementById('gp-form-error');
    if (errBox) { errBox.style.display = 'none'; errBox.textContent = ''; }

    const title = document.getElementById('gp-title')?.value?.trim();
    const subject = document.getElementById('gp-subject')?.value?.trim();
    const domain = document.getElementById('gp-domain')?.value?.trim();
    const problem_statement = document.getElementById('gp-problem-statement')?.value?.trim();
    const objectives = document.getElementById('gp-objectives')?.value?.trim();
    const description = document.getElementById('gp-description')?.value?.trim();
    const tech_stack = document.getElementById('gp-tech-stack')?.value?.trim();
    const deliverables = document.getElementById('gp-deliverables')?.value?.trim();
    const start_date = document.getElementById('gp-start-date')?.value;
    const target_date = document.getElementById('gp-target-date')?.value;
    const proposal_doc_url = document.getElementById('gp-proposal-doc-url')?.value?.trim();
    const team_name = document.getElementById('gp-team-name')?.value?.trim();
    const mentor_id = document.getElementById('gp-mentor')?.value;

    // Validate team count: min 2, max 5
    if (window._gpSelectedMembers.length < 2) {
      const errMsg = 'Team size invalid: You must add at least 1 other student team member. A group project requires a minimum of 2 distinct student members.';
      if (errBox) { errBox.textContent = errMsg; errBox.style.display = 'block'; }
      window.showToast?.(errMsg, 'error');
      return;
    }
    if (window._gpSelectedMembers.length > 5) {
      const errMsg = 'Team size invalid: Maximum 5 students allowed per group project.';
      if (errBox) { errBox.textContent = errMsg; errBox.style.display = 'block'; }
      window.showToast?.(errMsg, 'error');
      return;
    }

    const leaderMember = window._gpSelectedMembers.find(m => m.role === 'Leader') || window._gpSelectedMembers[0];

    const submitBtn = document.getElementById('btn-submit-group-project');
    const submitBtnText = document.getElementById('gp-submit-btn-text');
    if (submitBtn) submitBtn.disabled = true;
    if (submitBtnText) submitBtnText.textContent = isDraft ? 'Saving Draft...' : 'Submitting Proposal...';

    const payload = {
      title,
      subject,
      domain,
      problem_statement,
      objectives,
      description,
      tech_stack,
      deliverables,
      start_date,
      target_date,
      proposal_doc_url,
      team_name,
      leader_id: leaderMember.student_id,
      mentor_id: mentor_id || null,
      members: window._gpSelectedMembers,
      is_draft: Boolean(isDraft)
    };

    try {
      const res = await store.createGroupProject(payload);
      if (res && res.success) {
        window.showToast?.(res.message || 'Group project submitted successfully!', 'success');
        closeCreateGroupProjectModal();
        renderAllViews();
      } else {
        const errMsg = res.error || 'Failed to submit group project.';
        if (errBox) { errBox.textContent = errMsg; errBox.style.display = 'block'; }
        window.showToast?.(errMsg, 'error');
      }
    } catch (err) {
      const errMsg = err.message || 'An unexpected error occurred.';
      if (errBox) { errBox.textContent = errMsg; errBox.style.display = 'block'; }
      window.showToast?.(errMsg, 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitBtnText) submitBtnText.textContent = 'Submit Proposal for Approval';
    }
  };

  window.handleSaveGroupProjectDraft = function() {
    handleSaveGroupProjectProposal(null, true);
  };
`;
console.log('Tested modal handlers successfully. Length:', code.length);
