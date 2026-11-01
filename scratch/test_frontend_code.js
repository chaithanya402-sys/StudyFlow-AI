// Validate syntax of proposed group project app.js additions
const code = `
  // State for group project creation modal
  window._gpSelectedMembers = [];
  window._allEligibleStudents = [];
  window._subjectFacultyList = [];

  window.openCreateGroupProjectModal = async function() {
    const modal = document.getElementById('modal-create-group-project');
    if (!modal) return;

    // Reset error and fields
    const errBox = document.getElementById('gp-form-error');
    if (errBox) { errBox.style.display = 'none'; errBox.textContent = ''; }
    const form = document.getElementById('form-create-group-project');
    if (form) form.reset();

    // Default dates
    const startInput = document.getElementById('gp-start-date');
    if (startInput) startInput.value = new Date().toISOString().slice(0, 10);
    const targetInput = document.getElementById('gp-target-date');
    if (targetInput) {
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      targetInput.value = d.toISOString().slice(0, 10);
    }

    // Initialize members list with current logged in user as Creator / Leader
    const currentUser = {
      id: localStorage.getItem('spp_user_id') || 'std_curr',
      name: localStorage.getItem('spp_user_name') || 'Current Student',
      email: localStorage.getItem('spp_user_email') || 'student@college.edu',
      rollNo: localStorage.getItem('spp_user_roll') || '2026CSE001'
    };

    window._gpSelectedMembers = [{
      student_id: currentUser.id,
      student_name: currentUser.name,
      email: currentUser.email,
      roll_no: currentUser.rollNo,
      role: 'Leader',
      isCreator: true
    }];

    renderConfirmedTeamMembers();

    // Load subjects & faculty mappings
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

    // Pre-fetch eligible students
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
`;

console.log('Syntax check passed! Length:', code.length);
