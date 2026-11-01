// Group Projects & Capstone Hub Controllers for app.js

function renderStudentGroupProjects(student) {
  const container = document.getElementById('student-projects-container');
  if (!container) return;

  const projects = (store && typeof store.getGroupProjects === 'function')
    ? store.getGroupProjects()
    : (store?.data?.groupProjects || []);

  if (!projects || projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card" style="grid-column: 1 / -1; padding: 40px 24px; text-align: center; border: 1px dashed #CBD5E1; border-radius: 14px; background: #FFFFFF;">
        <div style="font-size: 36px; margin-bottom: 12px;">👥</div>
        <h4 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 6px 0;">No Group Projects Yet</h4>
        <p style="font-size: 13px; color: #64748B; max-width: 500px; margin: 0 auto 18px auto; line-height: 1.5;">
          Collaborate with peers on department capstone projects, lab implementations, and code repositories. Form a team of 2 to 5 verified students and submit your proposal for subject-faculty approval.
        </p>
        <button class="btn-primary" onclick="openCreateGroupProjectModal()" style="display: inline-flex; align-items: center; gap: 6px; margin: 0 auto;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>New Group Project</span>
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = projects.map(p => {
    let statusClass = 'teal';
    let statusLabel = p.status || 'Pending Approval';
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
    } else if (p.status === 'Draft') {
      statusClass = 'blue';
      statusLabel = 'Draft';
    }

    const members = Array.isArray(p.members) ? p.members : [];
    const memberChips = members.map(m => {
      const name = m.student_name || m.name || 'Member';
      const isLead = m.role === 'Leader' || m.id === p.leaderId || m.student_id === p.leaderId;
      return `<span style="font-size: 11px; padding: 2px 7px; border-radius: 4px; background: ${isLead ? '#EFF6FF' : '#F1F5F9'}; color: ${isLead ? '#1D4ED8' : '#334155'}; font-weight: ${isLead ? '700' : '500'};">${name}${isLead ? ' (Lead)' : ''}</span>`;
    }).join('');

    const techChips = (p.techStack || (p.tech || '').split(',').map(s => s.trim()).filter(Boolean))
      .map(t => `<span style="font-size: 11px; background: #F1F5F9; color: #334155; padding: 2px 7px; border-radius: 4px;">${t}</span>`).join('');

    return `
      <div class="project-card-item" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span class="project-tag-pill">${p.domain || p.category || 'Engineering Capstone'}</span>
            <span class="badge-status ${statusClass}">${statusLabel}</span>
          </div>

          <h3 style="font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 4px 0;">${p.title}</h3>
          <div style="font-size: 12px; font-weight: 600; color: #2563EB; margin-bottom: 8px;">Subject: ${p.subject}</div>

          <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.45; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${p.description || p.problemStatement || 'Capstone project deliverable.'}
          </p>

          <div style="margin-bottom: 10px;">
            <div style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Team: ${p.teamName || 'Group Team'}</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
              ${memberChips || '<span style="font-size: 11px; color: #64748B;">No members listed</span>'}
            </div>
          </div>

          <div style="margin-bottom: 12px;">
            <div style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Tech Stack:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${techChips || '<span style="font-size: 11px; color: #64748B;">Python, Node.js</span>'}
            </div>
          </div>
        </div>

        <div>
          <!-- Milestones Bar -->
          <div style="margin-bottom: 12px; padding: 10px 12px; background: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
              <span style="font-weight: 600; color: #334155;">Milestone Progress</span>
              <strong style="color: #0D9488;">${p.progress || 0}%</strong>
            </div>
            <div style="height: 6px; background: #E2E8F0; border-radius: 9999px; overflow: hidden; margin-bottom: 4px;">
              <div style="width: ${p.progress || 0}%; height: 100%; background: #0D9488; transition: width 0.3s ease;"></div>
            </div>
            <div style="font-size: 10.5px; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              Stage: ${p.currentMilestone || '1. Problem definition and requirements'}
            </div>
          </div>

          <div style="font-size: 11px; color: #64748B; margin-bottom: 10px;">
            <strong>Reviewer:</strong> ${p.approverName || 'Subject Faculty Pending'}
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 6px; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #E2E8F0;">
            <button class="btn-primary btn-sm" style="font-size: 11.5px; padding: 5px 12px;" onclick="openProjectDetailsModal('${p.id}')">
              Workspace &bull; Details
            </button>
            ${(p.status === 'Approved' || p.status === 'Development in Progress') ? `
              <button class="btn-outline btn-sm" style="font-size: 11.5px; padding: 5px 10px;" onclick="openSubmitProjectUpdateModal('${p.id}')">
                + Update Progress
              </button>
            ` : (p.status === 'Changes Requested' || p.status === 'Draft' ? `
              <button class="btn-outline btn-sm" style="font-size: 11.5px; padding: 5px 10px; color: #D97706; border-color: #FCD34D; background: #FFFBEB;" onclick="openProjectDetailsModal('${p.id}')">
                Revise Proposal
              </button>
            ` : '')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderFacultySubmissionsProjects() {
  const container = document.getElementById('faculty-group-projects-container');
  if (!container) return;

  const projects = (store && typeof store.getGroupProjects === 'function')
    ? store.getGroupProjects()
    : (store?.data?.groupProjects || []);

  if (!projects || projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card" style="padding: 40px 24px; text-align: center; border: 1px dashed #CBD5E1; border-radius: 14px; background: #FFFFFF;">
        <div style="font-size: 36px; margin-bottom: 12px;">📁</div>
        <div class="empty-state-title" style="font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 6px;">No Group Projects Available for Review</div>
        <p style="font-size: 13px; color: #64748B; max-width: 480px; margin: 0 auto; line-height: 1.5;">
          Student group capstone proposals assigned to your authorized subjects will appear here for academic review and supervision.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px;">
      ${projects.map(p => {
        const leaderName = p.leader || p.leaderName || 'Team Lead';
        const memberNames = (p.members || []).map(m => typeof m === 'object' ? `${m.student_name || m.name}` : m).join(', ');
        const categoryName = p.domain || p.category || 'Capstone Project';
        const descText = p.description || p.problemStatement || 'Final year engineering design and implementation deliverable.';

        let statusClass = 'teal';
        let statusLabel = p.status || 'Pending Approval';
        let isPending = false;
        let isApproved = false;

        if (p.status === 'Approved' || p.status === 'Development in Progress') {
          statusClass = 'success';
          statusLabel = 'In Development';
          isApproved = true;
        } else if (p.status === 'Changes Requested') {
          statusClass = 'warning';
          statusLabel = 'Changes Requested';
          isPending = true;
        } else if (p.status === 'Rejected') {
          statusClass = 'error';
          statusLabel = 'Rejected';
        } else if (p.status === 'Completed') {
          statusClass = 'success';
          statusLabel = 'Completed';
        } else {
          statusClass = 'warning';
          statusLabel = 'Pending Review';
          isPending = true;
        }

        const evaluatedMarks = p.finalGrade ? p.finalGrade : (p.status === 'Completed' ? 'Graded' : 'Pending');

        return `
          <div class="group-project-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <span class="badge-status blue">${categoryName}</span>
                <span class="badge-status ${statusClass}">${statusLabel}</span>
              </div>

              <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #1E293B; font-weight: 700;">${p.title}</h4>
              <div style="font-size: 12px; font-weight: 600; color: #2563EB; margin-bottom: 6px;">Subject: ${p.subject}</div>
              <p style="font-size: 12px; color: #64748B; margin: 0 0 10px 0; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${descText}</p>

              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                  <span>Milestone Progress</span>
                  <strong>${p.progress || 0}%</strong>
                </div>
                <div style="height: 6px; background: #E2E8F0; border-radius: 3px; overflow: hidden;">
                  <div style="width: ${p.progress || 0}%; height: 100%; background: #0D9488;"></div>
                </div>
                <div style="font-size: 10.5px; color: #64748B; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${p.currentMilestone || '1. Problem definition and requirements'}
                </div>
              </div>

              <div style="font-size: 11.5px; color: #334155; margin-bottom: 8px;">
                <strong>Team:</strong> ${p.teamName || 'Group Team'} &bull; <em>${leaderName} (Lead), ${memberNames}</em>
              </div>

              <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 14px;">
                ${(p.techStack || []).map(t => `<span class="skill-chip-pill" style="font-size: 10.5px; padding: 2px 8px;">${t}</span>`).join('')}
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #E2E8F0;">
              <div>
                <span style="font-size: 11px; color: #64748B;">Evaluation:</span>
                <strong style="color: #059669; margin-left: 4px; font-size: 11.5px;">${evaluatedMarks}</strong>
              </div>
              <div style="display: flex; gap: 6px;">
                <button class="btn-faculty-action btn-faculty-secondary" style="padding: 4px 10px; font-size: 11.5px;" onclick="openProjectDetailsModal('${p.id}')">
                  Workspace
                </button>
                ${isPending ? `
                  <button class="btn-faculty-action btn-faculty-primary" style="padding: 4px 12px; font-size: 11.5px;" onclick="openFacultyProjectReviewModal('${p.id}')">
                    Review Proposal
                  </button>
                ` : `
                  <button class="btn-faculty-action btn-faculty-primary" style="padding: 4px 12px; font-size: 11.5px; background: #0D9488; border-color: #0D9488;" onclick="openFacultyProjectReviewModal('${p.id}')">
                    Supervise & Grade
                  </button>
                `}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
console.log('Tested render functions successfully.');
