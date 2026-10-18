/**
 * Student Placement Prediction System Controller
 * Modern Campus SaaS Design System Edition
 * Navy (#172B4D) • Primary Blue (#2563EB) • Teal (#0D9488) • Canvas (#F5F7FB)
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.PlacementDataStore;
  window.store = store;
  if (!store) {
    console.error('PlacementDataStore not found!');
    return;
  }

  // Lucide-style outline SVG icon map matching design screenshot
  const icons = {
    dashboard: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    tasks: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
    projects: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    assignments: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M9 12h6"></path><path d="M9 16h6"></path></svg>`,
    lab: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31L4.15 19.46A2 2 0 0 0 5.88 22h12.24a2 2 0 0 0 1.73-2.54L14 9.31V2"></path><path d="M8.5 2h7"></path><path d="M14 9.3h-4"></path></svg>`,
    learning: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
    practice: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    facultyAssignments: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><polyline points="9 13 11 15 15 11"></polyline></svg>`,
    placement: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`,
    overviewChart: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
    studentProfile: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    simulator: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>`,
    skillGap: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
    campusDrives: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    resumeAts: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="11" cy="14" r="2"></circle><line x1="12.5" y1="15.5" x2="14.5" y2="17.5"></line></svg>`,
    companies: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="2"></line><line x1="15" y1="22" x2="15" y2="2"></line><line x1="8" y1="6" x2="10" y2="6"></line><line x1="14" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="10" y2="10"></line><line x1="14" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="10" y2="14"></line><line x1="14" y1="14" x2="16" y2="14"></line></svg>`,
    applications: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><polyline points="9 15 11 17 15 13"></polyline></svg>`,
    skillsGraduation: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`,
    notifications: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
    profileUser: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    chevron: `<svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,

    // Faculty & Officer legacy icons
    overview: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    students: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>`,
    performance: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline></svg>`,
    mentoring: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
    reports: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
    access: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    mlInsight: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>`
  };

  // Student Navigation: Exact 10 Main Navigation Items Hierarchy
  const studentNavStructure = [
    { type: 'item', title: 'Dashboard', route: '/student/dashboard', icon: icons.dashboard },
    { type: 'item', title: 'My Tasks', route: '/student/tasks', icon: icons.tasks },
    { type: 'item', title: 'Group Projects', route: '/student/projects', icon: icons.projects },
    {
      type: 'parent',
      id: 'assignments',
      title: 'Assignments',
      icon: icons.assignments,
      children: [
        { title: 'Lab Assignments', route: '/student/assignments/lab', icon: icons.lab },
        { title: 'Learning Records', route: '/student/assignments/learning', icon: icons.learning },
        { title: 'Practice Records', route: '/student/assignments/practice', icon: icons.practice },
        { title: 'Faculty Assignments', route: '/student/assignments/faculty', icon: icons.facultyAssignments }
      ]
    },
    {
      type: 'parent',
      id: 'placement-prediction',
      title: 'Placement Prediction',
      icon: icons.placement,
      children: [
        { title: 'Placement Overview', route: '/student/overview', icon: icons.overviewChart },
        { title: 'Student Academic & Placement Profile', route: '/student/profile', icon: icons.studentProfile },
        { title: 'Prediction & What-If Simulator', route: '/student/prediction', icon: icons.simulator },
        { title: 'Skill Gap Analysis & Paths', route: '/student/skills', icon: icons.skillGap },
        { title: 'Campus Recruitment Drives', route: '/student/jobs', icon: icons.campusDrives },
        { title: 'Resume Analyzer & ATS Compatibility', route: '/student/resume', icon: icons.resumeAts }
      ]
    },
    { type: 'item', title: 'Companies & Drives', route: '/student/companies', icon: icons.companies },
    { type: 'item', title: 'My Applications', route: '/student/applications', icon: icons.applications },
    { type: 'item', title: 'Skills & Skill Gaps', route: '/student/skill-gaps', icon: icons.skillsGraduation },
    { type: 'item', title: 'Notifications', route: '/student/notifications', icon: icons.notifications },
    { type: 'item', title: 'Profile', route: '/student/profile', icon: icons.profileUser }
  ];

  // Faculty Navigation: Exact 9 Main Navigation Items with expandable Submissions & Grading
  const facultyNavStructure = [
    { type: 'item', title: 'Dashboard', route: '/faculty/overview', icon: icons.dashboard },
    { type: 'item', title: 'Assignments', route: '/faculty/assignments', icon: icons.assignments },
    {
      type: 'parent',
      id: 'submissions-grading',
      title: 'Submissions & Grading',
      icon: icons.tasks,
      children: [
        { title: 'Lab Assignments', route: '/faculty/submissions/lab', icon: icons.lab },
        { title: 'Group Projects', route: '/faculty/submissions/projects', icon: icons.projects },
        { title: 'Student Directory', route: '/faculty/students', icon: icons.students },
        { title: 'Learning & Practice Records', route: '/faculty/submissions/records', icon: icons.learning }
      ]
    },
    { type: 'item', title: 'Academic Analytics', route: '/faculty/analytics', icon: icons.overviewChart },
    { type: 'item', title: 'Placement Preparation', route: '/faculty/placement', icon: icons.skillsGraduation },
    { type: 'item', title: 'ML Insights', route: '/faculty/ml-insights', icon: icons.mlInsight },
    { type: 'item', title: 'Reports', route: '/faculty/reports', icon: icons.reports },
    { type: 'item', title: 'Notifications', route: '/faculty/notifications', icon: icons.notifications },
    { type: 'item', title: 'Faculty Profile', route: '/faculty/profile', icon: icons.profileUser }
  ];

  // Submenu expansion state (expanded by default matching portal preview)
  const sidebarExpandedState = {
    'assignments': true,
    'placement-prediction': true,
    'submissions-grading': true
  };

  window.toggleSidebarSubmenu = function(id) {
    sidebarExpandedState[id] = !sidebarExpandedState[id];
    const submenu = document.getElementById(`submenu-${id}`);
    const btn = document.getElementById(`parent-btn-${id}`);
    if (submenu && btn) {
      if (sidebarExpandedState[id]) {
        submenu.classList.remove('collapsed');
        btn.classList.add('parent-open');
        btn.classList.remove('parent-collapsed');
      } else {
        submenu.classList.add('collapsed');
        btn.classList.remove('parent-open');
        btn.classList.add('parent-collapsed');
      }
    }
  };

  // Role Configurations
  const roleNavConfig = {
    student: {
      portalTitle: 'StudyFlow AI',
      badgeTitle: 'Student Portal',
      defaultRoute: '/student/dashboard',
      breadcrumb: 'STUDENT / PORTAL',
      links: studentNavStructure
    },
    faculty: {
      portalTitle: 'StudyFlow AI',
      badgeTitle: 'Faculty Portal',
      defaultRoute: '/faculty/overview',
      breadcrumb: 'FACULTY / ACADEMIC SUITE',
      links: facultyNavStructure
    },
    officer: {
      portalTitle: 'T&P Cell Admin',
      badgeTitle: 'T&P PORTAL',
      defaultRoute: '/officer/overview',
      breadcrumb: 'OVERVIEW / T&P CELL',
      links: [
        { route: '/officer/overview', icon: icons.overview, title: 'Overview Analytics' },
        { route: '/officer/students', icon: icons.students, title: 'Student Master' },
        { route: '/officer/drives', icon: icons.companies, title: 'Companies & Drives' },
        { route: '/officer/applications', icon: icons.applications, title: 'Applications & Offers' },
        { route: '/officer/reports', icon: icons.reports, title: 'Placement Reports' },
        { route: '/officer/access-control', icon: icons.access, title: 'Access Control' }
      ]
    }
  };

  // Route to stage pane mapping
  const routeToPaneId = {
    '/student/dashboard': 'pane-student-dashboard',
    '/student/tasks': 'pane-student-tasks',
    '/student/projects': 'pane-student-projects',
    '/student/assignments/lab': 'pane-student-assignments-lab',
    '/student/assignments/learning': 'pane-student-assignments-learning',
    '/student/assignments/practice': 'pane-student-assignments-practice',
    '/student/assignments/faculty': 'pane-student-assignments-faculty',
    '/student/overview': 'pane-student-overview',
    '/student/profile': 'pane-student-profile',
    '/student/prediction': 'pane-student-prediction',
    '/student/skills': 'pane-student-skills',
    '/student/jobs': 'pane-student-jobs',
    '/student/resume': 'pane-student-resume',
    '/student/assistant': 'pane-student-assistant',
    '/student/companies': 'pane-student-companies',
    '/student/applications': 'pane-student-applications',
    '/student/skill-gaps': 'pane-student-skill-gaps',
    '/student/notifications': 'pane-student-notifications',

    '/faculty/overview': 'pane-faculty-overview',
    '/faculty/assignments': 'pane-faculty-assignments',
    '/faculty/submissions': 'pane-faculty-submissions',
    '/faculty/submissions/lab': 'pane-faculty-submissions-lab',
    '/faculty/submissions/projects': 'pane-faculty-submissions-projects',
    '/faculty/students': 'pane-faculty-students',
    '/faculty/submissions/records': 'pane-faculty-submissions-records',
    '/faculty/analytics': 'pane-faculty-analytics',
    '/faculty/placement': 'pane-faculty-placement',
    '/faculty/ml-insights': 'pane-faculty-ml-insights',
    '/faculty/reports': 'pane-faculty-reports',
    '/faculty/notifications': 'pane-faculty-notifications',
    '/faculty/profile': 'pane-faculty-profile',
    '/faculty/performance': 'pane-faculty-analytics',
    '/faculty/skill-gaps': 'pane-faculty-placement',
    '/faculty/mentoring': 'pane-faculty-assignments',

    '/officer/overview': 'pane-officer-overview',
    '/officer/students': 'pane-officer-students',
    '/officer/drives': 'pane-officer-drives',
    '/officer/applications': 'pane-officer-applications',
    '/officer/reports': 'pane-officer-reports',
    '/officer/access-control': 'pane-officer-access-control',

    '/what-if': 'pane-student-prediction',
    '/skill-gap-analysis': 'pane-student-skills',
    '/resume-analyzer': 'pane-student-resume'
  };

  const routeTitles = {
    '/student/dashboard': 'Dashboard',
    '/student/tasks': 'My Tasks',
    '/student/projects': 'Group Projects',
    '/student/assignments/lab': 'Lab Assignments',
    '/student/assignments/learning': 'Learning Records',
    '/student/assignments/practice': 'Practice Records',
    '/student/assignments/faculty': 'Faculty Assignments',
    '/student/overview': 'Placement Overview',
    '/student/profile': 'Student Academic & Placement Profile',
    '/student/prediction': 'Prediction & What-If Simulator',
    '/student/skills': 'Skill Gap Analysis & Paths',
    '/student/jobs': 'Campus Recruitment Drives',
    '/student/resume': 'Resume Analyzer & ATS Compatibility',
    '/student/assistant': 'AI Career & Mock Interview Assistant',
    '/student/companies': 'Companies & Drives',
    '/student/applications': 'My Applications',
    '/student/skill-gaps': 'Skills & Skill Gaps',
    '/student/notifications': 'Notifications',

    '/faculty/overview': 'Faculty Dashboard',
    '/faculty/assignments': 'Assignment Management',
    '/faculty/submissions': 'Submissions & Grading Queue',
    '/faculty/submissions/lab': 'Lab Assignments & Evaluation',
    '/faculty/submissions/projects': 'Group Projects Supervision',
    '/faculty/students': 'Student Directory & Performance',
    '/faculty/submissions/records': 'Learning & Practice Records',
    '/faculty/analytics': 'Academic Analytics',
    '/faculty/placement': 'Placement Preparation & Mentorship',
    '/faculty/ml-insights': 'Machine Learning Insights',
    '/faculty/reports': 'Faculty Reports & Export Center',
    '/faculty/notifications': 'Faculty Notifications',
    '/faculty/profile': 'Faculty Profile & Settings',

    '/officer/overview': 'Institutional Placement Analytics',
    '/officer/students': 'College Student Placement Registry',
    '/officer/drives': 'Recruitment Drives & Company Partnerships',
    '/officer/applications': 'Applications & Offer Letters Queue',
    '/officer/reports': 'Annual Placement Reports',
    '/officer/access-control': 'Role Permissions & Audit Trail'
  };

  function parseCurrentHash() {
    const rawHash = window.location.hash ? window.location.hash.replace(/^#\/?/, '/') : '';
    if (!rawHash) {
      const role = store.getActiveRole();
      return {
        path: roleNavConfig[role]?.defaultRoute || '/student/dashboard',
        params: new URLSearchParams(),
        detailType: null,
        detailId: null
      };
    }

    const normalized = rawHash.startsWith('/') ? rawHash : '/' + rawHash;
    const [pathPart, queryPart] = normalized.split('?');
    const params = new URLSearchParams(queryPart || '');

    let detailType = null;
    let detailId = params.get('id') || null;

    // Check for restful route pattern: /student/assignments/(faculty|lab|learning|practice)/:id
    const detailRouteMatch = pathPart.match(/^\/student\/assignments\/(faculty|lab|learning|practice)\/([a-zA-Z0-9_-]+)$/i);
    let basePath = pathPart;
    if (detailRouteMatch) {
      detailType = detailRouteMatch[1].toLowerCase();
      detailId = detailRouteMatch[2];
      basePath = `/student/assignments/${detailType}`;
    } else {
      const matchType = pathPart.match(/^\/student\/assignments\/(faculty|lab|learning|practice)$/i);
      if (matchType && detailId) {
        detailType = matchType[1].toLowerCase();
      }
    }

    return {
      path: basePath,
      fullRoute: normalized,
      params,
      detailType,
      detailId
    };
  }

  function getCurrentRoute() {
    return parseCurrentHash().path;
  }

  function renderSidebarNav(role) {
    const config = roleNavConfig[role] || roleNavConfig.student;
    const linksContainer = document.getElementById('sidebar-role-links');
    if (!linksContainer) return;

    let html = `<ul class="nav-items-list">`;

    if (role === 'student' || role === 'faculty') {
      const navList = (role === 'student') ? studentNavStructure : facultyNavStructure;
      navList.forEach(item => {
        if (item.type === 'item') {
          html += `
            <li>
              <a href="#${item.route}" class="nav-link" data-route="${item.route}">
                <div class="nav-link-left">
                  ${item.icon}
                  <span>${item.title}</span>
                </div>
              </a>
            </li>
          `;
        } else if (item.type === 'parent') {
          const isOpen = sidebarExpandedState[item.id] !== false;
          html += `
            <li class="nav-parent-group">
              <button type="button" class="nav-parent-btn ${isOpen ? 'parent-open' : 'parent-collapsed'}" id="parent-btn-${item.id}" onclick="toggleSidebarSubmenu('${item.id}')">
                <div class="nav-link-left">
                  ${item.icon}
                  <span>${item.title}</span>
                </div>
                ${icons.chevron}
              </button>
              <ul class="nav-submenu ${isOpen ? '' : 'collapsed'}" id="submenu-${item.id}">
                ${item.children.map(child => `
                  <li>
                    <a href="#${child.route}" class="nav-link" data-route="${child.route}">
                      <div class="nav-link-left">
                        ${child.icon}
                        <span>${child.title}</span>
                      </div>
                    </a>
                  </li>
                `).join('')}
              </ul>
            </li>
          `;
        }
      });
    } else {
      html += `<div class="nav-group-title">${role.toUpperCase()} MENU</div>`;
      config.links.forEach(item => {
        html += `
          <li>
            <a href="#${item.route}" class="nav-link" data-route="${item.route}">
              <div class="nav-link-left">
                ${item.icon}
                <span>${item.title}</span>
              </div>
            </a>
          </li>
        `;
      });
    }

    html += `</ul>`;
    linksContainer.innerHTML = html;

    linksContainer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992) {
          closeMobileSidebar();
        }
      });
    });

    // Update brand titles
    const titleEl = document.getElementById('sidebar-portal-title');
    const badgeEl = document.getElementById('sidebar-role-badge');
    if (titleEl) {
      if (config.portalTitle.includes('AI')) {
        titleEl.innerHTML = config.portalTitle.replace('AI', `<span style="color: var(--primary-green);">AI</span>`);
      } else {
        titleEl.textContent = config.portalTitle;
      }
    }
    if (badgeEl) badgeEl.textContent = config.badgeTitle;

    // Toggle context box visibility
    const contextBox = document.getElementById('sidebar-context-box');
    if (contextBox) {
      contextBox.style.display = (role === 'student') ? 'none' : 'block';
    }
  }

  // Sign Out Handler
  window.handleLogout = async function() {
    if (window.SupabaseAuth) {
      await window.SupabaseAuth.signOut();
    } else {
      localStorage.removeItem('spp_user_email');
      localStorage.removeItem('spp_user_role');
      localStorage.removeItem('spp_user_name');
      window.location.href = 'login.html';
    }
  };

  function updateUserProfileHeader(role) {
    const profile = store.getUserProfile(role);
    const customName = localStorage.getItem('spp_user_name');
    const customEmail = localStorage.getItem('spp_user_email');
    const assignedRole = localStorage.getItem('spp_user_role') || role;

    const nameLabel = document.getElementById('user-name-label');
    const emailLabel = document.getElementById('user-email-label');
    const avatarPill = document.getElementById('user-avatar-pill');
    const roleBadgePill = document.getElementById('user-role-badge-pill');
    const topAvatarCircle = document.getElementById('top-avatar-circle');
    const roleSelect = document.getElementById('header-role-select');

    if (role === 'student') {
      const activeStudent = store.data.roles?.student || {};
      const displayName = (activeStudent.name && activeStudent.name !== 'Student Profile') ? activeStudent.name : (customName || 'Student');
      const email = activeStudent.email || customEmail || 'Student Account';
      if (activeStudent.name && activeStudent.name !== 'Student Profile') {
        localStorage.setItem('spp_user_name', activeStudent.name);
      }
      if (activeStudent.email) {
        localStorage.setItem('spp_user_email', activeStudent.email);
      }
      if (nameLabel) nameLabel.textContent = displayName;
      if (emailLabel) emailLabel.textContent = email;
      if (avatarPill) avatarPill.textContent = (displayName && displayName !== 'Student') ? displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : (activeStudent.avatar || 'ST');
      if (roleBadgePill) roleBadgePill.textContent = 'Student';

      const dashWelcome = document.getElementById('dash-welcome-name');
      if (dashWelcome) dashWelcome.textContent = displayName;
      const studWelcome = document.getElementById('student-welcome-heading');
      if (studWelcome) studWelcome.textContent = `Good morning, ${displayName}`;
      const badgeStatus = document.getElementById('dash-student-badge-status');
      if (badgeStatus) {
        if (activeStudent.cgpa) {
          badgeStatus.textContent = `${activeStudent.degree || 'B.Tech'} • ${activeStudent.branch || 'Engineering'} • CGPA: ${activeStudent.cgpa}`;
        } else {
          badgeStatus.textContent = 'Student Portal Active';
        }
      }
    } else if (role === 'faculty') {
      const displayName = customName || profile.name;
      if (nameLabel) nameLabel.textContent = displayName;
      if (emailLabel) emailLabel.textContent = 'Faculty account';
      if (avatarPill) avatarPill.textContent = 'F';
      if (roleBadgePill) roleBadgePill.textContent = 'Faculty';
    } else if (role === 'officer') {
      const displayName = customName || profile.name;
      if (nameLabel) nameLabel.textContent = displayName;
      if (emailLabel) emailLabel.textContent = 'Officer account';
      if (avatarPill) avatarPill.textContent = 'T';
      if (roleBadgePill) roleBadgePill.textContent = 'TPO Admin';
    }

    if (topAvatarCircle) {
      let initials = 'US';
      if (role === 'student') {
        const activeStudent = store.data.roles?.student || {};
        const name = (activeStudent.name && activeStudent.name !== 'Student Profile') ? activeStudent.name : customName;
        initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : (activeStudent.avatar || 'ST');
      } else {
        initials = (assignedRole === role && customName) ? customName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : (profile.avatar || 'US');
      }
      topAvatarCircle.textContent = initials;
    }
    if (roleSelect && roleSelect.value !== role) {
      roleSelect.value = role;
    }
  }

  window.switchActiveRole = function(role) {
    localStorage.setItem('spp_user_role', role);
    store.setActiveRole(role);
    renderSidebarNav(role);
    updateUserProfileHeader(role);

    const targetRoute = roleNavConfig[role]?.defaultRoute || '/student/dashboard';
    if (window.location.hash === '#' + targetRoute || window.location.hash === targetRoute) {
      updateRouting();
    } else {
      window.location.hash = targetRoute;
    }
  };

  function updateRouting() {
    const parsed = parseCurrentHash();
    let currentRoute = parsed.path;

    let detectedRole = store.getActiveRole();
    if (currentRoute.startsWith('/student/')) {
      detectedRole = 'student';
    } else if (currentRoute.startsWith('/faculty/')) {
      detectedRole = 'faculty';
    } else if (currentRoute.startsWith('/officer/')) {
      detectedRole = 'officer';
    } else if (currentRoute === '/dashboard' || currentRoute === '/') {
      currentRoute = roleNavConfig[detectedRole]?.defaultRoute || '/student/dashboard';
      window.location.hash = currentRoute;
      return;
    }

    localStorage.setItem('spp_user_role', detectedRole);

    if (detectedRole !== store.getActiveRole()) {
      store.setActiveRole(detectedRole);
    }

    if (detectedRole === 'student') {
      const activeStudent = store.data.roles?.student;
      // Guard onboarding: if student profile is incomplete, guide student to profile setup
      if (store.isLoaded && activeStudent) {
        const isProfileIncomplete = !activeStudent.cgpa || activeStudent.predictionStatus === 'Pending Setup';
        if (isProfileIncomplete && currentRoute !== '/student/profile') {
          if (currentRoute === '/student/dashboard' || currentRoute === '/student/overview' || currentRoute === '/student/prediction' || currentRoute === '/') {
            window.location.hash = '/student/profile?setup=true';
            return;
          }
        }
      }

      // Re-fetch latest student profile from SQLite when visiting profile or dashboard
      if (currentRoute === '/student/profile' || currentRoute === '/student/dashboard') {
        store.fetchStudentProfile?.();
      }
    }

    // Auto-expand parent section if current route is a nested child
    if (currentRoute.startsWith('/student/assignments/')) {
      sidebarExpandedState['assignments'] = true;
      const sub = document.getElementById('submenu-assignments');
      const btn = document.getElementById('parent-btn-assignments');
      if (sub && btn) {
        sub.classList.remove('collapsed');
        btn.classList.add('parent-open');
        btn.classList.remove('parent-collapsed');
      }
    }
    const placementSubroutes = [
      '/student/overview',
      '/student/profile',
      '/student/prediction',
      '/student/skills',
      '/student/jobs',
      '/student/resume',
      '/what-if',
      '/skill-gap-analysis',
      '/resume-analyzer'
    ];
    if (placementSubroutes.includes(currentRoute)) {
      sidebarExpandedState['placement-prediction'] = true;
      const sub = document.getElementById('submenu-placement-prediction');
      const btn = document.getElementById('parent-btn-placement-prediction');
      if (sub && btn) {
        sub.classList.remove('collapsed');
        btn.classList.add('parent-open');
        btn.classList.remove('parent-collapsed');
      }
    }

    if (currentRoute.startsWith('/faculty/submissions') || currentRoute === '/faculty/students') {
      sidebarExpandedState['submissions-grading'] = true;
      const sub = document.getElementById('submenu-submissions-grading');
      const btn = document.getElementById('parent-btn-submissions-grading');
      if (sub && btn) {
        sub.classList.remove('collapsed');
        btn.classList.add('parent-open');
        btn.classList.remove('parent-collapsed');
      }
    }

    renderSidebarNav(detectedRole);
    updateUserProfileHeader(detectedRole);

    // Set active link - EXACTLY one route highlighted
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
      const linkRoute = link.getAttribute('data-route') || link.getAttribute('href')?.replace(/^#/, '');
      link.classList.toggle('active', linkRoute === currentRoute);
    });

    // Toggle active pane
    const targetPaneId = routeToPaneId[currentRoute] || 'pane-student-dashboard';
    document.querySelectorAll('.screen-pane').forEach(pane => {
      pane.style.display = (pane.id === targetPaneId) ? 'flex' : 'none';
    });

    // Header Breadcrumbs and Title
    const breadcrumbLabel = document.getElementById('page-breadcrumb-label');
    const pageTitleLabel = document.getElementById('page-title-label');
    if (breadcrumbLabel) {
      breadcrumbLabel.textContent = roleNavConfig[detectedRole]?.breadcrumb || 'OVERVIEW';
    }
    if (pageTitleLabel && routeTitles[currentRoute]) {
      pageTitleLabel.textContent = routeTitles[currentRoute];
    }

    const mainStage = document.querySelector('.main-stage');
    if (mainStage) mainStage.scrollTop = 0;

    if (typeof renderAllViews === 'function') {
      renderAllViews();
    }

    // Direct / deep-link to record details
    if (parsed.detailType && parsed.detailId) {
      if (typeof openSubmissionDetailsModal === 'function') {
        openSubmissionDetailsModal(parsed.detailType, parsed.detailId);
      } else if (typeof openRecordDetailsModal === 'function') {
        openRecordDetailsModal(parsed.detailType, parsed.detailId, { updateHash: false });
      }
    } else {
      const modal = document.getElementById('modal-record-details');
      if (modal && modal.style.display === 'flex' && !window._keepRecordModalOpen) {
        if (typeof closeRecordDetailsModal === 'function') {
          closeRecordDetailsModal({ updateHash: false });
        }
      }
    }
  }

  window.navigateToRoute = function(route) {
    if (!route.startsWith('/')) route = '/' + route;
    if (window.location.hash === '#' + route || window.location.hash === route) {
      updateRouting();
    } else {
      window.location.hash = route;
    }
  };

  window.addEventListener('hashchange', updateRouting);

  // --- REACTIVE RENDERING ENGINE ---

  function renderStudentViews() {
    const student = store.data.roles.student;
    const drives = store.getDrives();
    const myApps = store.getStudentApplications(student.id);
    const myTasks = store.getStudentTasks(student.id);
    const stats = store.getStats('student');

    // Toggle Empty State Banner
    const emptyBanner = document.getElementById('empty-state-profile-banner');
    const isProfilePending = !student.cgpa || student.predictionStatus === 'Pending Setup';
    if (emptyBanner) {
      emptyBanner.style.display = isProfilePending ? 'flex' : 'none';
    }

    const probEl = document.getElementById('kpi-student-prob');
    const appsEl = document.getElementById('kpi-student-apps');
    const shortlistedEl = document.getElementById('kpi-student-shortlisted');
    const placedBadgeKpi = document.getElementById('student-placed-badge-kpi');

    if (probEl) {
      if (stats.probability !== null && !isProfilePending) {
        probEl.textContent = `${stats.probability}%`;
      } else {
        probEl.textContent = `--%`;
      }
    }
    if (appsEl) appsEl.innerHTML = `${stats.applicationsCount} <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary);">Applied</span>`;
    if (shortlistedEl) shortlistedEl.textContent = `${stats.shortlistedCount} Shortlisted`;

    if (placedBadgeKpi) {
      if (stats.placementStatus === 'Placed') {
        placedBadgeKpi.innerHTML = `<span style="color: var(--success-green); font-weight: 700;">Placed @ ${stats.placedCompany} (₹${stats.placedPackage} LPA)</span>`;
      } else {
        placedBadgeKpi.textContent = isProfilePending ? 'Setup Pending' : 'Status: In Process';
      }
    }

    // Tasks list on overview
    const tasksContainer = document.getElementById('student-tasks-list');
    const pendingBadge = document.getElementById('student-pending-tasks-badge');
    if (pendingBadge) pendingBadge.textContent = `${stats.pendingTasks} Pending`;

    if (tasksContainer) {
      if (myTasks.length === 0) {
        tasksContainer.innerHTML = `
          <div class="empty-state-card">
            <div class="empty-state-icon">📋</div>
            <div class="empty-state-title">No Active Tasks Assigned</div>
            <div class="empty-state-desc">You are all caught up! When your faculty mentor assigns new preparation tasks or mock practice, they will appear here.</div>
            <button class="btn-outline btn-sm" onclick="navigateToRoute('/student/skills')">Explore Skill Benchmarks</button>
          </div>
        `;
      } else {
        tasksContainer.innerHTML = myTasks.slice(0, 4).map(task => `
          <div class="task-row-card ${task.status === 'Completed' ? 'done' : ''}">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
              <button class="task-check-circle" onclick="toggleTaskStatus('${task.id}')" title="Toggle task status">
                ${task.status === 'Completed' ? '✓' : ''}
              </button>
              <div>
                <div class="task-title-text">${task.title}</div>
                <div class="task-meta-info">Due: ${task.dueDate} • Priority: <span style="font-weight: 700; color: ${task.priority === 'High' ? 'var(--error-red)' : 'var(--primary-blue)'};">${task.priority}</span></div>
              </div>
            </div>
            <span class="badge-status ${task.status === 'Completed' ? 'success' : 'warning'}">
              ${task.status === 'Completed' ? 'Done' : 'Pending'}
            </span>
          </div>
        `).join('');
      }
    }

    // Active drives on student overview
    const drivesContainer = document.getElementById('student-drives-list');
    if (drivesContainer) {
      const topDrives = drives.slice(0, 3);
      drivesContainer.innerHTML = topDrives.map(drive => {
        const isEligible = (student.cgpa >= drive.minCGPA) && (student.backlogs <= drive.maxBacklogs);
        const hasApplied = myApps.some(a => a.driveId === drive.id);

        return `
          <div class="drive-list-card">
            <div class="drive-logo-initials">${(drive.company || 'CD').slice(0, 2).toUpperCase()}</div>
            <div class="drive-info-col">
              <div class="drive-company-title">
                <span>${drive.company || 'Campus Drive'}</span>
                <span class="badge-status success">₹${drive.packageLPA || 8.0} LPA</span>
              </div>
              <div class="drive-meta-text">
                <span>${drive.role || 'Software Engineer'} • ${drive.location || 'Campus'}</span>
                <span>Cutoff: Min CGPA ${drive.minCGPA || 6.0}</span>
                <span class="badge-status ${isEligible ? 'teal' : 'error'}">
                  ${isEligible ? 'Eligible' : 'Cutoff Unmet'}
                </span>
              </div>
            </div>
            <div>
              ${hasApplied 
                ? `<button class="btn-outline btn-sm" disabled style="background: var(--success-bg); color: var(--success-green); border-color: var(--success-green);">Applied ✓</button>`
                : isEligible 
                  ? `<button class="btn-primary btn-sm" onclick="applyForDrive('${drive.id}')">Apply</button>`
                  : `<button class="btn-outline btn-sm" disabled>Ineligible</button>`
              }
            </div>
          </div>
        `;
      }).join('');
    }

    // Active applications for Student Overview tab
    const overviewAppsContainer = document.getElementById('student-overview-apps-list');
    if (overviewAppsContainer) {
      if (myApps.length === 0) {
        overviewAppsContainer.innerHTML = `
          <div class="empty-state-card">
            <div class="empty-state-icon">💼</div>
            <div class="empty-state-title">No Drive Applications Yet</div>
            <div class="empty-state-desc">You haven't submitted any applications. Browse the open recruitment drives matching your eligibility cutoff.</div>
            <button class="btn-primary btn-sm" onclick="navigateToRoute('/student/jobs')">Explore Campus Drives</button>
          </div>
        `;
      } else {
        overviewAppsContainer.innerHTML = myApps.slice(0, 4).map(app => {
          let badgeClass = 'blue';
          if (app.status === 'Offered') badgeClass = 'success';
          else if (app.status === 'Interview Scheduled') badgeClass = 'teal';
          else if (app.status === 'Shortlisted') badgeClass = 'blue';

          const compName = app.company || 'Campus Drive';
          const roleTitle = app.role || 'Software Engineer';

          return `
            <div class="history-item">
              <div class="history-item-left">
                <div class="drive-logo-initials" style="width: 34px; height: 34px; font-size: 12px;">${compName.slice(0, 2).toUpperCase()}</div>
                <div>
                  <div class="history-title">${compName} &bull; <span style="font-weight: 500; color: var(--text-secondary); font-size: 12px;">${roleTitle}</span></div>
                  <div class="history-date">Applied: ${app.appliedDate || 'Recently'} &bull; T&P Ref: ${app.id}</div>
                </div>
              </div>
              <span class="badge-status ${badgeClass}">${app.status}</span>
            </div>
          `;
        }).join('');
      }
    }

    // Full drives list on Jobs tab
    const fullDrivesContainer = document.getElementById('student-full-drives-list');
    if (fullDrivesContainer) {
      fullDrivesContainer.innerHTML = drives.map(drive => {
        const isEligible = (student.cgpa >= drive.minCGPA) && (student.backlogs <= drive.maxBacklogs);
        const hasApplied = myApps.some(a => a.driveId === drive.id);

        return `
          <div class="drive-list-card" style="padding: 16px;">
            <div class="drive-logo-initials" style="width: 44px; height: 44px;">${(drive.company || 'CD').slice(0, 2).toUpperCase()}</div>
            <div class="drive-info-col">
              <div class="drive-company-title" style="font-size: 15px;">
                <span>${drive.company || 'Campus Drive'}</span>
                <span class="badge-status success">₹${drive.packageLPA || 8.0} LPA</span>
                <span style="font-size: 11px; font-weight: 500; color: var(--text-secondary);">(${drive.applicantsCount || 0} applicants)</span>
              </div>
              <div class="drive-meta-text" style="margin-top: 4px;">
                <span>${drive.role} • Location: ${drive.location}</span>
                <span>Cutoff: Min CGPA ${drive.minCGPA}, Max Backlogs ${drive.maxBacklogs}</span>
                <span>Deadline: ${drive.deadline}</span>
                <span class="badge-status ${isEligible ? 'teal' : 'error'}">
                  ${isEligible ? 'Eligible to Apply' : 'Cutoff Criteria Not Met'}
                </span>
              </div>
            </div>
            <div>
              ${hasApplied 
                ? `<button class="btn-outline btn-sm" disabled style="background: var(--success-bg); color: var(--success-green); border-color: var(--success-green);">Applied ✓</button>`
                : isEligible 
                  ? `<button class="btn-primary btn-sm" onclick="applyForDrive('${drive.id}')">Apply Now</button>`
                  : `<button class="btn-outline btn-sm" disabled>Ineligible</button>`
              }
            </div>
          </div>
        `;
      }).join('');
    }

    // Applied drives table
    const appliedTbody = document.getElementById('student-applied-table-body');
    if (appliedTbody) {
      if (myApps.length === 0) {
        appliedTbody.innerHTML = `
          <tr>
            <td colspan="6">
              <div class="empty-state-table">
                <span style="font-size: 26px;">📁</span>
                <span style="font-weight: 700; color: var(--text-navy); font-size: 13.5px;">No applications submitted yet</span>
                <span style="font-size: 11.5px; color: var(--text-muted);">Your recruitment applications will be listed here with live interview statuses.</span>
                <button class="btn-primary btn-sm" style="margin-top: 6px;" onclick="switchStudentDriveTab('drives')">View Open Drives</button>
              </div>
            </td>
          </tr>
        `;
      } else {
        appliedTbody.innerHTML = myApps.map(app => {
          let badgeClass = 'blue';
          if (app.status === 'Offered') badgeClass = 'success';
          else if (app.status === 'Interview Scheduled') badgeClass = 'teal';

          return `
            <tr>
              <td><code>${app.id}</code></td>
              <td><strong>${app.company || 'Campus Drive'}</strong></td>
              <td>${app.role || 'Software Engineer'}</td>
              <td>${app.appliedDate || 'Recently'}</td>
              <td><span class="badge-status ${badgeClass}">${app.status}</span></td>
              <td>
                ${app.status === 'Offered' 
                  ? `<span style="font-weight: 700; color: var(--success-green);">Offer Package: ₹${app.offerPackage || 8.0} LPA</span>` 
                  : `<span style="color: var(--text-secondary); font-size: 11.5px;">Reviewed by T&P</span>`
                }
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Render new StudyFlow AI student modules
    renderStudentDashboard(student);
    renderStudentMyTasks(student);
    renderStudentGroupProjects(student);
    renderStudentAssignments(student);
    renderStudentCompanies(student);
    renderStudentApplications(student);
    renderStudentSkillGaps(student);
    renderStudentNotifications();

    // Render dynamic Donut Chart & Radar Chart
    renderStudentCharts(student);

    // Initialize Placement Prediction Simulator sliders with real student values
    const sliderCgpa = document.getElementById('slider-cgpa');
    const sliderCgpaVal = document.getElementById('slider-cgpa-val');
    const sliderApt = document.getElementById('slider-apt');
    const sliderAptVal = document.getElementById('slider-apt-val');
    const sliderTech = document.getElementById('slider-tech');
    const sliderTechVal = document.getElementById('slider-tech-val');
    const sliderIntern = document.getElementById('slider-intern');
    const sliderInternVal = document.getElementById('slider-intern-val');
    const sliderBacklogs = document.getElementById('slider-backlogs');
    const sliderBacklogsVal = document.getElementById('slider-backlogs-val');

    if (sliderCgpa && student.cgpa) {
      sliderCgpa.value = Number(student.cgpa).toFixed(1);
      if (sliderCgpaVal) sliderCgpaVal.textContent = Number(student.cgpa).toFixed(1);
    }
    if (sliderApt && student.aptitudeScore) {
      sliderApt.value = student.aptitudeScore;
      if (sliderAptVal) sliderAptVal.textContent = student.aptitudeScore;
    }
    if (sliderTech && student.technicalScore) {
      sliderTech.value = Math.max(1, Math.min(10, Math.round(student.technicalScore / 10)));
      if (sliderTechVal) sliderTechVal.textContent = Math.max(1, Math.min(10, Math.round(student.technicalScore / 10)));
    }
    if (sliderIntern && Array.isArray(student.internships)) {
      sliderIntern.value = student.internships.length;
      if (sliderInternVal) sliderInternVal.textContent = student.internships.length;
    }
    if (sliderBacklogs && student.backlogs !== undefined) {
      sliderBacklogs.value = student.backlogs || 0;
      if (sliderBacklogsVal) sliderBacklogsVal.textContent = student.backlogs || 0;
    }
    if (typeof updateSimulation === 'function') {
      updateSimulation();
    }

    // Render Student Profile View
    renderStudentProfileView(student);
  }

  function renderStudentProfileView(student) {
    if (!student) return;

    // 1. Identity & Avatar
    const avatarText = document.getElementById('sp-avatar-text');
    if (avatarText) {
      const name = student.name && student.name !== 'Student Profile' ? student.name : '';
      avatarText.textContent = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : (student.avatar || 'ST');
    }

    const spName = document.getElementById('sp-name');
    if (spName) spName.textContent = (student.name && student.name !== 'Student Profile') ? student.name : (localStorage.getItem('spp_user_name') || 'Student Profile');

    const spDegreeBranch = document.getElementById('sp-degree-branch');
    if (spDegreeBranch) spDegreeBranch.textContent = `${student.degree || 'B.Tech'} - ${student.branch || 'Engineering'}`;

    const spCollege = document.getElementById('sp-college');
    if (spCollege) spCollege.textContent = student.college || 'College of Engineering';

    const spEmail = document.getElementById('sp-email');
    if (spEmail) spEmail.textContent = student.email || localStorage.getItem('spp_user_email') || 'Pending Setup';

    const spPhone = document.getElementById('sp-phone');
    if (spPhone) spPhone.textContent = student.phone || 'Pending Setup';

    const spLoc = document.getElementById('sp-location');
    if (spLoc) {
      const locStr = (student.city && student.state) ? `${student.city}, ${student.state}` : (student.city || student.state || 'Location Pending');
      spLoc.textContent = locStr;
    }

    // 2. Badges (Year, CGPA, Status)
    const spYear = document.getElementById('sp-year-badge');
    if (spYear) spYear.textContent = student.currentYear || '1st Year';

    const spCgpa = document.getElementById('sp-cgpa-badge');
    if (spCgpa) {
      spCgpa.textContent = (student.cgpa !== null && student.cgpa !== undefined && !isNaN(student.cgpa))
        ? `CGPA: ${Number(student.cgpa).toFixed(2)}`
        : 'CGPA: Pending Setup';
      spCgpa.className = (student.cgpa !== null && student.cgpa !== undefined && !isNaN(student.cgpa))
        ? 'pill-profile-badge green'
        : 'pill-profile-badge warning';
    }

    const spStatus = document.getElementById('sp-status-badge');
    if (spStatus) {
      const isComplete = Boolean(student.cgpa && !isNaN(student.cgpa));
      spStatus.textContent = isComplete ? (student.placementStatus || 'Active Student') : 'Pending Setup';
      spStatus.className = isComplete ? 'pill-profile-badge success' : 'pill-profile-badge warning';
    }

    // 3. Completeness Gauge & Counts
    let score = 0;
    if (student.name && student.name !== 'Student Profile') score += 15;
    if (student.email) score += 15;
    if (student.phone) score += 10;
    if (student.branch) score += 10;
    if (student.cgpa) score += 25;
    if (student.tenthPct) score += 10;
    if (student.twelfthPct) score += 10;
    if (Array.isArray(student.internships) && student.internships.length > 0) score += 5;
    score = Math.min(100, Math.max(15, score));

    const gaugeVal = document.getElementById('sp-gauge-val');
    const gaugeCircle = document.getElementById('sp-gauge-circle');
    const gaugeStatus = document.getElementById('sp-gauge-status');
    if (gaugeVal) gaugeVal.textContent = `${score}%`;
    if (gaugeCircle) {
      const circumference = 201;
      const offset = circumference - (circumference * score / 100);
      gaugeCircle.style.strokeDashoffset = offset;
    }
    if (gaugeStatus) {
      gaugeStatus.textContent = score >= 80 ? 'Very Good' : (score >= 50 ? 'Good' : 'Needs Setup');
    }

    const cntIntern = document.getElementById('sp-cnt-internships');
    if (cntIntern) cntIntern.textContent = Array.isArray(student.internships) ? student.internships.length : 0;
    const cntProjects = document.getElementById('sp-cnt-projects');
    if (cntProjects) cntProjects.textContent = Array.isArray(student.projects) ? student.projects.length : 0;

    // 4. Academic Details Card (10th, 12th, B.Tech)
    const spTenthSub = document.getElementById('sp-tenth-sub');
    if (spTenthSub) {
      const board = student.tenthBoard || 'State Board';
      const school = student.tenthSchool || 'Secondary School';
      const yr = student.tenthYear ? ` (${student.tenthYear})` : '';
      spTenthSub.textContent = `${board} • ${school}${yr}`;
    }
    const spTenthScore = document.getElementById('sp-tenth-score');
    if (spTenthScore) {
      spTenthScore.textContent = (student.tenthPct !== null && student.tenthPct !== undefined && !isNaN(student.tenthPct))
        ? `${student.tenthPct}%`
        : 'Pending Setup';
    }

    const spTwelfthSub = document.getElementById('sp-twelfth-sub');
    if (spTwelfthSub) {
      const board = student.twelfthBoard || 'State Board';
      const stream = student.twelfthStream || 'MPC';
      const college = student.twelfthCollege || 'Junior College';
      const yr = student.twelfthYear ? ` (${student.twelfthYear})` : '';
      spTwelfthSub.textContent = `${board} • ${stream} • ${college}${yr}`;
    }
    const spTwelfthScore = document.getElementById('sp-twelfth-score');
    if (spTwelfthScore) {
      spTwelfthScore.textContent = (student.twelfthPct !== null && student.twelfthPct !== undefined && !isNaN(student.twelfthPct))
        ? `${student.twelfthPct}%`
        : 'Pending Setup';
    }

    const spBtechSub = document.getElementById('sp-btech-sub');
    if (spBtechSub) {
      spBtechSub.textContent = `${student.branch || 'Engineering'} • ${student.backlogs || 0} Active Backlogs`;
    }
    const spBtechScore = document.getElementById('sp-btech-score');
    if (spBtechScore) {
      spBtechScore.textContent = (student.cgpa !== null && student.cgpa !== undefined && !isNaN(student.cgpa))
        ? `${Number(student.cgpa).toFixed(2)} CGPA`
        : 'Pending Setup';
    }

    // 5. Present Course Card
    const presCollege = document.getElementById('sp-pres-college');
    if (presCollege) presCollege.textContent = student.college || 'College of Engineering';
    const presDegree = document.getElementById('sp-pres-degree');
    if (presDegree) presDegree.textContent = student.degree || 'Bachelor of Technology (B.Tech)';
    const presBranch = document.getElementById('sp-pres-branch');
    if (presBranch) presBranch.textContent = `Branch: ${student.branch || 'Pending'}`;
    const presMeta = document.getElementById('sp-pres-meta');
    if (presMeta) presMeta.textContent = `Roll No: ${student.rollNo || student.id || 'Pending'} • Current Year: ${student.currentYear || 'Pending'}`;
    const presMentor = document.getElementById('sp-pres-mentor');
    if (presMentor) presMentor.textContent = `Mentor: ${student.mentorName || 'Dr. Rajesh Sharma'}`;

    // 6. Academic Performance Progress Bars Card
    const perfTenth = document.getElementById('sp-perf-tenth');
    const barTenth = document.getElementById('sp-bar-tenth');
    if (perfTenth) perfTenth.textContent = (student.tenthPct !== null && student.tenthPct !== undefined && !isNaN(student.tenthPct)) ? `${student.tenthPct}%` : '--%';
    if (barTenth) barTenth.style.width = `${Math.min(100, Math.max(0, student.tenthPct || 0))}%`;

    const perfTwelfth = document.getElementById('sp-perf-twelfth');
    const barTwelfth = document.getElementById('sp-bar-twelfth');
    if (perfTwelfth) perfTwelfth.textContent = (student.twelfthPct !== null && student.twelfthPct !== undefined && !isNaN(student.twelfthPct)) ? `${student.twelfthPct}%` : '--%';
    if (barTwelfth) barTwelfth.style.width = `${Math.min(100, Math.max(0, student.twelfthPct || 0))}%`;

    const perfCgpa = document.getElementById('sp-perf-cgpa');
    const barCgpa = document.getElementById('sp-bar-cgpa');
    if (perfCgpa) perfCgpa.textContent = (student.cgpa !== null && student.cgpa !== undefined && !isNaN(student.cgpa)) ? `${Number(student.cgpa).toFixed(2)} CGPA` : '-- CGPA';
    if (barCgpa) barCgpa.style.width = `${Math.min(100, Math.max(0, (student.cgpa || 0) * 10))}%`;

    // 7. Internships List
    const internContainer = document.getElementById('sp-internships-container');
    const internNote = document.getElementById('sp-internship-verified-note');
    const internships = Array.isArray(student.internships) ? student.internships : [];
    if (internNote) internNote.textContent = `${internships.length} Verified Experience${internships.length === 1 ? '' : 's'}`;
    if (internContainer) {
      if (internships.length === 0) {
        internContainer.innerHTML = `
          <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 11.5px; background: #F8FAFC; border-radius: var(--radius-sm);">
            No internships added yet. Click "+ Add" to record your industry experience.
          </div>
        `;
      } else {
        internContainer.innerHTML = internships.map(item => `
          <div class="academic-row-item" style="align-items: flex-start; justify-content: space-between;">
            <div>
              <div style="font-weight: 700; color: var(--text-navy); font-size: 12px;">${item.role || 'Intern'} • <span style="color: #0D8A60;">${item.company}</span></div>
              <div style="font-size: 11px; color: var(--text-secondary); margin-top: 1px;">${item.startDate || ''} - ${item.endDate || 'Completed'} • ${item.mode || 'Onsite'}</div>
              ${item.skillsUsed ? `<div style="font-size: 10.5px; color: #2563EB; margin-top: 2px;">Tech: ${item.skillsUsed}</div>` : ''}
            </div>
            <button onclick="deleteStudentInternship('${item.id}')" style="background: transparent; border: none; color: #EF4444; font-size: 13px; cursor: pointer; padding: 2px 4px;" title="Remove internship">✕</button>
          </div>
        `).join('');
      }
    }

    // 8. Recent Activities List
    const actContainer = document.getElementById('sp-activity-container');
    if (actContainer) {
      const activities = Array.isArray(student.recentActivities) ? student.recentActivities : [];
      if (activities.length === 0) {
        actContainer.innerHTML = `
          <div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 11px;">
            No recent activity recorded yet.
          </div>
        `;
      } else {
        actContainer.innerHTML = activities.slice(0, 4).map(act => `
          <div style="padding: 8px 10px; background: #F8FAFC; border-left: 3px solid #0D8A60; border-radius: var(--radius-sm); font-size: 11.5px;">
            <div style="font-weight: 600; color: var(--text-navy);">${act.title}</div>
            <div style="font-size: 10px; color: var(--text-secondary); margin-top: 1px;">${act.desc} • <span style="color: var(--text-muted);">${act.time || 'Just now'}</span></div>
          </div>
        `).join('');
      }
    }

    // 9. Profile Setup Guide Banner
    const setupBanner = document.getElementById('profile-setup-guide-banner');
    if (setupBanner) {
      const isPending = !student.cgpa || student.predictionStatus === 'Pending Setup';
      setupBanner.style.display = isPending ? 'flex' : 'none';
    }
  }

  // --- STUDYFLOW AI VIEWS RENDERING ---

  function renderStudentDashboard(student) {
    if (!student) return;

    const dashName = document.getElementById('dash-welcome-name');
    if (dashName) dashName.textContent = student.name || 'Student';

    const dashBadgeStatus = document.getElementById('dash-student-badge-status');
    if (dashBadgeStatus) {
      if (student.cgpa) {
        dashBadgeStatus.textContent = `${student.degree || 'B.Tech'} • ${student.branch || 'Engineering'} • CGPA: ${Number(student.cgpa).toFixed(2)}`;
      } else {
        dashBadgeStatus.textContent = 'Student Portal Active';
      }
    }

    const profile = store.getAcademicProfile ? store.getAcademicProfile(student.id) : null;
    const isProfilePending = !student.cgpa || student.predictionStatus === 'Pending Setup';

    // 0. Empty State Profile Setup Banner
    const emptyBanner = document.getElementById('empty-state-profile-banner');
    if (emptyBanner) {
      emptyBanner.style.display = isProfilePending ? 'flex' : 'none';
    }

    // CGPA Badge in Progression Chart header
    const cgpaBadge = document.getElementById('dash-cumulative-cgpa-badge');
    if (cgpaBadge) {
      cgpaBadge.textContent = student.cgpa ? `CGPA: ${Number(student.cgpa).toFixed(2)}` : 'CGPA: Pending';
      cgpaBadge.className = student.cgpa ? 'badge-status success' : 'badge-status warning';
    }

    // 1. Calculate Real Assignment Completion for this Student
    const allAssignments = [
      ...(store.data.facultyAssignments || []),
      ...(store.data.labAssignments || [])
    ];
    let completedAsgCount = 0;
    allAssignments.forEach(a => {
      const subs = a.submissions || [];
      const hasStudentSub = subs.some(s => 
        (s.studentId === student.id || s.studentId === student.userId) &&
        (s.status === 'Submitted' || s.status === 'Graded' || s.status === 'Revision Requested' || s.status === 'Under Review' || Boolean(s.isRevisionRequested) || (s.marks !== null && s.marks !== undefined))
      );

      const hasStudentStatus = (
        a.studentStatus === 'Submitted' || a.studentStatus === 'Graded' || a.studentStatus === 'Revision Requested' || a.studentStatus === 'Under Review' ||
        Boolean(a.isRevisionRequested) ||
        ((a.status === 'Submitted' || a.status === 'Graded' || a.status === 'Revision Requested') && (a.submissionUrl || a.submittedDate))
      );

      if (hasStudentSub || hasStudentStatus) {
        completedAsgCount++;
      }
    });

    const totalAsgCount = allAssignments.length;
    let assignmentCompletionRate = null;
    if (totalAsgCount > 0) {
      assignmentCompletionRate = Math.round((completedAsgCount / totalAsgCount) * 100);
    }

    // 2. Calculate Real Attendance
    let attendanceRate = null;
    if (profile && profile.attendancePct !== undefined && profile.attendancePct !== null) {
      attendanceRate = Number(profile.attendancePct);
    } else if (student.attendance !== undefined && student.attendance !== null) {
      attendanceRate = Number(student.attendance);
    }

    // 3. Calculate Real Marks Average
    let currentMarksAverage = null;
    let marksSource = '';
    if (profile && Array.isArray(profile.subjects) && profile.subjects.length > 0) {
      const validSubjects = profile.subjects.filter(s => s.currentMark !== undefined && s.currentMark !== null && !isNaN(s.currentMark));
      if (validSubjects.length > 0) {
        const totalMarks = validSubjects.reduce((sum, s) => sum + Number(s.currentMark), 0);
        currentMarksAverage = Math.round((totalMarks / validSubjects.length) * 10) / 10;
        marksSource = `${validSubjects.length} Coursework Subject${validSubjects.length === 1 ? '' : 's'}`;
      }
    }
    if (currentMarksAverage === null) {
      if (profile && (profile.currentMarksPct || profile.overallMarksPct || profile.marksAverage)) {
        currentMarksAverage = Number(profile.currentMarksPct || profile.overallMarksPct || profile.marksAverage);
        marksSource = 'Verified Records';
      } else if (student.marksAverage !== undefined && student.marksAverage !== null) {
        currentMarksAverage = Number(student.marksAverage);
        marksSource = 'Verified Records';
      }
    }

    // 4. Calculate Quiz & Internal Average
    let internalAverage = null;
    let quizDetails = '';
    const qVal = (profile && profile.quizAverage !== null && profile.quizAverage !== undefined) ? profile.quizAverage : (student.quizAvg !== undefined && student.quizAvg !== null ? student.quizAvg : null);
    const iVal = (profile && profile.internalAverage !== null && profile.internalAverage !== undefined) ? profile.internalAverage : (student.internalAvg !== undefined && student.internalAvg !== null ? student.internalAvg : null);
    
    if (qVal !== null || iVal !== null) {
      const q = qVal !== null ? `Quiz ${qVal}%` : '';
      const it = iVal !== null ? `Int ${iVal}%` : '';
      quizDetails = [q, it].filter(Boolean).join(' • ');
      internalAverage = iVal !== null ? iVal : qVal;
    }

    // 5. Prediction Calculation (Only when sufficient verified records exist!)
    const effInternal = iVal !== null ? iVal : (currentMarksAverage !== null ? currentMarksAverage : null);
    const effQuiz = qVal !== null ? qVal : (iVal !== null ? iVal : null);
    const hasEnoughPredictionData = (effInternal !== null && effQuiz !== null && student.cgpa && attendanceRate !== null);
    const prediction = hasEnoughPredictionData
      ? store.predictFinalScore({
          internals: effInternal,
          quiz: effQuiz,
          cgpa: student.cgpa,
          assignments: assignmentCompletionRate !== null ? assignmentCompletionRate : 75,
          attendance: attendanceRate,
          isSimulation: true // Do not overwrite profile!
        })
      : null;

    // --- POPULATE 5 ACADEMIC SUMMARY KPI CARDS ---
    // Card 1: PREDICTED FINAL SCORE
    const elPred = document.getElementById('dash-academic-predicted');
    const elGrade = document.getElementById('dash-academic-grade');
    const elPredSub = document.getElementById('dash-academic-predicted-subtext');
    if (elPred) {
      if (prediction && prediction.predictedScore) {
        elPred.innerHTML = `${prediction.predictedScore} <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary);">/ 100</span>`;
      } else {
        elPred.innerHTML = `-- <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary);">/ 100</span>`;
      }
    }
    if (elGrade) {
      elGrade.textContent = prediction ? prediction.grade : 'Pending Records';
      elGrade.className = prediction ? 'kpi-pill teal' : 'kpi-pill orange';
    }
    if (elPredSub) {
      elPredSub.textContent = prediction ? 'Continuous Projection' : 'Prediction Unavailable';
    }

    // Card 2: CURRENT MARKS AVERAGE
    const elMarks = document.getElementById('dash-academic-marks');
    const elMarksPill = document.getElementById('dash-academic-marks-pill');
    const elMarksSub = document.getElementById('dash-academic-marks-subtext');
    if (elMarks) {
      elMarks.textContent = currentMarksAverage !== null ? `${currentMarksAverage}%` : '--%';
    }
    if (elMarksPill) {
      if (currentMarksAverage !== null) {
        let gradeLetter = 'Grade A+';
        if (currentMarksAverage >= 90) gradeLetter = 'Grade O';
        else if (currentMarksAverage >= 80) gradeLetter = 'Grade A+';
        else if (currentMarksAverage >= 70) gradeLetter = 'Grade A';
        else if (currentMarksAverage >= 60) gradeLetter = 'Grade B';
        else gradeLetter = 'Grade C';
        elMarksPill.textContent = gradeLetter;
        elMarksPill.className = 'kpi-pill teal';
      } else {
        elMarksPill.textContent = 'No Records';
        elMarksPill.className = 'kpi-pill orange';
      }
    }
    if (elMarksSub) {
      elMarksSub.textContent = marksSource || 'Upload marksheets to calculate';
    }

    // Card 3: LECTURE ATTENDANCE
    const elAtt = document.getElementById('dash-academic-attendance');
    const elAttPill = document.getElementById('dash-academic-attendance-pill');
    const elAttSub = document.getElementById('dash-academic-attendance-subtext');
    if (elAtt) {
      elAtt.textContent = attendanceRate !== null ? `${attendanceRate}%` : '--%';
    }
    if (elAttPill) {
      if (attendanceRate !== null) {
        const isCompliant = attendanceRate >= 75;
        elAttPill.textContent = isCompliant ? 'Compliant (≥75%)' : 'Low (<75%)';
        elAttPill.className = isCompliant ? 'kpi-pill teal' : 'kpi-pill orange';
      } else {
        elAttPill.textContent = 'No Data';
        elAttPill.className = 'kpi-pill orange';
      }
    }
    if (elAttSub) {
      if (attendanceRate !== null) {
        elAttSub.textContent = attendanceRate >= 75 ? 'Good Standing' : 'Attendance Warning';
      } else {
        elAttSub.textContent = 'No attendance data available';
      }
    }

    // Card 4: ASSIGNMENT COMPLETION
    const elAsg = document.getElementById('dash-academic-assignments');
    const elAsgPill = document.getElementById('dash-academic-assignments-pill');
    const elAsgSub = document.getElementById('dash-academic-assignments-subtext');
    if (elAsg) {
      elAsg.textContent = assignmentCompletionRate !== null ? `${assignmentCompletionRate}%` : '--%';
    }
    if (elAsgPill) {
      if (totalAsgCount > 0) {
        elAsgPill.textContent = `${completedAsgCount} / ${totalAsgCount} Completed`;
        elAsgPill.className = completedAsgCount === totalAsgCount ? 'kpi-pill teal' : 'kpi-pill blue';
      } else {
        elAsgPill.textContent = 'No Tasks';
        elAsgPill.className = 'kpi-pill orange';
      }
    }
    if (elAsgSub) {
      if (totalAsgCount > 0) {
        const pending = totalAsgCount - completedAsgCount;
        elAsgSub.textContent = pending > 0 ? `${pending} Pending Submission${pending === 1 ? '' : 's'}` : 'All caught up!';
      } else {
        elAsgSub.textContent = 'No assignments assigned';
      }
    }

    // Card 5: QUIZ & INTERNAL AVG
    const elInt = document.getElementById('dash-academic-internals');
    const elIntPill = document.getElementById('dash-academic-internals-pill');
    const elIntSub = document.getElementById('dash-academic-internals-subtext');
    if (elInt) {
      elInt.textContent = internalAverage !== null ? `${internalAverage}%` : '--%';
    }
    if (elIntPill) {
      if (internalAverage !== null) {
        elIntPill.textContent = quizDetails || 'Recorded';
        elIntPill.className = 'kpi-pill orange';
      } else {
        elIntPill.textContent = 'No Data';
        elIntPill.className = 'kpi-pill orange';
      }
    }
    if (elIntSub) {
      elIntSub.textContent = internalAverage !== null ? 'Continuous Assessment' : 'No assessments recorded';
    }

    // --- FINAL EXAM SCORE PREDICTION HERO CARD ---
    const heroScore = document.getElementById('pred-hero-score');
    const heroGrade = document.getElementById('pred-hero-grade');
    const heroCi = document.getElementById('pred-hero-ci');
    const heroCalib = document.getElementById('pred-hero-calibration');

    if (heroScore) {
      if (prediction && prediction.predictedScore) {
        heroScore.innerHTML = `${prediction.predictedScore} <span style="font-size: 18px; font-weight: 600; color: #64748B;">/ 100</span>`;
      } else {
        heroScore.innerHTML = `-- <span style="font-size: 18px; font-weight: 600; color: #64748B;">/ 100</span>`;
      }
    }
    if (heroGrade) {
      heroGrade.textContent = prediction ? prediction.grade : 'Prediction unavailable — pending academic records';
    }
    if (heroCi) {
      if (prediction && prediction.confidenceInterval) {
        heroCi.innerHTML = `Confidence Interval: <strong>${prediction.confidenceInterval.min} – ${prediction.confidenceInterval.max}</strong> (MAE: ±${prediction.mae})`;
      } else {
        heroCi.innerHTML = 'Confidence Interval: <strong>Pending Academic Records</strong>';
      }
    }
    if (heroCalib) {
      heroCalib.textContent = prediction ? 'Verified from Student Records' : 'Awaiting Student Profile Setup';
    }

    // --- 3. RENDER SUBJECT-WISE MARKS BAR CHART ---
    const subjectsContainer = document.getElementById('student-subjects-barchart');
    if (subjectsContainer) {
      const subjects = (profile && Array.isArray(profile.subjects)) ? profile.subjects : [];
      if (subjects.length === 0) {
        subjectsContainer.innerHTML = `
          <div class="empty-state-box" style="padding: 28px 16px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 6px;">📊</div>
            <div style="font-weight: 600; color: var(--text-navy); font-size: 13px;">No Coursework Subject Marks Recorded Yet</div>
            <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">Subject-wise performance and cohort benchmarks will be plotted here once semester marks are uploaded.</div>
          </div>
        `;
      } else {
        subjectsContainer.innerHTML = `
          <div style="padding: 10px 0;">
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${subjects.map(s => {
                const isWarning = s.isWeak || s.currentMark < 80;
                const barColor = isWarning ? '#D97706' : (s.currentMark >= 90 ? '#0D8A60' : '#2563EB');
                const benchmarkVal = s.classAverage || s.targetScore || 82;
                return `
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 12.5px; font-weight: 700; color: #1E293B;">${s.name}</span>
                        <code style="font-size: 10.5px; color: #64748B;">${s.code}</code>
                        ${isWarning ? `<span class="badge-status warning" style="font-size: 10px; padding: 1px 6px;">Needs Focus</span>` : ''}
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 11px; color: #64748B;">Benchmark: ${benchmarkVal}%</span>
                        <span style="font-size: 13px; font-weight: 800; color: ${barColor};">${s.currentMark}%</span>
                      </div>
                    </div>
                    <div style="position: relative; height: 10px; background: #F1F5F9; border-radius: 5px; overflow: hidden;">
                      <div style="width: ${s.currentMark}%; height: 100%; background: ${barColor}; border-radius: 5px; transition: width 0.6s ease;"></div>
                      <div style="position: absolute; left: ${benchmarkVal}%; top: 0; bottom: 0; width: 2px; background: #94A3B8; z-index: 2;" title="Cohort Benchmark: ${benchmarkVal}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 10px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #64748B;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span><span style="display: inline-block; width: 10px; height: 10px; background: #0D8A60; border-radius: 2px; margin-right: 4px;"></span> &ge;90% (Outstanding)</span>
                <span><span style="display: inline-block; width: 10px; height: 10px; background: #2563EB; border-radius: 2px; margin-right: 4px;"></span> 80–89% (Distinction)</span>
                <span><span style="display: inline-block; width: 10px; height: 10px; background: #D97706; border-radius: 2px; margin-right: 4px;"></span> &lt;80% (Review Recommended)</span>
              </div>
              <span>Vertical line = Cohort Benchmark</span>
            </div>
          </div>
        `;
      }
    }

    // --- 4. RENDER SEMESTER-WISE SGPA PROGRESSION TREND LINE ---
    const semesterContainer = document.getElementById('student-semester-trendchart');
    if (semesterContainer) {
      const sems = (profile && Array.isArray(profile.semesters)) ? profile.semesters : [];
      if (sems.length < 2) {
        semesterContainer.innerHTML = `
          <div class="empty-state-box" style="padding: 28px 16px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 6px;">📈</div>
            <div style="font-weight: 600; color: var(--text-navy); font-size: 13px;">No Semester Progression History Recorded</div>
            <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">Upload semester marksheets or complete academic records to track your longitudinal SGPA trajectory.</div>
          </div>
        `;
      } else {
        const width = 540;
        const height = 180;
        const padLeft = 45;
        const padRight = 30;
        const padTop = 25;
        const padBottom = 35;
        const minSgpa = 7.0;
        const maxSgpa = 10.0;

        const getX = (idx) => padLeft + (idx / (sems.length - 1)) * (width - padLeft - padRight);
        const getY = (val) => padTop + ((maxSgpa - val) / (maxSgpa - minSgpa)) * (height - padTop - padBottom);

        const points = sems.map((s, i) => `${getX(i)},${getY(s.gpa || s.sgpa || 8.1)}`).join(' ');
        const cutoffY = getY(8.0);

        semesterContainer.innerHTML = `
          <svg viewBox="0 0 ${width} ${height}" class="interactive-chart-svg" style="width: 100%; height: auto;">
            <line x1="${padLeft}" y1="${getY(9.0)}" x2="${width - padRight}" y2="${getY(9.0)}" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="3 3"/>
            <text x="${padLeft - 8}" y="${getY(9.0) + 4}" font-size="10" fill="#94A3B8" text-anchor="end">9.0</text>

            <line x1="${padLeft}" y1="${cutoffY}" x2="${width - padRight}" y2="${cutoffY}" stroke="#CBD5E1" stroke-width="1.2" stroke-dasharray="4 4"/>
            <text x="${padLeft - 8}" y="${cutoffY + 4}" font-size="10" fill="#64748B" font-weight="600" text-anchor="end">8.0</text>
            <text x="${width - padRight}" y="${cutoffY - 6}" font-size="9" fill="#64748B" font-weight="600" text-anchor="end">Distinction Cutoff (8.0)</text>

            <line x1="${padLeft}" y1="${getY(7.0)}" x2="${width - padRight}" y2="${getY(7.0)}" stroke="#E2E8F0" stroke-width="1"/>
            <text x="${padLeft - 8}" y="${getY(7.0) + 4}" font-size="10" fill="#94A3B8" text-anchor="end">7.0</text>

            <polygon points="${getX(0)},${height - padBottom} ${points} ${getX(sems.length - 1)},${height - padBottom}" fill="rgba(37, 99, 235, 0.08)"/>
            <polyline points="${points}" fill="none" stroke="#2563EB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

            ${sems.map((s, i) => {
              const val = Number(s.gpa || s.sgpa || 8.1).toFixed(2);
              const label = String(s.sem).includes('Sem') ? s.sem : `Sem ${s.sem}`;
              return `
                <circle cx="${getX(i)}" cy="${getY(Number(val))}" r="5" fill="#FFFFFF" stroke="#2563EB" stroke-width="2.5"/>
                <text x="${getX(i)}" y="${getY(Number(val)) - 10}" font-size="11" font-weight="700" fill="#1E293B" text-anchor="middle">${val}</text>
                <text x="${getX(i)}" y="${height - padBottom + 18}" font-size="10.5" font-weight="600" fill="#64748B" text-anchor="middle">${label}</text>
              `;
            }).join('')}
          </svg>
        `;
      }
    }

    // --- 5. RENDER ML FEATURE IMPORTANCE ---
    const featureContainer = document.getElementById('student-feature-importance-container');
    if (featureContainer) {
      if (prediction && prediction.contributions) {
        featureContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${prediction.contributions.map(c => `
              <div class="feature-imp-item">
                <div class="feature-imp-header">
                  <span class="feature-imp-title">${c.feature}</span>
                  <span class="feature-imp-score">Current Val: <strong>${c.value}%</strong> • Empirical Impact: <strong>+${c.impact} pts</strong></span>
                </div>
                <div class="feature-imp-track">
                  <div class="feature-imp-fill" style="width: ${c.weight * 2.5}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        featureContainer.innerHTML = `
          <div class="empty-state-box" style="padding: 20px; text-align: center;">
            <div style="font-size: 20px; margin-bottom: 4px;">⚖️</div>
            <div style="font-weight: 600; color: var(--text-navy); font-size: 13px;">Empirical Feature Impact Unavailable</div>
            <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Enter continuous assessment marks, CGPA, and attendance to view feature importance weightings.</div>
          </div>
        `;
      }
    }

    // --- 6. RENDER PERSONALIZED RECOMMENDATIONS ---
    const recContainer = document.getElementById('student-recommendations-container');
    if (recContainer && store.getPersonalizedRecommendations) {
      const recs = store.getPersonalizedRecommendations(student.id);
      recContainer.innerHTML = recs.map(r => `
        <div class="rec-card-item ${r.type}">
          <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px;">
            <div class="rec-icon-box ${r.type}">
              ${r.type === 'warning' ? '⚠️' : (r.type === 'urgent' ? '⏳' : (r.type === 'notice' ? '📊' : '👨‍🏫'))}
            </div>
            <div style="flex: 1;">
              <span class="rec-category-tag">${r.category}</span>
              <h4 class="rec-title">${r.title}</h4>
            </div>
          </div>
          <p class="rec-desc">${r.description}</p>
          <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
            <button class="btn-outline btn-sm" style="font-size: 11px; padding: 4px 10px;" onclick="navigateToRoute('${r.actionRoute}')">
              ${r.actionLabel} &rarr;
            </button>
          </div>
        </div>
      `).join('');
    }

    // --- 7. RENDER ASSIGNMENT COMPLETION PREDICTIONS ---
    const asgTbody = document.getElementById('student-asg-predictions-tbody');
    if (asgTbody && store.getAssignmentCompletionPredictions) {
      const asgPreds = store.getAssignmentCompletionPredictions(student.id);
      if (asgPreds.length === 0) {
        asgTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No active coursework assignments requiring prediction.</td></tr>`;
      } else {
        asgTbody.innerHTML = asgPreds.map(a => {
          const barColor = a.likelihood >= 85 ? '#0D8A60' : (a.likelihood >= 70 ? '#2563EB' : '#DC2626');
          const badgeClass = a.risk === 'Low Risk' ? 'teal' : (a.risk === 'Moderate Risk' ? 'warning' : 'error');
          return `
            <tr>
              <td><strong>${a.title}</strong></td>
              <td><span class="badge-status blue">${a.subject}</span></td>
              <td><code>${a.dueDate} ${a.dueTime}</code></td>
              <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="flex: 1; height: 6px; background: #E2E8F0; border-radius: 3px; min-width: 60px; overflow: hidden;">
                    <div style="width: ${a.likelihood}%; height: 100%; background: ${barColor}; border-radius: 3px;"></div>
                  </div>
                  <strong style="color: ${barColor};">${a.likelihood}%</strong>
                </div>
              </td>
              <td><span class="badge-status ${badgeClass}">${a.risk}</span></td>
              <td style="font-size: 11px; color: var(--text-secondary); max-width: 240px;">
                ${a.factors.join('; ')}
              </td>
              <td>
                <button class="btn-primary btn-sm" style="font-size: 11px; padding: 3px 8px;" onclick="navigateToRoute('/student/assignments/faculty')">
                  View
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // --- 8. TODAY'S SCHEDULE & PRIORITIES PREVIEW ---
    const myTasks = store.getStudentTasks(student.id);
    const dashTasks = document.getElementById('dash-tasks-preview');
    if (dashTasks) {
      if (myTasks.length === 0) {
        dashTasks.innerHTML = `<div style="font-size: 12.5px; color: var(--text-muted); padding: 10px 0;">No pending tasks today. Great job!</div>`;
      } else {
        dashTasks.innerHTML = myTasks.slice(0, 3).map(t => `
          <div class="task-item-card" style="margin-bottom: 8px; padding: 10px 12px;">
            <div class="task-checkbox-wrap">
              <button class="task-custom-checkbox ${t.status === 'Completed' ? 'checked' : ''}" onclick="toggleTaskStatus('${t.id}')">
                ${t.status === 'Completed' ? '✓' : ''}
              </button>
            </div>
            <div class="task-content-col">
              <div class="task-title-text ${t.status === 'Completed' ? 'completed' : ''}" style="font-size: 13px;">${t.title}</div>
              <div class="task-meta-row" style="font-size: 11.5px;">
                <span>Due: ${t.dueDate}</span>
                <span class="badge-status ${t.priority === 'High' ? 'error' : 'blue'}" style="font-size: 10px; padding: 1px 6px;">${t.priority}</span>
              </div>
            </div>
          </div>
        `).join('');
      }
    }

    // Update Attendance Footer in Priorities card
    const tasksAttFooter = document.getElementById('dash-tasks-attendance-footer');
    if (tasksAttFooter) {
      if (attendanceRate !== null) {
        const isComp = attendanceRate >= 75;
        tasksAttFooter.innerHTML = `Attendance: <strong>${attendanceRate}%</strong> (${isComp ? 'Compliant' : 'Warning'})`;
      } else {
        tasksAttFooter.innerHTML = `Attendance: <strong>No records yet</strong>`;
      }
    }

    // --- 9. UPCOMING RECRUITMENT DRIVES PREVIEW ---
    const myApps = store.getStudentApplications(student.id);
    const dashDrives = document.getElementById('dash-drives-preview');
    if (dashDrives) {
      const drives = store.getDrives().slice(0, 3);
      dashDrives.innerHTML = drives.map(d => {
        const hasApplied = myApps.some(a => a.driveId === d.id);
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="drive-logo-initials" style="width: 32px; height: 32px; font-size: 11px;">${(d.company || 'CD').slice(0, 2).toUpperCase()}</div>
              <div>
                <div style="font-size: 13px; font-weight: 600; color: #0F172A;">${d.company || 'Campus Drive'}</div>
                <div style="font-size: 11px; color: var(--text-secondary);">${d.role || 'Software Engineer'} • ₹${d.packageLPA || 8.0} LPA</div>
              </div>
            </div>
            <div>
              ${hasApplied 
                ? `<span class="badge-status success" style="font-size: 11px;">Applied ✓</span>`
                : `<button class="btn-primary btn-sm" style="font-size: 11px; padding: 4px 10px;" onclick="navigateToRoute('/student/companies')">View</button>`
              }
            </div>
          </div>
        `;
      }).join('');
    }

    // Update Interview Footer in Drives card
    const drivesInterviewFooter = document.getElementById('dash-drives-interview-footer');
    if (drivesInterviewFooter) {
      const scheduledApp = myApps.find(a => a.status === 'Interview Scheduled');
      if (scheduledApp) {
        drivesInterviewFooter.innerHTML = `Next Interview: <strong>${scheduledApp.company || 'Campus Drive'}</strong>`;
      } else if (myApps.length > 0) {
        drivesInterviewFooter.innerHTML = `Applications Active: <strong>${myApps.length} in process</strong>`;
      } else {
        drivesInterviewFooter.innerHTML = `Next Interview: <strong>No active interviews</strong>`;
      }
    }

    // --- 10. INITIALIZE WHAT-IF SIMULATOR SLIDERS ---
    initAcademicSimulatorValues(student, profile, assignmentCompletionRate, attendanceRate, internalAverage, prediction);
  }

  function initAcademicSimulatorValues(student, profile, assignmentCompletionRate, attendanceRate, internalAverage, prediction) {
    const sInt = document.getElementById('sim-slider-internals');
    const sQuiz = document.getElementById('sim-slider-quiz');
    const sCgpa = document.getElementById('sim-slider-cgpa');
    const sAsg = document.getElementById('sim-slider-assignments');
    const sAtt = document.getElementById('sim-slider-attendance');

    const initInt = (profile && profile.internalAverage) ? Number(profile.internalAverage) : (internalAverage || 70);
    const initQuiz = (profile && profile.quizAverage) ? Number(profile.quizAverage) : 70;
    const initCgpa = (student && student.cgpa) ? Number(student.cgpa) : 7.0;
    const initAsg = assignmentCompletionRate !== null ? assignmentCompletionRate : 75;
    const initAtt = attendanceRate !== null ? attendanceRate : 75;

    if (sInt) sInt.value = initInt;
    if (sQuiz) sQuiz.value = initQuiz;
    if (sCgpa) sCgpa.value = initCgpa;
    if (sAsg) sAsg.value = initAsg;
    if (sAtt) sAtt.value = initAtt;

    const valInt = document.getElementById('sim-val-internals');
    const valQuiz = document.getElementById('sim-val-quiz');
    const valCgpa = document.getElementById('sim-val-cgpa');
    const valAsg = document.getElementById('sim-val-assignments');
    const valAtt = document.getElementById('sim-val-attendance');

    if (valInt) valInt.textContent = (profile && profile.internalAverage) ? `${initInt}%` : '--%';
    if (valQuiz) valQuiz.textContent = (profile && profile.quizAverage) ? `${initQuiz}%` : '--%';
    if (valCgpa) valCgpa.textContent = (student && student.cgpa) ? initCgpa.toFixed(2) : '--';
    if (valAsg) valAsg.textContent = (assignmentCompletionRate !== null) ? `${initAsg}%` : '--%';
    if (valAtt) valAtt.textContent = (attendanceRate !== null) ? `${initAtt}%` : '--%';

    const resText = document.getElementById('sim-result-text');
    const deltaBadge = document.getElementById('sim-delta-badge');
    if (prediction && prediction.predictedScore) {
      if (resText) resText.textContent = `${prediction.predictedScore} / 100 • ${prediction.grade}`;
      if (deltaBadge) {
        deltaBadge.className = 'badge-status teal';
        deltaBadge.textContent = 'Actual Baseline';
      }
    } else {
      if (resText) resText.textContent = '-- / 100 • Pending Academic Records';
      if (deltaBadge) {
        deltaBadge.className = 'badge-status warning';
        deltaBadge.textContent = 'Simulation Ready';
      }
    }
  }

  // Interactive What-If Academic Simulator Handlers
  window.updateAcademicSimulator = function() {
    const internals = parseFloat(document.getElementById('sim-slider-internals')?.value || 70);
    const quiz = parseFloat(document.getElementById('sim-slider-quiz')?.value || 70);
    const cgpa = parseFloat(document.getElementById('sim-slider-cgpa')?.value || 7.0);
    const assignments = parseFloat(document.getElementById('sim-slider-assignments')?.value || 75);
    const attendance = parseFloat(document.getElementById('sim-slider-attendance')?.value || 75);

    const valInt = document.getElementById('sim-val-internals');
    const valQuiz = document.getElementById('sim-val-quiz');
    const valCgpa = document.getElementById('sim-val-cgpa');
    const valAsg = document.getElementById('sim-val-assignments');
    const valAtt = document.getElementById('sim-val-attendance');

    if (valInt) valInt.textContent = `${internals}%`;
    if (valQuiz) valQuiz.textContent = `${quiz}%`;
    if (valCgpa) valCgpa.textContent = cgpa.toFixed(2);
    if (valAsg) valAsg.textContent = `${assignments}%`;
    if (valAtt) valAtt.textContent = `${attendance}%`;

    // Pure simulation computation - do NOT overwrite student database record!
    const result = store.predictFinalScore({ internals, quiz, cgpa, assignments, attendance, isSimulation: true });
    if (!result) return;

    const student = store.data.roles?.student;
    const profile = student?.academicProfile;
    const actualBaseline = (profile && profile.predictedFinalScore) ? profile.predictedFinalScore : null;

    const resText = document.getElementById('sim-result-text');
    const deltaBadge = document.getElementById('sim-delta-badge');

    if (resText) {
      resText.textContent = `${result.predictedScore} / 100 • ${result.grade}`;
    }
    if (deltaBadge) {
      if (actualBaseline !== null) {
        const diff = Math.round((result.predictedScore - actualBaseline) * 10) / 10;
        if (diff > 0) {
          deltaBadge.className = 'badge-status success';
          deltaBadge.textContent = `+${diff} pts simulated improvement`;
        } else if (diff < 0) {
          deltaBadge.className = 'badge-status error';
          deltaBadge.textContent = `${diff} pts simulated dip`;
        } else {
          deltaBadge.className = 'badge-status teal';
          deltaBadge.textContent = 'Matches Actual Baseline';
        }
      } else {
        deltaBadge.className = 'badge-status blue';
        deltaBadge.textContent = 'Simulated Forecast (Not Saved)';
      }
    }
  };

  window.resetAcademicSimulator = function() {
    const student = store.data.roles?.student;
    renderStudentDashboard(student);
    window.showToast?.('Simulator reset to your verified academic records.', 'info');
  };


  // Task Filter state
  window._currentTaskFilter = 'all';
  window.setTaskFilter = function(filter) {
    window._currentTaskFilter = filter;
    document.querySelectorAll('.task-filter-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
    });
    renderStudentMyTasks(store.data.roles.student);
  };

  function renderStudentMyTasks(student) {
    const listEl = document.getElementById('student-tasks-full-list');
    if (!listEl) return;

    let tasks = store.getStudentTasks(student.id);
    const filter = window._currentTaskFilter || 'all';
    if (filter === 'pending') {
      tasks = tasks.filter(t => t.status === 'Pending');
    } else if (filter === 'completed') {
      tasks = tasks.filter(t => t.status === 'Completed');
    }

    const allCount = store.getStudentTasks(student.id).length;
    const pendingCount = store.getStudentTasks(student.id).filter(t => t.status === 'Pending').length;
    const completedCount = allCount - pendingCount;

    const countAllEl = document.getElementById('task-count-all');
    const countPendingEl = document.getElementById('task-count-pending');
    const countCompletedEl = document.getElementById('task-count-completed');
    if (countAllEl) countAllEl.textContent = allCount;
    if (countPendingEl) countPendingEl.textContent = pendingCount;
    if (countCompletedEl) countCompletedEl.textContent = completedCount;

    if (tasks.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state-card" style="padding: 30px;">
          <div class="empty-state-icon">✓</div>
          <div class="empty-state-title">No tasks found</div>
          <div class="empty-state-desc">There are no tasks matching the "${filter}" filter.</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = tasks.map(t => `
      <div class="task-item-card">
        <div class="task-checkbox-wrap">
          <button class="task-custom-checkbox ${t.status === 'Completed' ? 'checked' : ''}" onclick="toggleTaskStatus('${t.id}')" title="Mark as ${t.status === 'Completed' ? 'Pending' : 'Completed'}">
            ${t.status === 'Completed' ? '✓' : ''}
          </button>
        </div>
        <div class="task-content-col">
          <div class="task-title-text ${t.status === 'Completed' ? 'completed' : ''}">${t.title}</div>
          <div class="task-meta-row">
            <span><strong>Due:</strong> ${t.dueDate}</span>
            <span><strong>Assigned:</strong> ${t.assignedDate || '2026-10-08'}</span>
            <span class="badge-status ${t.priority === 'High' ? 'error' : t.priority === 'Medium' ? 'warning' : 'blue'}">${t.priority} Priority</span>
            <span class="badge-status ${t.status === 'Completed' ? 'success' : 'teal'}">${t.status}</span>
          </div>
          ${t.notes ? `<div style="margin-top: 6px; font-size: 12px; color: var(--text-secondary); background: #F8FAFC; padding: 6px 10px; border-radius: var(--radius-sm); border-left: 2px solid var(--primary-blue);"><strong>Mentor Note:</strong> ${t.notes}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

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


  // ========================================================================
  // GROUP PROJECTS & CAPSTONE HUB WORKFLOW CONTROLLERS
  // ========================================================================

  window._gpSelectedMembers = [];
  window._allEligibleStudents = [];
  window._subjectFacultyList = [];
  window._currentActiveProject = null;
  window._facultyReviewActiveProject = null;
  window._editingProjectId = null;

  window.openCreateGroupProjectModal = async function() {
    const modal = document.getElementById('modal-create-group-project');
    if (!modal) return;

    window._editingProjectId = null;
    const submitBtnText = document.getElementById('gp-submit-btn-text');
    if (submitBtnText) submitBtnText.textContent = 'Submit Proposal for Approval';

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
            data.subjects.map(s => `<option value="${s.subject}">${s.subject} (Supervised by ${s.faculty_name})</option>`).join('');
        }
        const mentorSelect = document.getElementById('gp-mentor');
        if (mentorSelect) {
          mentorSelect.innerHTML = '<option value="">No proposed mentor (Department assigned)</option>' +
            (data.faculty || []).map(f => `<option value="${f.id}">${f.full_name} (${f.department})</option>`).join('');
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
      badge.textContent = `${count} of 5 Members`;
      badge.className = (count >= 2 && count <= 5) ? 'badge-status success' : 'badge-status warning';
    }

    list.innerHTML = window._gpSelectedMembers.map(m => {
      const isLead = m.role === 'Leader';
      const initials = (m.student_name || 'ST').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #2563EB; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;">
              ${initials}
            </div>
            <div>
              <div style="font-size: 12.5px; font-weight: 600; color: #1E293B;">${m.student_name} ${m.isCreator ? '<span style="font-size: 10px; color: #2563EB;">(You)</span>' : ''}</div>
              <div style="font-size: 11px; color: #64748B;">${m.email} ${m.roll_no ? '&bull; ' + m.roll_no : ''}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <select class="form-select" style="padding: 3px 8px; font-size: 11px; width: 110px;" onchange="setTeamLeader('${m.student_id}')">
              <option value="Leader" ${isLead ? 'selected' : ''}>Leader</option>
              <option value="Member" ${!isLead ? 'selected' : ''}>Member</option>
            </select>
            ${!m.isCreator ? `
              <button type="button" style="border: none; background: none; color: #DC2626; cursor: pointer; padding: 2px 6px; font-size: 14px;" title="Remove student" onclick="removeTeamMember('${m.student_id}')">✕</button>
            ` : ''}
          </div>
        </div>
      `;
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
      hint.innerHTML = `Designated Reviewing Subject Faculty: <strong style="color: #0F172A;">${match.faculty_name}</strong> (${match.department})`;
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

    box.innerHTML = filtered.slice(0, 6).map(s => `
      <div style="padding: 8px 12px; border-bottom: 1px solid #F1F5F9; cursor: pointer; display: flex; justify-content: space-between; align-items: center;"
           onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='#FFFFFF'"
           onclick='selectEligibleStudent(${JSON.stringify({ id: s.id, full_name: s.full_name, email: s.email, roll_no: s.roll_no })})'>
        <div>
          <div style="font-size: 12.5px; font-weight: 600; color: #1E293B;">${s.full_name}</div>
          <div style="font-size: 11px; color: #64748B;">${s.email} &bull; ${s.roll_no || 'Student'}</div>
        </div>
        <span style="font-size: 11px; color: #2563EB; font-weight: 600;">+ Add</span>
      </div>
    `).join('');
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
          statusBox.textContent = `Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
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
      let res;
      if (window._editingProjectId) {
        res = await store.updateGroupProject(window._editingProjectId, payload);
        window._editingProjectId = null;
      } else {
        res = await store.createGroupProject(payload);
      }

      if (res && res.success) {
        window.showToast?.(res.message || 'Group project submitted successfully!', 'success');
        closeCreateGroupProjectModal();
        renderAllViews();
      } else {
        const errMsg = res?.error || 'Failed to submit group project.';
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

  window.promptResubmitProposal = async function(projectId) {
    closeProjectDetailsModal();
    await openCreateGroupProjectModal();
    const p = window._currentActiveProject;
    if (!p) return;

    window._editingProjectId = projectId;
    const titleInput = document.getElementById('gp-title');
    if (titleInput) titleInput.value = p.title || '';
    const subjectSelect = document.getElementById('gp-subject');
    if (subjectSelect) subjectSelect.value = p.subject || '';
    const domainSelect = document.getElementById('gp-domain');
    if (domainSelect) domainSelect.value = p.domain || '';
    const problemInput = document.getElementById('gp-problem-statement');
    if (problemInput) problemInput.value = p.problem_statement || '';
    const objInput = document.getElementById('gp-objectives');
    if (objInput) objInput.value = p.objectives || '';
    const descInput = document.getElementById('gp-description');
    if (descInput) descInput.value = p.description || '';
    const techInput = document.getElementById('gp-tech-stack');
    if (techInput) techInput.value = p.tech_stack || '';
    const delivInput = document.getElementById('gp-deliverables');
    if (delivInput) delivInput.value = p.deliverables || '';
    const teamInput = document.getElementById('gp-team-name');
    if (teamInput) teamInput.value = p.team_name || '';
    const targetInput = document.getElementById('gp-target-date');
    if (targetInput && p.target_date) targetInput.value = p.target_date;

    const submitBtnText = document.getElementById('gp-submit-btn-text');
    if (submitBtnText) submitBtnText.textContent = 'Resubmit Revised Proposal';
  };

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
      document.getElementById('pd-meta-subtitle').innerHTML = `Subject: <strong>${p.subject}</strong> &bull; Team: <strong>${p.team_name}</strong>`;

      const fbBanner = document.getElementById('pd-feedback-banner');
      if (fbBanner) {
        if (p.status === 'Changes Requested') {
          fbBanner.style.display = 'block';
          fbBanner.style.background = '#FFFBEB';
          fbBanner.style.border = '1px solid #FCD34D';
          fbBanner.style.color = '#92400E';
          fbBanner.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 4px;">✎ Revisions Requested by Subject Faculty</div>
            <div style="font-size: 12.5px; line-height: 1.45;">"${p.faculty_feedback || 'Please update your proposal scope and deliverables.'}"</div>
          `;
        } else if (p.status === 'Rejected') {
          fbBanner.style.display = 'block';
          fbBanner.style.background = '#FEF2F2';
          fbBanner.style.border = '1px solid #FCA5A5';
          fbBanner.style.color = '#991B1B';
          fbBanner.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 4px;">✕ Proposal Rejected</div>
            <div style="font-size: 12.5px; line-height: 1.45;">Reason: "${p.rejection_reason || 'Does not align with syllabus requirements.'}"</div>
          `;
        } else if (p.status === 'Approved' || p.status === 'Development in Progress') {
          fbBanner.style.display = 'block';
          fbBanner.style.background = '#F0FDF4';
          fbBanner.style.border = '1px solid #BBF7D0';
          fbBanner.style.color = '#166534';
          fbBanner.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 2px;">✓ Proposal Approved by Subject Faculty</div>
            <div style="font-size: 12px;">${p.faculty_feedback ? '"' + p.faculty_feedback + '"' : 'Team may proceed through scheduled development milestones.'}</div>
          `;
        } else {
          fbBanner.style.display = 'block';
          fbBanner.style.background = '#EFF6FF';
          fbBanner.style.border = '1px solid #BFDBFE';
          fbBanner.style.color = '#1E40AF';
          fbBanner.innerHTML = `
            <div style="font-weight: 600; font-size: 12.5px;">⏳ Proposal Submitted for Subject-Faculty Review</div>
            <div style="font-size: 11.5px; margin-top: 2px;">Designated reviewing faculty: <strong>${p.approver_name || 'Subject Faculty'}</strong></div>
          `;
        }
      }

      const pct = p.progress_pct || 0;
      document.getElementById('pd-progress-pct-text').textContent = pct + '%';
      document.getElementById('pd-progress-bar').style.width = pct + '%';
      document.getElementById('pd-current-milestone-text').textContent = 'Stage: ' + (p.current_milestone || '1. Problem definition and requirements');

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

      document.getElementById('pd-problem-statement').textContent = p.problem_statement || 'No problem statement recorded.';
      document.getElementById('pd-objectives').textContent = p.objectives || 'No objectives recorded.';

      const chipsContainer = document.getElementById('pd-tech-chips');
      if (chipsContainer) {
        const techList = (p.tech_stack || '').split(',').map(s => s.trim()).filter(Boolean);
        chipsContainer.innerHTML = techList.map(t => `<span class="skill-chip-pill" style="font-size: 11px; padding: 2px 8px;">${t}</span>`).join('');
      }

      document.getElementById('pd-dates-info').textContent = `Timeline: ${p.start_date || 'Started'} to ${p.target_date || 'Target'}`;
      const linksContainer = document.getElementById('pd-links-container');
      if (linksContainer) {
        linksContainer.innerHTML = '';
        if (p.proposal_doc_url) {
          linksContainer.innerHTML += `<a href="${p.proposal_doc_url}" target="_blank" class="sub-file-badge" style="font-size: 11px;">📄 Proposal PDF</a>`;
        }
        if (p.github_url) {
          linksContainer.innerHTML += `<a href="${p.github_url}" target="_blank" class="sub-file-badge" style="font-size: 11px;">GitHub Repo ↗</a>`;
        }
      }

      document.getElementById('pd-approver-name').textContent = p.approver_name || 'Pending Subject Assignment';
      document.getElementById('pd-mentor-name').textContent = p.mentor_name ? `${p.mentor_name} (${p.mentor_status || 'Assigned'})` : 'Not Assigned';

      const gradeBox = document.getElementById('pd-final-grade-box');
      if (gradeBox) {
        if (p.final_grade) {
          document.getElementById('pd-final-grade-text').textContent = `${p.final_grade} ${p.final_evaluation_notes ? '— ' + p.final_evaluation_notes : ''}`;
          gradeBox.style.display = 'block';
        } else {
          gradeBox.style.display = 'none';
        }
      }

      const rosterContainer = document.getElementById('pd-team-roster');
      if (rosterContainer) {
        const members = Array.isArray(p.members) ? p.members : [];
        rosterContainer.innerHTML = members.map(m => {
          const isLead = m.role === 'Leader' || m.student_id === p.leader_id;
          return `
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; padding: 4px 0; border-bottom: 1px solid #F1F5F9;">
              <div>
                <strong>${m.student_name}</strong>
                <div style="font-size: 10.5px; color: #64748B;">${m.email} ${m.roll_no ? '&bull; ' + m.roll_no : ''}</div>
              </div>
              <span class="badge-status ${isLead ? 'blue' : 'teal'}" style="font-size: 10px; padding: 2px 7px;">${isLead ? 'Leader' : 'Member'}</span>
            </div>
          `;
        }).join('');
      }

      const actLeft = document.getElementById('pd-action-left');
      if (actLeft) {
        actLeft.innerHTML = '';
        if (p.status === 'Changes Requested' || p.status === 'Draft') {
          actLeft.innerHTML = `
            <button type="button" class="btn-primary btn-sm" onclick="promptResubmitProposal('${p.id}')">
              ✎ Edit & Resubmit Proposal
            </button>
          `;
        }
      }

      const btnSubmitUpdate = document.getElementById('btn-open-submit-update');
      if (btnSubmitUpdate) {
        btnSubmitUpdate.style.display = (p.status === 'Approved' || p.status === 'Development in Progress') ? 'inline-flex' : 'none';
      }

      const timeline = document.getElementById('pd-updates-timeline');
      if (timeline) {
        const updates = Array.isArray(p.updates) ? p.updates : [];
        if (updates.length === 0) {
          timeline.innerHTML = `
            <div style="padding: 16px; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; text-align: center; font-size: 12px; color: #64748B;">
              No development updates recorded yet. Team members can post milestone progress once the proposal is approved.
            </div>
          `;
        } else {
          timeline.innerHTML = updates.map(u => `
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="badge-status teal" style="font-size: 11px;">${u.stage_milestone}</span>
                <span style="font-size: 11.5px; font-weight: 700; color: #0D9488;">${u.progress_pct}% Progress</span>
              </div>
              <div style="font-size: 12.5px; font-weight: 600; color: #1E293B; margin-bottom: 4px;">${u.summary}</div>
              ${u.tasks_completed ? `<div style="font-size: 11.5px; color: #334155; margin-bottom: 4px;"><strong>Completed:</strong> ${u.tasks_completed}</div>` : ''}
              ${u.tasks_remaining ? `<div style="font-size: 11.5px; color: #334155; margin-bottom: 4px;"><strong>Remaining:</strong> ${u.tasks_remaining}</div>` : ''}
              ${u.challenges_blockers ? `<div style="font-size: 11.5px; color: #DC2626; margin-bottom: 4px;"><strong>Blockers:</strong> ${u.challenges_blockers}</div>` : ''}
              ${u.github_url ? `<div style="margin-top: 6px;"><a href="${u.github_url}" target="_blank" class="sub-file-badge" style="font-size: 10.5px;">GitHub Code ↗</a></div>` : ''}
              ${u.faculty_feedback ? `
                <div style="margin-top: 8px; padding: 8px 10px; background: #F0FDF4; border-left: 3px solid #10B981; border-radius: 4px; font-size: 11.5px; color: #166534;">
                  <strong>Supervisor Guidance (${u.faculty_name || 'Faculty'}):</strong> ${u.faculty_feedback}
                </div>
              ` : ''}
              <div style="font-size: 10.5px; color: #94A3B8; margin-top: 6px; text-align: right;">
                Submitted by ${u.author_name} &bull; ${u.created_at}
              </div>
            </div>
          `).join('');
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
      document.getElementById('fpr-title').textContent = `Supervise Project: ${p.title}`;
      document.getElementById('fpr-summary-title').textContent = p.title;
      document.getElementById('fpr-subject-badge').textContent = p.subject;
      document.getElementById('fpr-status-badge').textContent = p.status;
      document.getElementById('fpr-team-lead').textContent = `Team: ${p.team_name} (${p.leader_name} - Lead)`;
      document.getElementById('fpr-summary-desc').textContent = p.description || p.problem_statement;

      const members = Array.isArray(p.members) ? p.members : [];
      document.getElementById('fpr-members-text').textContent = members.map(m => `${m.student_name} (${m.role})`).join(', ');
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

  // ========================================================================
  // ========================================================================
  // SUBMIT ASSIGNMENT & SUBMISSION DETAILS CONTROLLERS (Screenshots 1 & 2)
  // ========================================================================

  window._selectedSubmitFile = null;
  window._selectedReplaceFile = null;

  window.openSubmitAssignmentModal = async function(type, id) {
    if (!type || !id) return;
    const modal = document.getElementById('modal-submit-assignment');
    if (!modal) return;

    const res = await store.fetchRecordById(type, id);
    const item = res && res.data ? res.data : null;
    if (!item) {
      window.showToast?.('Record could not be retrieved', 'error');
      return;
    }

    const hiddenType = document.getElementById('submit-hidden-type');
    const hiddenId = document.getElementById('submit-hidden-id');
    if (hiddenType) hiddenType.value = type;
    if (hiddenId) hiddenId.value = id;

    const courseTagEl = document.getElementById('submit-asg-course-tag');
    if (courseTagEl) courseTagEl.textContent = (item.code || item.subject || item.department || 'COURSEWORK').toUpperCase();

    const titleEl = document.getElementById('submit-asg-title');
    if (titleEl) titleEl.textContent = `Submit: ${item.title || item.problemName || 'Assignment'}`;

    const instructorEl = document.getElementById('submit-asg-instructor');
    if (instructorEl) instructorEl.textContent = item.professor || item.verifiedBy || 'Dr. S. Rao';

    const dueEl = document.getElementById('submit-asg-due');
    if (dueEl) dueEl.textContent = item.dueDate || item.date || 'Flexible';

    const pointsEl = document.getElementById('submit-asg-points');
    if (pointsEl) pointsEl.textContent = `${item.maxMarks || 50} pts`;

    const notesEl = document.getElementById('submit-student-notes');
    if (notesEl) notesEl.value = item.studentRemarks || item.studentNotes || '';

    window._selectedSubmitFile = null;
    const fileContainer = document.getElementById('submit-selected-file-container');
    if (fileContainer) {
      fileContainer.style.display = 'none';
      fileContainer.innerHTML = '';
    }
    const errEl = document.getElementById('submit-upload-error');
    if (errEl) errEl.style.display = 'none';

    const submitBtn = document.getElementById('btn-submit-assignment-action');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Assignment';
    }

    modal.classList.add('active');
    modal.style.display = 'flex';
  };

  window.closeSubmitAssignmentModal = function() {
    const modal = document.getElementById('modal-submit-assignment');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
    window._selectedSubmitFile = null;
  };

  window.openSubmissionDetailsModal = async function(type, id) {
    if (!type || !id) return;
    const modal = document.getElementById('modal-submission-details');
    if (!modal) return;

    const res = await store.fetchRecordById(type, id);
    const item = res && res.data ? res.data : null;
    if (!item) {
      window.showToast?.('Record could not be retrieved', 'error');
      return;
    }

    const hiddenType = document.getElementById('sub-detail-hidden-type');
    const hiddenId = document.getElementById('sub-detail-hidden-id');
    if (hiddenType) hiddenType.value = type;
    if (hiddenId) hiddenId.value = id;

    const courseTagEl = document.getElementById('sub-detail-course-tag');
    if (courseTagEl) courseTagEl.textContent = (item.code || item.subject || item.department || 'COURSEWORK').toUpperCase();

    const titleEl = document.getElementById('sub-detail-title');
    if (titleEl) titleEl.textContent = `Submission Details: ${item.title || item.problemName || 'Problem Set'}`;

    const instructorEl = document.getElementById('sub-detail-instructor');
    if (instructorEl) instructorEl.textContent = item.professor || item.verifiedBy || 'Dr. S. Rao';

    const dueEl = document.getElementById('sub-detail-due');
    if (dueEl) dueEl.textContent = item.dueDate || item.date || 'Flexible';

    const pointsEl = document.getElementById('sub-detail-points');
    if (pointsEl) pointsEl.textContent = `${item.maxMarks || 100} pts`;

    const statusBadge = document.getElementById('sub-detail-status-badge');
    const evaluatedBox = document.getElementById('sub-detail-evaluated-box');
    const scoreEl = document.getElementById('sub-detail-awarded-score');
    const feedbackQuote = document.getElementById('sub-detail-feedback-quote');
    const feedbackExtra = document.getElementById('sub-detail-feedback-extra');

    const isGraded = item.status === 'Graded' || item.studentStatus === 'Graded';
    const isRevision = item.status === 'Revision Requested' || item.studentStatus === 'Revision Requested';
    const isSubmitted = item.status === 'Submitted' || item.studentStatus === 'Submitted';

    if (isGraded) {
      if (statusBadge) {
        statusBadge.textContent = 'Graded';
        statusBadge.style.background = '#065F46';
        statusBadge.style.color = '#FFFFFF';
      }
      if (evaluatedBox) {
        evaluatedBox.style.display = 'block';
        evaluatedBox.style.background = '#ECFDF5';
        evaluatedBox.style.borderColor = '#A7F3D0';
      }
      if (scoreEl) scoreEl.textContent = item.marks ? `${item.marks} pts` : `${item.studentMarks || 46} / ${item.maxMarks || 50} pts`;
      if (feedbackQuote) feedbackQuote.textContent = `"${item.feedback || 'Good database design. Pay closer attention to composite primary keys.'}"`;
      if (feedbackExtra) {
        let extra = '';
        if (item.strengths) extra += `<div><strong>Strengths:</strong> ${item.strengths}</div>`;
        if (item.improvements) extra += `<div style="margin-top: 3px;"><strong>Areas for Improvement:</strong> ${item.improvements}</div>`;
        if (item.nextSteps) extra += `<div style="margin-top: 3px;"><strong>Next Steps:</strong> ${item.nextSteps}</div>`;
        if (extra) {
          feedbackExtra.innerHTML = extra;
          feedbackExtra.style.display = 'block';
        } else {
          feedbackExtra.style.display = 'none';
        }
      }
    } else if (isRevision) {
      if (statusBadge) {
        statusBadge.textContent = 'Revision Requested';
        statusBadge.style.background = '#D97706';
        statusBadge.style.color = '#FFFFFF';
      }
      if (evaluatedBox) {
        evaluatedBox.style.display = 'block';
        evaluatedBox.style.background = '#FFFBEB';
        evaluatedBox.style.borderColor = '#FDE68A';
      }
      if (scoreEl) scoreEl.textContent = `Revision Required`;
      if (feedbackQuote) feedbackQuote.textContent = `"${item.feedback || 'Please address the instructor feedback and resubmit your updated files.'}"`;
      if (feedbackExtra) feedbackExtra.style.display = 'none';
    } else {
      if (statusBadge) {
        statusBadge.textContent = isSubmitted ? 'Submitted' : 'Pending Evaluation';
        statusBadge.style.background = '#2563EB';
        statusBadge.style.color = '#FFFFFF';
      }
      if (evaluatedBox) evaluatedBox.style.display = 'none';
    }

    const fileLink = document.getElementById('sub-detail-file-link');
    const fileNameEl = document.getElementById('sub-detail-file-name');
    let displayFileName = 'frame_008.png';
    let fileUrl = '#';

    if (item.submittedFile && item.submittedFile.originalName) {
      displayFileName = item.submittedFile.originalName;
      fileUrl = item.submittedFile.downloadUrl || '#';
    } else if (item.submissionUrl && item.submissionUrl.length > 0) {
      displayFileName = item.submissionUrl.split('/').pop() || 'submission_artifact.pdf';
      fileUrl = item.submissionUrl;
    }

    if (fileNameEl) fileNameEl.textContent = displayFileName;
    if (fileLink) {
      fileLink.href = fileUrl;
      fileLink.setAttribute('download', displayFileName);
    }

    const remarksEl = document.getElementById('sub-detail-remarks-box');
    if (remarksEl) {
      remarksEl.textContent = `"${item.studentRemarks || item.studentNotes || 'Alex Kumar solution to Problem Set 7.'}"`;
    }

    const replaceNotesEl = document.getElementById('sub-detail-replace-notes');
    if (replaceNotesEl) replaceNotesEl.value = item.studentRemarks || item.studentNotes || '';

    window._selectedReplaceFile = null;
    const repContainer = document.getElementById('sub-detail-replace-file-container');
    if (repContainer) {
      repContainer.style.display = 'none';
      repContainer.innerHTML = '';
    }

    modal.classList.add('active');
    modal.style.display = 'flex';
  };

  window.closeSubmissionDetailsModal = function() {
    const modal = document.getElementById('modal-submission-details');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
    window._selectedReplaceFile = null;
  };

  window.clearSelectedUpload = function(target) {
    if (target === 'submit') {
      window._selectedSubmitFile = null;
      const fileInput = document.getElementById('submit-file-input');
      if (fileInput) fileInput.value = '';
      const c = document.getElementById('submit-selected-file-container');
      if (c) c.style.display = 'none';
    } else {
      window._selectedReplaceFile = null;
      const fileInput = document.getElementById('sub-detail-replace-file-input');
      if (fileInput) fileInput.value = '';
      const c = document.getElementById('sub-detail-replace-file-container');
      if (c) c.style.display = 'none';
    }
  };

  function handleFileChosen(file, target) {
    const errorEl = document.getElementById(target === 'submit' ? 'submit-upload-error' : 'sub-detail-replace-error');
    const containerEl = document.getElementById(target === 'submit' ? 'submit-selected-file-container' : 'sub-detail-replace-file-container');

    if (errorEl) errorEl.style.display = 'none';

    if (file.size > 25 * 1024 * 1024) {
      if (errorEl) {
        errorEl.textContent = 'Selected file exceeds maximum limit of 25MB. Please choose a smaller file or compressed archive.';
        errorEl.style.display = 'block';
      }
      return;
    }

    const formattedSize = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    if (target === 'submit') {
      window._selectedSubmitFile = file;
    } else {
      window._selectedReplaceFile = file;
    }

    if (containerEl) {
      const isPdf = (file.name || '').endsWith('.pdf');
      const isZip = (file.name || '').endsWith('.zip');
      containerEl.innerHTML = `
        <div class="upload-selected-file-item">
          <div class="upload-selected-file-info">
            <span style="font-size: 18px;">${isPdf ? '📕' : isZip ? '📦' : '📄'}</span>
            <div>
              <strong style="color: #0F172A; font-size: 13px;">${file.name}</strong>
              <div style="font-size: 11px; color: #64748B;">${formattedSize} ${file.isFolder ? `(${file.folderFilesCount} files included)` : ''} • Ready for upload</div>
            </div>
          </div>
          <button type="button" class="btn-outline btn-sm" style="color: #DC2626; border-color: #FCA5A5; padding: 2px 8px; font-size: 11px;" onclick="clearSelectedUpload('${target}')">✕ Remove</button>
        </div>
      `;
      containerEl.style.display = 'block';
    }
  }

  function setupModalFileUploads() {
    const dropzone = document.getElementById('submit-dropzone');
    const fileInput = document.getElementById('submit-file-input');
    const folderInput = document.getElementById('submit-folder-input');

    if (dropzone && fileInput) {
      ['dragenter', 'dragover'].forEach(evt => {
        dropzone.addEventListener(evt, e => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(evt => {
        dropzone.addEventListener(evt, e => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
        });
      });

      dropzone.addEventListener('drop', e => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFileChosen(e.dataTransfer.files[0], 'submit');
        }
      });

      fileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files.length > 0) {
          handleFileChosen(e.target.files[0], 'submit');
        }
      });
    }

    if (folderInput) {
      folderInput.addEventListener('change', e => {
        if (e.target.files && e.target.files.length > 0) {
          const files = Array.from(e.target.files);
          const totalSize = files.reduce((acc, f) => acc + f.size, 0);
          handleFileChosen({
            name: `${files[0].webkitRelativePath.split('/')[0] || 'project_folder'}.zip`,
            size: totalSize,
            type: 'application/zip',
            isFolder: true,
            folderFilesCount: files.length
          }, 'submit');
        }
      });
    }

    const replaceDropzone = document.getElementById('sub-detail-replace-dropzone');
    const replaceFileInput = document.getElementById('sub-detail-replace-file-input');

    if (replaceDropzone && replaceFileInput) {
      ['dragenter', 'dragover'].forEach(evt => {
        replaceDropzone.addEventListener(evt, e => {
          e.preventDefault();
          replaceDropzone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(evt => {
        replaceDropzone.addEventListener(evt, e => {
          e.preventDefault();
          replaceDropzone.classList.remove('dragover');
        });
      });

      replaceDropzone.addEventListener('drop', e => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFileChosen(e.dataTransfer.files[0], 'replace');
        }
      });

      replaceFileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files.length > 0) {
          handleFileChosen(e.target.files[0], 'replace');
        }
      });
    }
  }

  window.handleSubmitAssignmentAction = async function() {
    const type = document.getElementById('submit-hidden-type').value;
    const id = document.getElementById('submit-hidden-id').value;
    const notes = document.getElementById('submit-student-notes').value;
    const btn = document.getElementById('btn-submit-assignment-action');

    btn.disabled = true;
    btn.textContent = 'Uploading & Submitting...';

    let uploadedFile = null;

    if (window._selectedSubmitFile) {
      const file = window._selectedSubmitFile;
      let base64 = '';
      if (file instanceof File || file instanceof Blob) {
        base64 = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      } else {
        base64 = 'data:application/zip;base64,' + btoa('PK\x03\x04ProjectArchivePayload');
      }

      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type || 'application/octet-stream',
            fileData: base64
          })
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success && uploadJson.file) {
          uploadedFile = uploadJson.file;
        }
      } catch (err) {
        console.warn('Upload error:', err);
      }
    }

    await store.submitAssignment(type, id, {
      notes,
      file: uploadedFile,
      submissionUrl: uploadedFile ? uploadedFile.downloadUrl : (notes.includes('http') ? notes : '')
    });

    window.showToast?.('✓ Assignment submitted successfully!', 'success');
    closeSubmitAssignmentModal();

    renderStudentAssignments(store.data.roles.student);
    if (typeof renderStudentViews === 'function') renderStudentViews();
    if (typeof renderFacultySubmissionsQueue === 'function') renderFacultySubmissionsQueue();
  };

  window.handleUpdateSubmissionAction = async function() {
    const type = document.getElementById('sub-detail-hidden-type').value;
    const id = document.getElementById('sub-detail-hidden-id').value;
    const notes = document.getElementById('sub-detail-replace-notes').value;
    const btn = document.getElementById('btn-sub-detail-update-action');

    btn.disabled = true;
    btn.textContent = 'Updating...';

    let uploadedFile = null;

    if (window._selectedReplaceFile) {
      const file = window._selectedReplaceFile;
      let base64 = '';
      if (file instanceof File || file instanceof Blob) {
        base64 = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      }

      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type || 'application/octet-stream',
            fileData: base64
          })
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success && uploadJson.file) {
          uploadedFile = uploadJson.file;
        }
      } catch (err) {
        console.warn('Replace upload error:', err);
      }
    }

    await store.submitAssignment(type, id, {
      notes,
      file: uploadedFile,
      submissionUrl: uploadedFile ? uploadedFile.downloadUrl : ''
    });

    window.showToast?.('✓ Submission and notes updated!', 'success');
    closeSubmissionDetailsModal();

    renderStudentAssignments(store.data.roles.student);
    if (typeof renderStudentViews === 'function') renderStudentViews();
    if (typeof renderFacultySubmissionsQueue === 'function') renderFacultySubmissionsQueue();
  };

  // SHARED RECORD DETAILS CONTROLLER (Faculty, Lab, Learning, Practice)
  // ========================================================================

  window._recordFetchSeq = 0;
  window._currentDetailRecord = null;
  window._currentDetailType = null;
  window._currentDetailId = null;

  window.closeRecordDetailsModal = function(options = {}) {
    const modal = document.getElementById('modal-record-details');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
    if (options.updateHash !== false && window._currentDetailType) {
      const cleanPath = `/student/assignments/${window._currentDetailType}`;
      if (window.location.hash.includes('?id=') || window.location.hash.match(/\/student\/assignments\/(faculty|lab|learning|practice)\//)) {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#' + cleanPath);
        } else {
          window.location.hash = cleanPath;
        }
      }
    }
    window._currentDetailRecord = null;
    window._currentDetailType = null;
    window._currentDetailId = null;
  };

  window.retryCurrentRecordFetch = function() {
    if (window._currentDetailType && window._currentDetailId) {
      openRecordDetailsModal(window._currentDetailType, window._currentDetailId, { bypassCache: true });
    }
  };

  window.openRecordDetailsModal = async function(type, id, options = {}) {
    if (!type || !id) return;
    const modal = document.getElementById('modal-record-details');
    if (!modal) return;

    window._currentDetailType = type;
    window._currentDetailId = id;

    // Synchronize hash URL for direct-linking and browser history
    if (options.updateHash !== false) {
      const newHash = `/student/assignments/${type}?id=${id}`;
      if (window.location.hash !== '#' + newHash) {
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', '#' + newHash);
        } else {
          window.location.hash = newHash;
        }
      }
    }

    const titleEl = document.getElementById('record-detail-title');
    const typeBadge = document.getElementById('record-detail-type-badge');
    const statusBadge = document.getElementById('record-detail-status-badge');
    const loadingEl = document.getElementById('record-detail-loading');
    const errorEl = document.getElementById('record-detail-error');
    const containerEl = document.getElementById('record-detail-container');
    const actionsEl = document.getElementById('record-detail-actions');

    const typeLabels = {
      faculty: 'Faculty Coursework Assignment',
      lab: 'Laboratory Practical Assignment',
      learning: 'Verified Learning Credential',
      practice: 'Coding Practice Problem'
    };

    if (typeBadge) typeBadge.textContent = typeLabels[type] || 'Academic Record';
    if (statusBadge) {
      statusBadge.textContent = 'Loading...';
      statusBadge.className = 'badge-status blue';
    }
    if (titleEl) titleEl.textContent = 'Retrieving record details...';

    // Show modal immediately with loading state (no waiting for response)
    modal.classList.add('active');
    modal.style.display = 'flex';
    if (loadingEl) loadingEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
    if (containerEl) {
      containerEl.style.display = 'none';
      containerEl.innerHTML = '';
    }
    if (actionsEl) actionsEl.innerHTML = '';

    const fetchSeq = ++window._recordFetchSeq;

    // Asynchronously fetch single record with deduplication, in-memory cache, and fallback
    const res = await store.fetchRecordById(type, id, {
      bypassCache: options.bypassCache || false,
      timeoutMs: 4000
    });

    // Stale-response guard: if the user rapidly clicked another record in the interim, ignore
    if (fetchSeq !== window._recordFetchSeq) {
      return;
    }

    if (loadingEl) loadingEl.style.display = 'none';

    if (!res || !res.success || !res.data) {
      if (errorEl) {
        errorEl.style.display = 'block';
        const errTitle = document.getElementById('record-detail-error-title');
        const errDesc = document.getElementById('record-detail-error-msg');
        if (errTitle) errTitle.textContent = 'Record Not Found';
        if (errDesc) errDesc.textContent = res?.error || `The requested record with identifier "${id}" does not exist or has been removed.`;
      }
      if (statusBadge) {
        statusBadge.textContent = 'Not Found';
        statusBadge.className = 'badge-status error';
      }
      if (titleEl) titleEl.textContent = 'Record Unavailable';
      return;
    }

    const item = res.data;
    window._currentDetailRecord = item;

    // Render record details into content view
    renderRecordDetailContent(type, item);
  };

  function renderRecordDetailContent(type, item) {
    const titleEl = document.getElementById('record-detail-title');
    const typeBadge = document.getElementById('record-detail-type-badge');
    const statusBadge = document.getElementById('record-detail-status-badge');
    const containerEl = document.getElementById('record-detail-container');
    const actionsEl = document.getElementById('record-detail-actions');

    if (!containerEl) return;
    containerEl.style.display = 'block';

    if (type === 'faculty') {
      if (titleEl) titleEl.textContent = item.title;
      if (typeBadge) {
        typeBadge.textContent = item.category || 'Faculty Assignment';
        typeBadge.className = 'badge-status blue';
      }
      if (statusBadge) {
        const isGraded = item.status === 'Graded' || item.studentStatus === 'Graded';
        statusBadge.textContent = isGraded ? 'Graded ✓' : (item.status || 'Active');
        statusBadge.className = `badge-status ${isGraded ? 'success' : 'warning'}`;
      }

      const scoreDisplay = item.studentMarks != null ? `${item.studentMarks} / ${item.maxMarks}` : (item.marks || 'Pending');
      const hasSubmission = item.submissionUrl && item.submissionUrl.length > 0;

      containerEl.innerHTML = `
        <div class="record-detail-grid-2">
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Subject &amp; Department</div>
            <div class="record-detail-item-value">${item.subject}</div>
          </div>
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Assigned By Professor</div>
            <div class="record-detail-item-value">${item.professor} <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">(${item.department})</span></div>
          </div>
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Submission Deadline</div>
            <div class="record-detail-item-value">${item.dueDate} ${item.dueTime || '23:59'} <span class="badge-status ${item.priority === 'High' ? 'error' : 'blue'}" style="margin-left: 4px; font-size: 10px;">${item.priority || 'Medium'}</span></div>
          </div>
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Score &amp; Marks</div>
            <div class="record-detail-item-value" style="color: ${item.studentMarks != null ? 'var(--success-green)' : 'inherit'};">${scoreDisplay}</div>
          </div>
        </div>

        <div class="record-detail-card">
          <div class="record-detail-section-title">
            <span>📋</span> Instructions &amp; Deliverables
          </div>
          <div class="record-detail-text-box">
            ${item.instructions || item.description || 'Complete the assignment deliverables according to departmental academic syllabus guidelines.'}
          </div>

          ${item.feedback ? `
            <div class="record-detail-section-title" style="margin-top: 10px;">
              <span>💬</span> Faculty Evaluation &amp; Feedback
            </div>
            <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: var(--radius-sm); padding: 10px 12px; font-size: 12.5px; color: #166534; line-height: 1.5;">
              <strong>Mentor Feedback:</strong> ${item.feedback}
            </div>
          ` : ''}

          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 12px; color: var(--text-secondary);">
              Target Cohort: <strong>${item.targetClass || 'CSE Final Year - Class of 2026'}</strong>
              ${item.submittedDate ? ` • Submitted on: <strong>${item.submittedDate}</strong>` : ''}
            </span>
            ${hasSubmission ? `
              <a href="${item.submissionUrl}" target="_blank" class="btn-outline btn-sm" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                <span>View Submitted Artifact</span> ↗
              </a>
            ` : ''}
          </div>
        </div>
      `;

      if (actionsEl) {
        actionsEl.innerHTML = `
          <button class="btn-primary btn-sm" onclick="closeRecordDetailsModal(); openSubmitAssignmentModal('faculty', '${item.id}');">
            ${hasSubmission ? 'Update Submission' : 'Submit Assignment'}
          </button>
        `;
      }
    } else if (type === 'lab') {
      if (titleEl) titleEl.textContent = `${item.code}: ${item.title}`;
      if (typeBadge) {
        typeBadge.textContent = 'Lab Practical Coursework';
        typeBadge.className = 'badge-status blue';
      }
      if (statusBadge) {
        const isGraded = item.status === 'Graded' || item.status === 'Evaluated';
        statusBadge.textContent = isGraded ? 'Graded ✓' : item.status;
        statusBadge.className = `badge-status ${isGraded ? 'success' : item.status === 'Submitted' ? 'teal' : 'warning'}`;
      }

      containerEl.innerHTML = `
        <div class="record-detail-grid-2">
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Subject &amp; Lab Code</div>
            <div class="record-detail-item-value">${item.code} • ${item.subject}</div>
          </div>
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Scheduled Due Date</div>
            <div class="record-detail-item-value">${item.dueDate}</div>
          </div>
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Evaluation Status</div>
            <div class="record-detail-item-value"><span class="badge-status ${item.status === 'Graded' ? 'success' : 'teal'}">${item.status}</span></div>
          </div>
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Awarded Score</div>
            <div class="record-detail-item-value" style="color: var(--success-green);">${item.grade || 'Pending'}</div>
          </div>
        </div>

        <div class="record-detail-card">
          <div class="record-detail-section-title">
            <span>🔬</span> Laboratory Problem Statement &amp; Execution
          </div>
          <div class="record-detail-text-box">
            ${item.instructions || 'Execute the lab experiment on your departmental workstation. Verify unit tests and commit code to your student repository.'}
          </div>

          <div class="record-detail-section-title" style="margin-top: 10px;">
            <span>📐</span> Departmental Evaluation Rubric
          </div>
          <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 12px; color: #475569; line-height: 1.5;">
            ${item.rubric || 'Implementation (40%), Test Suite Pass Rate (30%), Code Quality & Documentation (30%)'}
          </div>

          ${item.equipment ? `
            <div style="margin-top: 10px; font-size: 11.5px; color: var(--text-secondary);">
              <strong>Environment / Tools:</strong> <code>${item.equipment}</code>
            </div>
          ` : ''}

          ${item.submissionUrl ? `
            <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 12px; color: var(--text-secondary);">Submitted GitHub Repository:</span>
              <a href="${item.submissionUrl}" target="_blank" class="btn-outline btn-sm" style="text-decoration: none;">View Code Repository ↗</a>
            </div>
          ` : ''}
        </div>
      `;

      if (actionsEl) {
        actionsEl.innerHTML = `
          <button class="btn-primary btn-sm" onclick="closeRecordDetailsModal(); openSubmitAssignmentModal('lab', '${item.id}');">
            ${item.submissionUrl ? 'Update Lab Submission' : 'Submit Lab Solution'}
          </button>
        `;
      }
    } else if (type === 'learning') {
      if (titleEl) titleEl.textContent = item.title;
      if (typeBadge) {
        typeBadge.textContent = item.category || 'Learning Credential';
        typeBadge.className = 'badge-status teal';
      }
      if (statusBadge) {
        statusBadge.textContent = 'Verified Credential ✓';
        statusBadge.className = 'badge-status success';
      }

      const skillsList = (item.skills || []).map(s => `
        <span style="font-size: 11.5px; background: #EFF6FF; color: #2563EB; padding: 3px 10px; border-radius: 4px; font-weight: 500;">${s}</span>
      `).join('');

      const modulesList = (item.syllabusModules || item.skills || []).map(m => `
        <li style="margin-bottom: 4px; color: #334155;">${m}</li>
      `).join('');

      containerEl.innerHTML = `
        <div class="record-detail-grid-2">
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Accrediting Authority</div>
            <div class="record-detail-item-value">${item.verifiedBy}</div>
          </div>
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Verified Study Hours</div>
            <div class="record-detail-item-value">${item.hoursLogged} Accredited Hours</div>
          </div>
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Completion Period</div>
            <div class="record-detail-item-value">${item.completionDate}</div>
          </div>
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Evaluation Grade</div>
            <div class="record-detail-item-value" style="color: var(--success-green);">${item.grade}</div>
          </div>
        </div>

        <div class="record-detail-card">
          <div class="record-detail-section-title">
            <span>🎓</span> Accredited Syllabus Modules
          </div>
          <ul style="padding-left: 20px; font-size: 12.5px; line-height: 1.6; margin-bottom: 12px;">
            ${modulesList}
          </ul>

          <div class="record-detail-section-title">
            <span>🏷️</span> Skills Mastered
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
            ${skillsList}
          </div>

          <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11.5px; color: var(--text-secondary);">Credential ID: <code>${item.credentialId}</code></span>
            <span class="badge-status teal" style="font-size: 10.5px;">Cryptographically Verified</span>
          </div>
        </div>
      `;

      if (actionsEl) {
        actionsEl.innerHTML = `
          <button class="btn-primary btn-sm" onclick="closeRecordDetailsModal(); openSubmitAssignmentModal('learning', '${item.id}');">
            Upload Learning Credential
          </button>
        `;
      }
    } else if (type === 'practice') {
      if (titleEl) titleEl.textContent = item.problemName;
      if (typeBadge) {
        typeBadge.textContent = `${item.platform} Practice`;
        typeBadge.className = 'badge-status blue';
      }
      if (statusBadge) {
        statusBadge.textContent = item.status || 'Accepted ✓';
        statusBadge.className = 'badge-status success';
      }

      containerEl.innerHTML = `
        <div class="record-detail-grid-2">
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Problem Difficulty</div>
            <div class="record-detail-item-value"><span class="badge-status ${item.difficulty === 'Easy' ? 'teal' : item.difficulty === 'Medium' ? 'warning' : 'error'}">${item.difficulty}</span></div>
          </div>
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Algorithm Category</div>
            <div class="record-detail-item-value">${item.category}</div>
          </div>
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Asymptotic Complexity</div>
            <div class="record-detail-item-value"><code>Time: ${item.timeComplexity}</code> • <code>Space: ${item.spaceComplexity}</code></div>
          </div>
          <div class="record-detail-grid-item">
            <div class="record-detail-item-label">Solved Time &amp; Date</div>
            <div class="record-detail-item-value">${item.timeTaken || '15 mins'} <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">(${item.date})</span></div>
          </div>
        </div>

        <div class="record-detail-card">
          <div class="record-detail-section-title">
            <span>⚡</span> Execution &amp; Benchmark Metrics
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div style="background: #FFFFFF; border: 1px solid var(--border-subtle); padding: 8px 10px; border-radius: 6px; text-align: center;">
              <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Test Cases</div>
              <div style="font-size: 13px; font-weight: 700; color: var(--success-green);">${item.testCasesPassed || 'All Passed'}</div>
            </div>
            <div style="background: #FFFFFF; border: 1px solid var(--border-subtle); padding: 8px 10px; border-radius: 6px; text-align: center;">
              <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Runtime</div>
              <div style="font-size: 13px; font-weight: 700; color: var(--primary-blue);">${item.runtimePercentile || 'Top 10%'}</div>
            </div>
            <div style="background: #FFFFFF; border: 1px solid var(--border-subtle); padding: 8px 10px; border-radius: 6px; text-align: center;">
              <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Memory</div>
              <div style="font-size: 13px; font-weight: 700; color: var(--teal-accent);">${item.memoryPercentile || 'Optimal'}</div>
            </div>
          </div>

          <div class="record-detail-section-title">
            <span>📝</span> Problem Statement
          </div>
          <div class="record-detail-text-box">
            ${item.problemDescription || 'Algorithmic problem practice logged for technical recruitment readiness.'}
          </div>
        </div>
      `;

      if (actionsEl) {
        actionsEl.innerHTML = `
          <button class="btn-primary btn-sm" onclick="closeRecordDetailsModal(); openSubmitAssignmentModal('practice', '${item.id}');">
            Submit Solution Code
          </button>
        `;
      }
    }
  }

  function renderStudentAssignments(student) {
    // 1. Lab Assignments
    const labsList = document.getElementById('student-lab-assignments-list');
    if (labsList) {
      const labs = store.getLabAssignments();
      labsList.innerHTML = labs.map(lab => {
        const isGraded = lab.studentStatus === 'Graded' || lab.studentStatus === 'Evaluated' || (lab.status === 'Graded' && lab.studentStatus && lab.studentStatus !== 'Assigned');
        const isSubmitted = lab.studentStatus === 'Submitted' || (lab.status === 'Submitted' && lab.studentStatus && lab.studentStatus !== 'Assigned');

        return `
          <div class="assignment-card-box">
            <div class="assignment-card-header">
              <div>
                <span class="badge-status blue" style="font-size: 11px; margin-right: 6px;">${lab.code}</span>
                <span style="font-size: 12px; color: var(--text-secondary);">${lab.subject}</span>
                <h3 style="font-size: 15px; font-weight: 700; color: #0F172A; margin-top: 4px;">${lab.title}</h3>
              </div>
              <div style="text-align: right;">
                <span class="badge-status ${isGraded ? 'success' : isSubmitted ? 'teal' : 'warning'}">${isGraded ? 'Graded ✓' : isSubmitted ? 'Submitted' : 'Not Started'}</span>
                <div style="font-size: 12px; font-weight: 700; color: #0F172A; margin-top: 4px;">${lab.grade || 'Pending'}</div>
              </div>
            </div>
            <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 8px 12px; font-size: 12px; color: var(--text-secondary);">
              <strong>Evaluation Rubric:</strong> ${lab.rubric || 'Practical implementation and report accuracy.'}
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-top: 4px;">
              <span style="font-size: 12px; color: var(--text-muted);">Due Date: <strong>${lab.dueDate}</strong></span>
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <button class="btn-outline btn-sm" onclick="openSubmissionDetailsModal('lab', '${lab.id}')">View Details</button>
                <button class="btn-primary btn-sm" onclick="openSubmitAssignmentModal('lab', '${lab.id}')">${isSubmitted || isGraded ? 'Replace Submission' : 'Submit Solution'}</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. Learning Records
    const learningList = document.getElementById('student-learning-records-list');
    if (learningList) {
      const records = store.getLearningRecords();
      learningList.innerHTML = records.map(rec => {
        const isVerified = rec.status === 'Verified' || rec.status === 'Graded' || !rec.status;
        return `
          <div class="assignment-card-box">
            <div class="assignment-card-header">
              <div>
                <span class="badge-status teal" style="font-size: 11px; margin-right: 6px;">${rec.category}</span>
                <span style="font-size: 12px; color: var(--text-secondary);">Verified by: <strong>${rec.verifiedBy}</strong></span>
                <h3 style="font-size: 15px; font-weight: 700; color: #0F172A; margin-top: 4px;">${rec.title}</h3>
              </div>
              <div style="text-align: right;">
                <span class="badge-status success">${isVerified ? 'Verified Record ✓' : rec.status}</span>
                <div style="font-size: 13px; font-weight: 700; color: var(--success-green); margin-top: 4px;">Grade: ${rec.grade || 'A'}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 12px; color: var(--text-secondary);">
              <span>Hours Logged: <strong>${rec.hoursLogged} Study Hours</strong></span>
              <span>Completed: <strong>${rec.completionDate}</strong></span>
              <span>Credential ID: <code>${rec.credentialId}</code></span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--border-subtle);">
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${(rec.skills || []).map(s => `<span style="font-size: 11px; background: #EFF6FF; color: #2563EB; padding: 2px 8px; border-radius: 4px; font-weight: 500;">${s}</span>`).join('')}
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <button class="btn-outline btn-sm" onclick="openSubmissionDetailsModal('learning', '${rec.id}')">View Details</button>
                <button class="btn-outline btn-sm" onclick="openSubmitAssignmentModal('learning', '${rec.id}')">Upload Credential</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Practice Records
    const practiceList = document.getElementById('student-practice-records-list');
    if (practiceList) {
      const practice = store.getPracticeRecords();
      practiceList.innerHTML = practice.map(pr => `
        <div class="assignment-card-box" style="padding: 12px 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="badge-status blue" style="font-size: 11px;">${pr.platform}</span>
              <div>
                <strong style="font-size: 13.5px; color: #0F172A;">${pr.problemName}</strong>
                <div style="font-size: 11.5px; color: var(--text-secondary);">${pr.category} • Complexity: ${pr.timeComplexity}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="badge-status ${pr.difficulty === 'Easy' ? 'teal' : pr.difficulty === 'Medium' ? 'warning' : 'error'}">${pr.difficulty}</span>
              <span class="badge-status success">${pr.status || 'Accepted'}</span>
              <span style="font-size: 11.5px; color: var(--text-muted);">${pr.date}</span>
              <button class="btn-outline btn-sm" style="font-size: 11.5px; padding: 3px 10px;" onclick="openSubmissionDetailsModal('practice', '${pr.id}')">View Details</button>
              <button class="btn-primary btn-sm" style="font-size: 11.5px; padding: 3px 10px;" onclick="openSubmitAssignmentModal('practice', '${pr.id}')">Submit Solution</button>
            </div>
          </div>
        </div>
      `).join('');
    }

    // 4. Faculty Assignments
    const facultyList = document.getElementById('student-faculty-assignments-list');
    if (facultyList) {
      const fa = store.getFacultyAssignments();
      facultyList.innerHTML = fa.map(f => {
        const isGraded = f.studentStatus === 'Graded' || (f.status === 'Graded' && f.studentStatus !== 'Assigned');
        const isRevision = f.studentStatus === 'Revision Requested' || Boolean(f.isRevisionRequested) || (f.status === 'Revision Requested' && f.studentStatus !== 'Assigned');
        const isSubmitted = f.studentStatus === 'Submitted' || (f.status === 'Submitted' && f.studentStatus !== 'Assigned');

        let statusBadgeClass = 'blue';
        let statusText = f.studentStatus || 'Assigned';

        if (isGraded) {
          statusBadgeClass = 'success';
          statusText = 'Graded ✓';
        } else if (isRevision) {
          statusBadgeClass = 'warning';
          statusText = 'Revision Requested';
        } else if (isSubmitted) {
          statusBadgeClass = 'teal';
          statusText = 'Submitted';
        } else {
          statusBadgeClass = 'blue';
          statusText = 'Assigned';
        }

        const displayScore = isGraded 
          ? (f.studentMarks !== null && f.studentMarks !== undefined ? `${f.studentMarks} / ${f.maxMarks || 50}` : (f.marks || 'Graded'))
          : 'Pending Evaluation';

        return `
          <div class="assignment-card-box">
            <div class="assignment-card-header">
              <div>
                <span class="badge-status blue" style="font-size: 11px;">${f.department}</span>
                <span style="font-size: 12px; color: var(--text-secondary); margin-left: 6px;">Assigned by: <strong>${f.professor}</strong></span>
                <h3 style="font-size: 15.5px; font-weight: 700; color: #0F172A; margin-top: 4px;">${f.title}</h3>
              </div>
              <div style="text-align: right;">
                <span class="badge-status ${statusBadgeClass}">${statusText}</span>
                <div style="font-size: 12px; font-weight: 700; color: #0F172A; margin-top: 4px;">Score: ${displayScore}</div>
              </div>
            </div>

            <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 8px 12px; font-size: 12px; color: var(--text-secondary);">
              <strong>Instructions:</strong> ${f.instructions || f.description || 'Departmental project work deliverables.'}
            </div>

            ${isGraded && f.feedback ? `
              <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: var(--radius-sm); padding: 8px 12px; font-size: 12px; color: #065F46;">
                <strong>Faculty Feedback:</strong> "${f.feedback}"
              </div>
            ` : ''}

            ${isRevision && f.feedback ? `
              <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: var(--radius-sm); padding: 8px 12px; font-size: 12px; color: #92400E;">
                <strong>Revision Notice:</strong> "${f.feedback}"
              </div>
            ` : ''}

            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              <span>Deadline: <strong>${f.dueDate} ${f.dueTime || ''}</strong> <span class="badge-status ${f.priority === 'High' ? 'error' : 'blue'}" style="margin-left: 4px; font-size: 10px;">${f.priority || 'Medium'}</span></span>
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <button class="btn-outline btn-sm" onclick="openSubmissionDetailsModal('faculty', '${f.id}')">View Details</button>
                ${isRevision
                  ? `<button class="btn-primary btn-sm" style="background: #D97706;" onclick="openSubmitAssignmentModal('faculty', '${f.id}')">Resubmit Work</button>`
                  : isSubmitted || isGraded
                  ? `<button class="btn-outline btn-sm" onclick="openSubmitAssignmentModal('faculty', '${f.id}')">Replace Submission</button>`
                  : `<button class="btn-primary btn-sm" onclick="openSubmitAssignmentModal('faculty', '${f.id}')">Submit Assignment</button>`
                }
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Companies & Drives (Main Directory)
  window._currentCompanyTier = 'all';
  window.setCompanyTierFilter = function(tier) {
    window._currentCompanyTier = tier;
    document.querySelectorAll('.company-tier-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tier') === tier);
    });
    renderStudentCompanies(store.data.roles.student);
  };

  function renderStudentCompanies(student) {
    const container = document.getElementById('student-companies-directory-list');
    if (!container) return;

    let drives = store.getDrives();
    const searchVal = document.getElementById('company-search-input')?.value?.toLowerCase() || '';
    const tier = window._currentCompanyTier || 'all';

    if (searchVal) {
      drives = drives.filter(d => (d.company || '').toLowerCase().includes(searchVal) || (d.role || '').toLowerCase().includes(searchVal));
    }
    if (tier === 'dream') {
      drives = drives.filter(d => (parseFloat(d.packageLPA) >= 20));
    } else if (tier === 'super') {
      drives = drives.filter(d => (parseFloat(d.packageLPA) >= 10 && parseFloat(d.packageLPA) < 20));
    } else if (tier === 'core') {
      drives = drives.filter(d => (parseFloat(d.packageLPA) < 10));
    }

    const myApps = store.getStudentApplications(student.id);

    if (drives.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card" style="padding: 30px;">
          <div class="empty-state-icon">🏢</div>
          <div class="empty-state-title">No companies found</div>
          <div class="empty-state-desc">Try clearing your search keyword or selecting a different package tier filter.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = drives.map(d => {
      const isEligible = (student.cgpa >= d.minCGPA) && (student.backlogs <= d.maxBacklogs);
      const hasApplied = myApps.some(a => a.driveId === d.id);
      const pkg = parseFloat(d.packageLPA);
      const tierBadge = pkg >= 20 ? 'Dream Tier (>20 LPA)' : pkg >= 10 ? 'Super Dream' : 'Core & IT';

      return `
        <div class="drive-list-card" style="padding: 16px; margin-bottom: 12px;">
          <div class="drive-logo-initials" style="width: 48px; height: 48px; font-size: 16px;">${(d.company || 'CD').slice(0, 2).toUpperCase()}</div>
          <div class="drive-info-col">
            <div class="drive-company-title" style="font-size: 16px;">
              <span>${d.company || 'Campus Drive'}</span>
              <span class="badge-status success" style="font-size: 12.5px; padding: 2px 8px;">₹${d.packageLPA || 8.0} LPA</span>
              <span class="badge-status blue" style="font-size: 11px;">${tierBadge}</span>
            </div>
            <div class="drive-meta-text" style="margin-top: 6px; font-size: 12.5px;">
              <span><strong>Role:</strong> ${d.role || 'Software Engineer'}</span>
              <span><strong>Location:</strong> ${d.location || 'Campus'}</span>
              <span><strong>Eligibility Cutoff:</strong> Min CGPA ${d.minCGPA || 6.0}, Max Backlogs ${d.maxBacklogs || 0}</span>
              <span><strong>Registration Closes:</strong> ${d.deadline || 'Ongoing'}</span>
              <span class="badge-status ${isEligible ? 'teal' : 'error'}">
                ${isEligible ? 'Criteria Met ✓' : 'Cutoff Not Met'}
              </span>
            </div>
            <div style="margin-top: 8px; font-size: 12px; color: var(--text-muted); background: #F8FAFC; padding: 6px 10px; border-radius: var(--radius-sm);">
              <strong>Hiring Rounds:</strong> Online Assessment &bull; Technical Interview 1 (DSA) &bull; Technical Interview 2 (System Architecture) &bull; HR Discussion
            </div>
          </div>
          <div>
            ${hasApplied 
              ? `<button class="btn-outline btn-sm" disabled style="background: var(--success-bg); color: var(--success-green); border-color: var(--success-green); padding: 8px 14px;">Applied ✓</button>`
              : isEligible 
                ? `<button class="btn-primary btn-sm" style="padding: 8px 14px;" onclick="applyForDrive('${d.id}')">Apply Now</button>`
                : `<button class="btn-outline btn-sm" disabled style="padding: 8px 14px;">Ineligible</button>`
            }
          </div>
        </div>
      `;
    }).join('');
  }

  // Applications & Recruitment Pipeline
  function renderStudentApplications(student) {
    const container = document.getElementById('student-applications-pipeline-list');
    if (!container) return;

    const myApps = store.getStudentApplications(student.id);
    if (myApps.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card" style="padding: 40px;">
          <div class="empty-state-icon">📄</div>
          <div class="empty-state-title">No Applications Submitted</div>
          <div class="empty-state-desc">You haven't submitted applications yet. Browse the official company recruitment drives to apply.</div>
          <button class="btn-primary btn-sm" style="margin-top: 10px;" onclick="navigateToRoute('/student/companies')">Browse Companies</button>
        </div>
      `;
      return;
    }

    container.innerHTML = myApps.map(app => {
      let step = 1;
      if (app.status === 'Applied') step = 1;
      else if (app.status === 'Shortlisted') step = 3;
      else if (app.status === 'Interview Scheduled') step = 4;
      else if (app.status === 'Offered') step = 5;

      const compName = app.company || 'Campus Drive';
      const roleTitle = app.role || 'Software Engineer';

      return `
        <div class="assignment-card-box" style="padding: 18px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="drive-logo-initials" style="width: 42px; height: 42px; font-size: 14px;">${compName.slice(0, 2).toUpperCase()}</div>
              <div>
                <h3 style="font-size: 16px; font-weight: 700; color: #0F172A;">${compName}</h3>
                <div style="font-size: 12.5px; color: var(--text-secondary);">${roleTitle} • Application ID: <code>${app.id}</code></div>
              </div>
            </div>
            <div style="text-align: right;">
              <span class="badge-status ${app.status === 'Offered' ? 'success' : app.status === 'Interview Scheduled' ? 'teal' : 'blue'}" style="font-size: 12.5px; padding: 4px 10px;">${app.status}</span>
              ${app.offerPackage ? `<div style="font-size: 13px; font-weight: 700; color: var(--success-green); margin-top: 4px;">CTC: ₹${app.offerPackage} LPA</div>` : ''}
            </div>
          </div>

          <!-- 5-Step Pipeline Stepper -->
          <div class="app-pipeline-container">
            <div class="pipeline-node">
              <div class="node-dot passed">✓</div>
              <span class="node-label">Applied</span>
            </div>
            <div class="pipeline-node">
              <div class="node-dot ${step >= 2 ? 'passed' : 'active'}">${step >= 2 ? '✓' : '2'}</div>
              <span class="node-label">Resume Screening</span>
            </div>
            <div class="pipeline-node">
              <div class="node-dot ${step >= 3 ? 'passed' : step === 2 ? 'active' : ''}">${step >= 3 ? '✓' : '3'}</div>
              <span class="node-label">Online Test</span>
            </div>
            <div class="pipeline-node">
              <div class="node-dot ${step >= 4 ? 'passed' : step === 3 ? 'active' : ''}">${step >= 4 ? '✓' : '4'}</div>
              <span class="node-label">Technical Round</span>
            </div>
            <div class="pipeline-node">
              <div class="node-dot ${step === 5 ? 'passed' : ''}">${step === 5 ? '✓' : '5'}</div>
              <span class="node-label">Offer Extended</span>
            </div>
          </div>

          <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 8px 12px; font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <span>Applied on: <strong>${app.appliedDate}</strong></span>
            <span>${app.status === 'Offered' ? '🎉 Congratulations on your placement offer!' : 'Current Stage: ' + app.status}</span>
            <button class="btn-outline btn-sm" onclick="window.showToast?.('Viewing application dossier for ${app.id}', 'info')">View Dossier</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Skills & Skill Gaps Matrix
  function renderStudentSkillGaps(student) {
    const verifiedContainer = document.getElementById('student-skills-catalog-grid');
    if (verifiedContainer) {
      const skills = student.skills || [];
      verifiedContainer.innerHTML = skills.map(skill => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--success-green); font-weight: 700;">✓</span>
            <span style="font-size: 13.5px; font-weight: 600; color: #0F172A;">${skill}</span>
          </div>
          <span class="badge-status teal" style="font-size: 11px;">Verified</span>
        </div>
      `).join('');
    }
  }

  // Notifications View
  window._currentNotifFilter = 'all';
  window.setNotifFilter = function(filter) {
    window._currentNotifFilter = filter;
    document.querySelectorAll('.notif-filter-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
    });
    renderStudentNotifications();
  };

  function renderStudentNotifications() {
    const container = document.getElementById('student-notifications-list');
    if (!container) return;

    let notifs = store.getNotifications();
    const filter = window._currentNotifFilter || 'all';

    if (filter !== 'all') {
      notifs = notifs.filter(n => n.category.toLowerCase() === filter.toLowerCase());
    }

    if (notifs.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card" style="padding: 30px;">
          <div class="empty-state-icon">🔔</div>
          <div class="empty-state-title">No notifications</div>
          <div class="empty-state-desc">You are completely up to date.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = notifs.map(n => `
      <div class="notification-item-card ${n.read ? '' : 'unread'}">
        <div class="notification-icon-pill ${n.type}">
          ${icons.notifications}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
            <div style="font-size: 14px; font-weight: 700; color: #0F172A;">${n.title}</div>
            <span style="font-size: 11.5px; color: var(--text-muted);">${n.date}</span>
          </div>
          <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.45; margin-bottom: 8px;">${n.message}</p>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="badge-status ${n.category === 'Placement' ? 'blue' : n.category === 'Faculty' ? 'teal' : 'warning'}" style="font-size: 10.5px;">${n.category}</span>
            <div style="display: flex; gap: 8px;">
              ${!n.read ? `<button class="btn-outline btn-sm" style="font-size: 11px; padding: 2px 8px;" onclick="markNotifRead('${n.id}')">Mark Read</button>` : ''}
              ${n.actionUrl ? `<a href="${n.actionUrl}" class="btn-primary btn-sm" style="font-size: 11px; padding: 2px 8px; text-decoration: none;">Open Page →</a>` : ''}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  window.markNotifRead = function(id) {
    store.markNotificationRead(id);
    renderStudentNotifications();
  };

  function renderStudentCharts(student) {
    if (!student) return;

    // 1. Dynamic Factor Weights labels
    const cgpaEl = document.getElementById('factor-name-cgpa');
    const aptEl = document.getElementById('factor-name-aptitude');
    const backlogsEl = document.getElementById('factor-name-backlogs');
    if (cgpaEl) cgpaEl.textContent = `Academic CGPA (${student.cgpa || 8.1} / 10.0)`;
    if (aptEl) aptEl.textContent = `Aptitude Test Score (${student.aptitudeScore || 78} / 100)`;
    if (backlogsEl) backlogsEl.textContent = `Active Backlogs (${student.backlogs ?? 0} Active)`;

    // 2. Dynamic Radar Chart & Skills
    const skills = [
      { id: 'dsa', name: 'Data Structures & Algorithms', score: 82, benchmark: 80, angle: -90 },
      { id: 'web', name: 'Web Technologies & Frameworks', score: 88, benchmark: 80, angle: -18 },
      { id: 'sys', name: 'System Design & Architecture', score: 65, benchmark: 80, angle: 54 },
      { id: 'cs', name: 'Core CS (OS, DBMS, Networks)', score: 74, benchmark: 80, angle: 126 },
      { id: 'apt', name: 'Quantitative & Logical Aptitude', score: student.aptitudeScore ? Math.round(student.aptitudeScore * 80 / 78) : 80, benchmark: 80, angle: 198 }
    ];

    const cx = 170, cy = 135, R = 85;
    const polyPoints = [];

    skills.forEach(s => {
      const isMet = s.score >= s.benchmark;
      const diff = s.score - s.benchmark;

      const scoreEl = document.getElementById(`skill-score-${s.id}`);
      const pillEl = document.getElementById(`skill-pill-${s.id}`);
      const valEl = document.getElementById(`radar-val-${s.id}`);

      if (scoreEl) {
        scoreEl.textContent = `${s.score}%`;
        scoreEl.className = `skill-score-num ${isMet ? 'green' : 'orange'}`;
      }

      if (pillEl) {
        if (s.score >= 85) {
          pillEl.textContent = 'Exceeds';
          pillEl.className = 'pill-skill-status met';
        } else if (isMet) {
          pillEl.textContent = 'Met';
          pillEl.className = 'pill-skill-status met';
        } else {
          pillEl.textContent = `Gap (${diff}%)`;
          pillEl.className = 'pill-skill-status gap';
        }
      }

      if (valEl) {
        valEl.textContent = `${s.score}%`;
        valEl.setAttribute('fill', isMet ? '#059669' : '#D97706');
      }

      const normRadius = Math.max(0.15, Math.min(1.0, s.score / 100)) * R;
      const rad = s.angle * Math.PI / 180;
      const x = (cx + normRadius * Math.cos(rad)).toFixed(1);
      const y = (cy + normRadius * Math.sin(rad)).toFixed(1);
      polyPoints.push(`${x},${y}`);
    });

    const polyEl = document.getElementById('radar-student-polygon');
    if (polyEl) {
      polyEl.setAttribute('points', polyPoints.join(' '));
    }
  }

  function renderStudentProfileView(student) {
    if (!student) return;

    // Toggle Profile Setup Guide Banner if incomplete
    const setupBanner = document.getElementById('profile-setup-guide-banner');
    const isProfilePending = !student.cgpa || student.predictionStatus === 'Pending Setup';
    if (setupBanner) {
      setupBanner.style.display = isProfilePending ? 'flex' : 'none';
    }

    // Auto-prompt setup modal if visiting with ?setup=true and profile is incomplete
    if (window.location.hash.includes('setup=true') && isProfilePending) {
      if (!window._setupModalOpened) {
        window._setupModalOpened = true;
        setTimeout(() => {
          if (typeof openEditProfileModal === 'function') {
            openEditProfileModal();
          }
        }, 300);
      }
    }

    // 1. Identity Header Card
    const nameEl = document.getElementById('sp-name');
    const avatarEl = document.getElementById('sp-avatar-text');
    const degBranchEl = document.getElementById('sp-degree-branch');
    const collegeEl = document.getElementById('sp-college');
    const emailEl = document.getElementById('sp-email');
    const phoneEl = document.getElementById('sp-phone');
    const locEl = document.getElementById('sp-location');
    const yrBadgeEl = document.getElementById('sp-year-badge');
    const cgpaBadgeEl = document.getElementById('sp-cgpa-badge');
    const statusBadgeEl = document.getElementById('sp-status-badge');

    if (nameEl) nameEl.textContent = student.name || 'Student Profile';
    if (avatarEl) avatarEl.textContent = student.avatar || (student.name && student.name !== 'Student Profile' ? student.name.split(' ').map(n => n[0]).join('') : 'ST');
    if (degBranchEl) degBranchEl.textContent = `${student.degree || 'B.Tech'} - ${student.branch || 'Engineering'}`;
    if (collegeEl) collegeEl.innerHTML = `${student.college || 'College of Engineering'} &bull; Class of ${student.gradYear || 2026}`;
    if (emailEl) emailEl.textContent = student.email || 'Not provided';
    if (phoneEl) phoneEl.textContent = student.phone || 'Not provided';
    if (locEl) locEl.textContent = (student.city && student.state) ? `${student.city}, ${student.state}` : (student.city || student.state || 'Location pending');
    if (yrBadgeEl) yrBadgeEl.textContent = student.currentYear || 'Year Pending';
    if (cgpaBadgeEl) cgpaBadgeEl.textContent = student.cgpa ? `CGPA: ${student.cgpa} / 10.0` : 'CGPA: Pending Setup';
    if (statusBadgeEl) statusBadgeEl.textContent = student.placementStatus || 'Pending Setup';

    // 2. Score Summary & Live Completion Gauge
    const score = store.getProfileCompletionScore ? store.getProfileCompletionScore() : 78;
    const gaugeValEl = document.getElementById('sp-gauge-val');
    const gaugeCircle = document.getElementById('sp-gauge-circle');
    const gaugeStatusEl = document.getElementById('sp-gauge-status');

    if (gaugeValEl) gaugeValEl.textContent = `${score}%`;
    if (gaugeCircle) {
      // 2 * PI * 32 ~= 201 circumference
      const circumference = 201;
      const offset = circumference - (circumference * score / 100);
      gaugeCircle.setAttribute('stroke-dashoffset', offset);
    }
    if (gaugeStatusEl) {
      if (score >= 85) gaugeStatusEl.textContent = 'Excellent';
      else if (score >= 70) gaugeStatusEl.textContent = 'Very Good';
      else if (score >= 50) gaugeStatusEl.textContent = 'Good';
      else gaugeStatusEl.textContent = 'Needs Improvement';
    }

    // Counts
    const cntInternships = document.getElementById('sp-cnt-internships');
    const cntWork = document.getElementById('sp-cnt-work');
    const cntProjects = document.getElementById('sp-cnt-projects');
    const cntCerts = document.getElementById('sp-cnt-certs');

    if (cntInternships) cntInternships.textContent = student.internships ? student.internships.length : 0;
    if (cntWork) cntWork.textContent = student.workExperience ? student.workExperience.length : 0;
    if (cntProjects) cntProjects.textContent = student.projects ? student.projects.length : 0;
    if (cntCerts) cntCerts.textContent = student.certifications ? student.certifications.length : 0;

    // 3. Row 1: Academic Details
    const tenthSubEl = document.getElementById('sp-tenth-sub');
    const tenthScoreEl = document.getElementById('sp-tenth-score');
    const twelfthSubEl = document.getElementById('sp-twelfth-sub');
    const twelfthScoreEl = document.getElementById('sp-twelfth-score');
    const btechSubEl = document.getElementById('sp-btech-sub');
    const btechScoreEl = document.getElementById('sp-btech-score');

    if (tenthSubEl) tenthSubEl.textContent = student.tenthSchool ? `${student.tenthBoard || 'Board'} • ${student.tenthSchool} (${student.tenthYear || ''})` : 'Secondary details not provided';
    if (tenthScoreEl) tenthScoreEl.textContent = student.tenthPct ? `${student.tenthPct}%` : 'Not recorded';

    if (twelfthSubEl) twelfthSubEl.textContent = student.twelfthCollege ? `${student.twelfthBoard || 'Board'} • ${student.twelfthStream || 'Stream'} • ${student.twelfthCollege} (${student.twelfthYear || ''})` : 'Higher secondary details not provided';
    if (twelfthScoreEl) twelfthScoreEl.textContent = student.twelfthPct ? `${student.twelfthPct}%` : 'Not recorded';

    if (btechSubEl) btechSubEl.textContent = `${student.branch || 'Engineering'} • ${student.backlogs || 0} Active Backlogs`;
    if (btechScoreEl) btechScoreEl.textContent = student.cgpa ? `${Number(student.cgpa).toFixed(2)} CGPA` : 'Pending Setup';

    // 4. Internships Container
    const internContainer = document.getElementById('sp-internships-container');
    const internVerifiedNote = document.getElementById('sp-internship-verified-note');
    if (internContainer) {
      const list = student.internships || [];
      if (internVerifiedNote) internVerifiedNote.textContent = `${list.length} Verified Experience${list.length === 1 ? '' : 's'}`;
      if (list.length === 0) {
        internContainer.innerHTML = `
          <div class="empty-state-box">
            <div class="empty-state-icon">💼</div>
            <div class="empty-state-title">No Internships Added</div>
            <div class="empty-state-desc">Add internships or industrial training to boost your recruiter match rate.</div>
            <button class="profile-card-action-btn" style="margin-top: 10px;" onclick="openAddInternshipModal()">+ Add Internship</button>
          </div>
        `;
      } else {
        internContainer.innerHTML = list.map(item => `
          <div style="padding: 10px 12px; background: #F8FAFC; border-radius: var(--radius-md); margin-bottom: 8px; border-left: 3px solid #0D8A60; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-weight: 700; color: var(--text-navy); font-size: 13px;">${item.role}</div>
                <div style="color: #0D8A60; font-size: 11.5px; font-weight: 600;">${item.company} &bull; <span style="color: var(--text-secondary);">${item.mode || 'Hybrid'}</span></div>
              </div>
              <button onclick="deleteStudentInternship('${item.id}')" title="Delete" style="background: transparent; border: none; color: #94A3B8; cursor: pointer; font-size: 13px;">✕</button>
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
              <span>🗓 ${item.startDate || ''} - ${item.endDate || ''}</span>
              ${item.stipend ? ` &bull; <span>💰 ${item.stipend}</span>` : ''}
            </div>
            ${item.skillsUsed ? `<div style="font-size: 11px; color: var(--text-navy); margin-top: 3px;"><strong>Stack:</strong> ${item.skillsUsed}</div>` : ''}
          </div>
        `).join('');
      }
    }

    // 5. Work Experience Container
    const workContainer = document.getElementById('sp-work-container');
    if (workContainer) {
      const list = student.workExperience || [];
      if (list.length === 0) {
        workContainer.innerHTML = `
          <div class="empty-state-box">
            <div class="empty-state-icon">🏢</div>
            <div class="empty-state-title">No Work Experience Added</div>
            <div class="empty-state-desc">Add full-time, freelance, or contract roles if applicable.</div>
            <button class="profile-card-action-btn" style="margin-top: 10px;" onclick="openAddWorkExperienceModal()">+ Add Experience</button>
          </div>
        `;
      } else {
        workContainer.innerHTML = list.map(item => `
          <div style="padding: 10px 12px; background: #F8FAFC; border-radius: var(--radius-md); margin-bottom: 8px; border-left: 3px solid #2563EB;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-weight: 700; color: var(--text-navy); font-size: 13px;">${item.jobTitle}</div>
                <div style="color: #2563EB; font-size: 11.5px; font-weight: 600;">${item.company} &bull; ${item.empType || 'Full-time'}</div>
              </div>
              <button onclick="deleteStudentWorkExperience('${item.id}')" title="Delete" style="background: transparent; border: none; color: #94A3B8; cursor: pointer; font-size: 13px;">✕</button>
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">🗓 ${item.duration}</div>
            ${item.description ? `<div style="font-size: 11px; color: var(--text-secondary); margin-top: 3px;">${item.description}</div>` : ''}
          </div>
        `).join('');
      }
    }

    // 6. Skills & Technologies
    const skillsContainer = document.getElementById('sp-skills-container');
    const skillsCountLabel = document.getElementById('sp-skills-count-label');
    if (skillsContainer) {
      const skills = student.skills || [];
      if (skillsCountLabel) skillsCountLabel.textContent = `${skills.length} Skills Added`;
      skillsContainer.innerHTML = skills.map(skill => `
        <span class="skill-chip-pill">${skill}</span>
      `).join('') + `
        <button type="button" class="skill-chip-pill" style="cursor: pointer; background: #EFF6FF; border-color: #BFDBFE; color: #2563EB;" onclick="openEditSkillsModal()">+ Add Skill</button>
      `;
    }

    // 7. Education / Present Course
    const presCollege = document.getElementById('sp-pres-college');
    const presDegree = document.getElementById('sp-pres-degree');
    const presBranch = document.getElementById('sp-pres-branch');
    const presMeta = document.getElementById('sp-pres-meta');
    const presMentor = document.getElementById('sp-pres-mentor');

    if (presCollege) presCollege.textContent = student.college || 'College of Engineering';
    if (presDegree) presDegree.textContent = `Bachelor of Technology (${student.degree || 'B.Tech'})`;
    if (presBranch) presBranch.textContent = `Branch: ${student.branch || 'Engineering'}`;
    if (presMeta) presMeta.innerHTML = `Roll No: ${student.rollNo || 'Pending'} &bull; Batch: ${student.admissionYear ? `${student.admissionYear} - ${student.gradYear || student.admissionYear + 4}` : 'Pending'}`;
    if (presMentor) presMentor.textContent = student.mentorName ? `Mentor: ${student.mentorName} (Dept)` : 'Mentor: Assigned upon enrollment';

    // 8. Certifications Container
    const certsContainer = document.getElementById('sp-certs-container');
    if (certsContainer) {
      const list = student.certifications || [];
      if (list.length === 0) {
        certsContainer.innerHTML = `
          <div class="empty-state-box">
            <div class="empty-state-icon">🏅</div>
            <div class="empty-state-title">No Certifications Added</div>
            <div class="empty-state-desc">Add cloud, developer, or LeetCode credentials to showcase verified competencies.</div>
            <button class="profile-card-action-btn" style="margin-top: 10px;" onclick="openAddCertificationModal()">+ Add Certification</button>
          </div>
        `;
      } else {
        certsContainer.innerHTML = list.map(item => `
          <div style="padding: 10px 12px; background: #F8FAFC; border-radius: var(--radius-md); margin-bottom: 8px; border-left: 3px solid #0D9488;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-weight: 700; color: var(--text-navy); font-size: 13px;">${item.name}</div>
                <div style="color: #0D9488; font-size: 11.5px; font-weight: 600;">${item.issuer}</div>
              </div>
              <button onclick="deleteStudentCertification('${item.id}')" title="Delete" style="background: transparent; border: none; color: #94A3B8; cursor: pointer; font-size: 13px;">✕</button>
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
              <span>🗓 Issued: ${item.date || '2025'}</span>
              ${item.credentialUrl ? ` &bull; <a href="${item.credentialUrl}" target="_blank" style="color: #2563EB;">Verify ↗</a>` : ''}
            </div>
          </div>
        `).join('');
      }
    }

    // 9. Academic Performance & Metrics Bars
    const tenthVal = student.tenthPct || 0;
    const twelfthVal = student.twelfthPct || 0;
    const cgpaVal = student.cgpa || 0;
    const cgpaPct = cgpaVal > 0 ? Math.min(100, Math.round((cgpaVal / 10) * 100)) : 0;

    const pTenth = document.getElementById('sp-perf-tenth');
    const bTenth = document.getElementById('sp-bar-tenth');
    if (pTenth) pTenth.textContent = student.tenthPct ? `${tenthVal}%` : 'Not recorded';
    if (bTenth) bTenth.style.width = `${Math.min(100, tenthVal)}%`;

    const pTwelfth = document.getElementById('sp-perf-twelfth');
    const bTwelfth = document.getElementById('sp-bar-twelfth');
    if (pTwelfth) pTwelfth.textContent = student.twelfthPct ? `${twelfthVal}%` : 'Not recorded';
    if (bTwelfth) bTwelfth.style.width = `${Math.min(100, twelfthVal)}%`;

    const pCgpa = document.getElementById('sp-perf-cgpa');
    const bCgpa = document.getElementById('sp-bar-cgpa');
    if (pCgpa) pCgpa.textContent = student.cgpa ? `${Number(cgpaVal).toFixed(2)} CGPA` : 'Not recorded';
    if (bCgpa) bCgpa.style.width = `${cgpaPct}%`;

    const techScore = student.technicalScore || 0;
    const aptScore = student.aptitudeScore || 0;
    const resumeScore = student.resumeScore || 0;

    const mCgpa = document.getElementById('sp-metric-cgpa');
    if (mCgpa) mCgpa.textContent = student.cgpa ? `${cgpaVal} / 10.0 (${cgpaPct}%)` : 'Not recorded';

    const mTech = document.getElementById('sp-metric-tech');
    const bTech = document.getElementById('sp-bar-tech');
    if (mTech) mTech.textContent = student.technicalScore ? `${techScore} / 100` : 'Not recorded';
    if (bTech) bTech.style.width = `${techScore}%`;

    const mApt = document.getElementById('sp-metric-apt');
    const bApt = document.getElementById('sp-bar-apt');
    if (mApt) mApt.textContent = student.aptitudeScore ? `${aptScore} / 100` : 'Not recorded';
    if (bApt) bApt.style.width = `${aptScore}%`;

    const mRes = document.getElementById('sp-metric-resume');
    const bRes = document.getElementById('sp-bar-resume');
    if (mRes) mRes.textContent = student.resumeScore ? `${resumeScore} / 100` : 'Not recorded';
    if (bRes) bRes.style.width = `${resumeScore}%`;

    // 10. Recent Activity Log
    const actContainer = document.getElementById('sp-activity-container');
    if (actContainer) {
      const activities = student.recentActivities || [
        { title: 'Resume ATS scan completed', desc: 'Score updated to 82/100', time: 'Today' },
        { title: 'Applied to Microsoft Cloud Drive', desc: 'Application ID: APP-1002', time: 'Yesterday' },
        { title: 'Mock Technical Interview cleared', desc: 'Rated 84% in Core CS & DSA', time: 'Oct 08, 2026' }
      ];
      actContainer.innerHTML = activities.slice(0, 3).map(act => `
        <div style="padding: 8px 10px; background: #F8FAFC; border-radius: var(--radius-md); font-size: 11.5px; border-left: 2.5px solid var(--primary-blue);">
          <div style="font-weight: 700; color: var(--text-navy);">${act.title}</div>
          <div style="color: var(--text-secondary); font-size: 11px;">${act.desc} &bull; <span style="color: #94A3B8;">${act.time}</span></div>
        </div>
      `).join('');
    }
  }

  // Filter and query states for faculty views
  window.facultyAssignmentFilter = 'all';
  window.facultyStudentSearchQuery = '';

  function renderFacultyViews() {
    renderFacultyOverview();
    renderFacultyAssignments();
    renderFacultySubmissionsQueue();
    renderFacultySubmissionsLab();
    renderFacultySubmissionsProjects();
    renderFacultyStudents();
    renderFacultySubmissionsRecords();
    renderFacultyAnalytics();
    renderFacultyMLInsights();
    renderFacultyNotifications();
    renderFacultyProfile();
  }

  function renderFacultyAnalytics() {
    // Model evaluation benchmarks and class progression
    const evalData = store.getModelEvaluation ? store.getModelEvaluation() : null;
  }

  function renderFacultyOverview() {
    const stats = store.getFacultyStats ? store.getFacultyStats() : { totalStudents: 42, activeAssignments: 3, pendingGrading: 3, avgStudentPerformance: '84.6%' };
    const activities = store.getFacultyActivities ? store.getFacultyActivities() : [];
    const deadlines = store.getFacultyDeadlines ? store.getFacultyDeadlines() : [];
    const atRiskStudents = store.getAtRiskStudents ? store.getAtRiskStudents() : [];

    // 6 Uniform KPI Cards
    const elTotalStudents = document.getElementById('fac-kpi-total-students');
    const elAvgPerformance = document.getElementById('fac-kpi-avg-performance');
    const elAvgPredicted = document.getElementById('fac-kpi-avg-predicted');
    const elAtRiskCount = document.getElementById('fac-kpi-at-risk-count');
    const elAvgAttendance = document.getElementById('fac-kpi-avg-attendance');
    const elAssignmentRate = document.getElementById('fac-kpi-assignment-rate');

    if (elTotalStudents) elTotalStudents.textContent = stats.totalStudents || 42;
    if (elAvgPerformance) elAvgPerformance.textContent = stats.avgStudentPerformance || '84.6%';
    if (elAvgPredicted) elAvgPredicted.textContent = '82.8';
    if (elAtRiskCount) elAtRiskCount.textContent = atRiskStudents.length;
    if (elAvgAttendance) elAvgAttendance.textContent = '86.2%';
    if (elAssignmentRate) elAssignmentRate.textContent = '91.2%';

    // Recent Academic Activities Feed
    const activitiesList = document.getElementById('faculty-overview-activities-list');
    if (activitiesList) {
      if (activities.length === 0) {
        activitiesList.innerHTML = `<div style="padding: 12px; color: #94A3B8; font-size: 12px;">No recent activities logged.</div>`;
      } else {
        activitiesList.innerHTML = activities.slice(0, 5).map(act => {
          let iconSvg = '📝';
          let wrapClass = 'assignment';
          if (act.type === 'grading' || act.title.includes('Marks')) {
            wrapClass = 'grading';
            iconSvg = '✓';
          } else if (act.type === 'submission' || act.title.includes('Submission')) {
            wrapClass = 'submission';
            iconSvg = '📥';
          } else if (act.type === 'project' || act.title.includes('Project')) {
            wrapClass = 'project';
            iconSvg = '👥';
          } else if (act.type === 'placement' || act.title.includes('Placement')) {
            wrapClass = 'placement';
            iconSvg = '💼';
          }

          return `
            <div class="activity-feed-item">
              <div class="activity-icon-wrap ${wrapClass}">
                <span>${iconSvg}</span>
              </div>
              <div style="flex: 1;">
                <div class="activity-title">${act.title}</div>
                <div class="activity-detail">${act.detail}</div>
                <div style="font-size: 10.5px; color: #94A3B8; margin-top: 3px;">${act.time}</div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Upcoming Academic Deadlines Feed
    const deadlinesList = document.getElementById('faculty-overview-deadlines-list');
    if (deadlinesList) {
      if (deadlines.length === 0) {
        deadlinesList.innerHTML = `<div style="padding: 12px; color: #94A3B8; font-size: 12px;">No upcoming deadlines.</div>`;
      } else {
        deadlinesList.innerHTML = deadlines.slice(0, 5).map(dl => {
          const rawDate = dl.date || dl.dueDate || '2026-10-25';
          const parts = rawDate.split('-');
          const monthNum = parts[1] || '10';
          const dayNum = parts[2] || '25';
          const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
          const monthStr = monthNames[parseInt(monthNum, 10) - 1] || 'OCT';
          const categoryStr = dl.category || dl.subject || 'Academic Task';
          const isUrgent = dl.urgent || dl.priority === 'High' || dl.priority === 'Urgent';

          return `
            <div class="deadline-feed-item">
              <div class="deadline-cal-icon">
                <span class="deadline-cal-month">${monthStr}</span>
                <span class="deadline-cal-day">${dayNum}</span>
              </div>
              <div class="deadline-feed-body">
                <div class="deadline-feed-title">${dl.title}</div>
                <div class="deadline-feed-sub">${categoryStr} • ${dl.daysLeft != null ? dl.daysLeft + ' days left' : 'Upcoming'}</div>
                <div class="deadline-feed-time">Due: ${rawDate}</div>
              </div>
              <span class="badge-status ${isUrgent ? 'error' : 'warning'}">${isUrgent ? 'Urgent' : 'Active'}</span>
            </div>
          `;
        }).join('');
      }
    }

    // Priority At-Risk Watchlist Table (9 Columns with Intervention Action)
    const watchlistTbody = document.getElementById('faculty-watchlist-tbody');
    if (watchlistTbody) {
      if (atRiskStudents.length === 0) {
        watchlistTbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 16px;">All mentees currently compliant with attendance and academic thresholds.</td></tr>`;
      } else {
        watchlistTbody.innerHTML = atRiskStudents.map(s => {
          let riskBadgeClass = 'warning';
          if (s.academicRisk === 'Critical Risk' || s.academicRisk === 'High Risk') riskBadgeClass = 'error';
          else if (s.academicRisk === 'Low Risk') riskBadgeClass = 'teal';

          let statusBadgeClass = 'warning';
          if (s.interventionStatus === 'Resolved') statusBadgeClass = 'success';
          else if (s.interventionStatus === 'In Progress') statusBadgeClass = 'blue';

          const reasonsText = (s.riskReasons || ['Attendance alert', 'Backlog support']).slice(0, 2).join('; ');

          return `
            <tr>
              <td><code>${s.rollNo}</code></td>
              <td><strong>${s.name}</strong></td>
              <td>${s.cgpa !== null && s.cgpa !== undefined ? s.cgpa : 'N/A'}</td>
              <td style="color: ${(s.attendance !== null && s.attendance !== undefined && s.attendance < 75) ? '#DC2626' : 'inherit'}; font-weight: ${(s.attendance !== null && s.attendance !== undefined && s.attendance < 75) ? '700' : 'normal'};">${s.attendance !== null && s.attendance !== undefined ? s.attendance + '%' : 'N/A'}</td>
              <td>${s.quizAvg !== null && s.quizAvg !== undefined ? s.quizAvg + '%' : 'N/A'}</td>
              <td><span class="badge-status ${riskBadgeClass}">${s.academicRisk || 'High Risk'}</span></td>
              <td style="font-size: 11px; color: var(--text-secondary); max-width: 220px;">${reasonsText}</td>
              <td><span class="badge-status ${statusBadgeClass}">${s.interventionStatus || 'Under Review'}</span></td>
              <td>
                <div style="display: flex; gap: 4px;">
                  <button class="btn-faculty-action btn-faculty-primary" style="padding: 3px 8px; font-size: 10.5px; background: #2563EB;" onclick="openFacultyInterventionModal('${s.id}')">Intervene</button>
                  <button class="btn-outline btn-sm" style="padding: 3px 6px; font-size: 10px;" onclick="openAssignTaskModal('${s.id}')">Drill</button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }
  }

  // Faculty Intervention Modal Handlers
  window.openFacultyInterventionModal = function(studentId) {
    const student = store.getStudentById ? store.getStudentById(studentId) : null;
    if (!student) return;

    const modal = document.getElementById('modal-faculty-intervention');
    if (!modal) return;

    document.getElementById('intv-hidden-student-id').value = student.id;
    const nameEl = document.getElementById('intv-display-student-name');
    const riskEl = document.getElementById('intv-display-risk');
    const detailsEl = document.getElementById('intv-display-details');
    const indEl = document.getElementById('intv-display-indicators');

    if (nameEl) nameEl.textContent = student.name;
    if (riskEl) {
      riskEl.textContent = student.academicRisk || 'High Risk';
      riskEl.className = `badge-status ${(student.academicRisk || '').includes('Critical') || (student.academicRisk || '').includes('High') ? 'error' : 'warning'}`;
    }
    if (detailsEl) {
      detailsEl.textContent = `Roll: ${student.rollNo} • ${student.branch || 'CSE'} • CGPA: ${student.cgpa} • Attendance: ${student.attendance || 72}% • Backlogs: ${student.backlogs || 0}`;
    }
    if (indEl) {
      const reasons = student.riskReasons && student.riskReasons.length > 0 
        ? student.riskReasons.join(' • ') 
        : 'Attendance below 75% cutoff threshold, backlog alert, and quiz mark dip';
      indEl.textContent = `⚠️ Trigger Indicators: ${reasons}`;
    }

    const notesEl = document.getElementById('intv-notes');
    if (notesEl) {
      notesEl.value = student.facultyNotes || '';
    }

    modal.classList.add('active');
    modal.style.display = 'flex';
  };

  window.closeFacultyInterventionModal = function() {
    const modal = document.getElementById('modal-faculty-intervention');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  };

  window.handleSaveFacultyIntervention = function(event) {
    event.preventDefault();
    const studentId = document.getElementById('intv-hidden-student-id')?.value;
    const actionType = document.getElementById('intv-action-type')?.value;
    const status = document.getElementById('intv-status')?.value;
    const followUpDate = document.getElementById('intv-followup-date')?.value;
    const notes = document.getElementById('intv-notes')?.value;

    if (!studentId) return;

    const res = store.recordFacultyIntervention(studentId, {
      actionType,
      status,
      followUpDate,
      notes,
      mentorName: store.data.roles.faculty?.name || 'Dr. Rajesh Sharma'
    });

    closeFacultyInterventionModal();

    if (res.success) {
      window.showToast?.(`✓ Support intervention recorded for ${res.intervention.studentName} [Status: ${status}]`, 'success');
      renderFacultyOverview();
      if (typeof renderFacultyNotifications === 'function') renderFacultyNotifications();
    } else {
      window.showToast?.('Error recording intervention', 'error');
    }
  };


  function renderFacultyAssignments() {
    const assignments = store.getFacultyAssignments();
    const container = document.getElementById('faculty-assignments-list');
    const countAll = document.getElementById('fac-assign-count-all');
    const countPub = document.getElementById('fac-assign-count-published');
    const countDraft = document.getElementById('fac-assign-count-draft');

    if (countAll) countAll.textContent = assignments.length;
    if (countPub) countPub.textContent = assignments.filter(a => a.status === 'Published').length;
    if (countDraft) countDraft.textContent = assignments.filter(a => a.status === 'Draft').length;

    if (!container) return;

    let filtered = assignments;
    if (window.facultyAssignmentFilter === 'published') {
      filtered = assignments.filter(a => a.status === 'Published');
    } else if (window.facultyAssignmentFilter === 'draft') {
      filtered = assignments.filter(a => a.status === 'Draft');
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1; padding: 36px 16px;">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">No Assignments Found</div>
          <div class="empty-state-desc">Create academic tasks or lab assignments for your students.</div>
          <button class="btn-faculty-action btn-faculty-primary" style="margin-top: 12px;" onclick="openCreateAssignmentModal()">+ Create Assignment</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(a => {
      const subCount = (a.submissions || []).length;
      const gradedCount = (a.submissions || []).filter(s => s.status === 'Graded').length;
      const isDraft = a.status === 'Draft';

      return `
        <div class="assignment-mgmt-card ${isDraft ? 'draft' : ''}">
          <div class="asg-card-header">
            <span class="badge-status ${isDraft ? 'warning' : 'blue'}">${a.category || 'General'}</span>
            <span class="badge-status ${isDraft ? 'warning' : 'success'}">${a.status}</span>
          </div>

          <h4 class="asg-card-title">${a.title}</h4>
          <div class="asg-card-subject">${a.subject} • ${a.targetClass}</div>
          <div class="asg-card-desc">${a.description || a.instructions || 'No instructions provided.'}</div>

          <div class="asg-card-meta-row">
            <span>📅 Due: <strong>${a.dueDate} ${a.dueTime || ''}</strong></span>
            <span>Max Marks: <strong>${a.maxMarks}</strong></span>
          </div>

          <div class="asg-card-meta-row" style="margin-top: 4px; padding-top: 6px; border-top: 1px dashed #E2E8F0;">
            <span style="font-size: 11.5px; color: #475569;">Submissions: <strong>${subCount}</strong> (${gradedCount} Evaluated)</span>
            <span class="badge-status ${a.priority === 'High' || a.priority === 'Urgent' ? 'error' : 'blue'}" style="font-size: 10.5px;">${a.priority || 'Medium'}</span>
          </div>

          <div class="asg-card-actions">
            <button class="btn-faculty-action btn-faculty-secondary" style="flex: 1;" onclick="openCreateAssignmentModal('${a.id}')">
              Edit
            </button>
            <button class="btn-faculty-action btn-faculty-primary" style="flex: 1.4;" onclick="navigateToRoute('/faculty/submissions')">
              Submissions (${subCount})
            </button>
            <button class="btn-faculty-action btn-faculty-secondary" style="padding: 6px 10px; color: #DC2626;" onclick="deleteFacultyAssignment('${a.id}')" title="Delete Assignment">
              ✕
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderFacultySubmissionsQueue() {
    const assignments = store.getFacultyAssignments();
    const tbody = document.getElementById('faculty-submissions-table-body');
    if (!tbody) return;

    let allSubmissions = [];
    assignments.forEach(a => {
      (a.submissions || []).forEach(s => {
        allSubmissions.push({
          assignmentId: a.id,
          assignmentTitle: a.title,
          category: a.category,
          maxMarks: a.maxMarks,
          ...s
        });
      });
    });

    if (allSubmissions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #94A3B8; padding: 24px;">No student submissions waiting in queue.</td></tr>`;
      return;
    }

    tbody.innerHTML = allSubmissions.map(sub => {
      const isGraded = sub.status === 'Graded';
      const isRevision = sub.status === 'Revision Requested';
      const isLate = sub.isLate;
      const fileUrl = sub.submissionUrl || sub.fileUrl || '#';
      const fileName = sub.fileName || (fileUrl !== '#' ? fileUrl.split('/').pop() : 'artifact.pdf');

      return `
        <tr>
          <td>
            <strong>${sub.assignmentTitle}</strong>
            <div style="font-size: 11px; color: #64748B;">${sub.category || 'General'}</div>
          </td>
          <td><strong>${sub.studentName}</strong></td>
          <td><code>${sub.rollNo}</code></td>
          <td>
            <span>${sub.submittedAt || sub.submittedDate || 'Oct 14, 2026'}</span>
            ${isLate ? '<span class="badge-status error" style="margin-left: 4px; font-size: 10px;">Late</span>' : ''}
          </td>
          <td>
            <span class="badge-status ${isGraded ? 'success' : isRevision ? 'warning' : 'blue'}">
              ${isGraded ? 'Graded ✓' : isRevision ? 'Revision Requested' : 'Awaiting Grading'}
            </span>
          </td>
          <td>
            ${isGraded ? `<strong>${sub.marks}</strong> / ${sub.maxMarks}` : '<span style="color: #94A3B8;">Pending</span>'}
          </td>
          <td>
            <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
              <a href="${fileUrl}" target="_blank" style="color: #2563EB; font-weight: 600; font-size: 12px; display: inline-flex; align-items: center; gap: 4px;">
                <span>${fileName}</span> ↗
              </a>
              <a href="${fileUrl}" download="${fileName}" class="btn-outline btn-sm" style="font-size: 11px; padding: 2px 6px; text-decoration: none;" title="Download submitted file">
                📥
              </a>
            </div>
          </td>
          <td>
            <button class="btn-faculty-action btn-faculty-primary" style="padding: 4px 12px; font-size: 11.5px;" onclick="openGradeSubmissionModal('${sub.assignmentId}', '${sub.id}')">
              ${isGraded ? 'Re-evaluate' : isRevision ? 'Update Feedback' : 'Grade & Feedback'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderFacultySubmissionsLab() {
    const labs = store.getLabAssignments ? store.getLabAssignments() : (store.data.labAssignments || []);
    const container = document.getElementById('faculty-lab-assignments-container');
    if (!container) return;

    if (labs.length === 0) {
      container.innerHTML = `<div class="empty-state-card"><div class="empty-state-title">No Lab Assignments</div></div>`;
      return;
    }

    container.innerHTML = `
      <div class="content-panel">
        <div class="table-container">
          <table class="saas-table">
            <thead>
              <tr>
                <th>Lab Code</th>
                <th>Lab Title / Experiment</th>
                <th>Subject</th>
                <th>Due Date</th>
                <th>Submission Status</th>
                <th>Verified Link</th>
                <th>Lab Grade</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${labs.map(lab => `
                <tr>
                  <td><code>${lab.code || 'CSL401'}</code></td>
                  <td><strong>${lab.title}</strong></td>
                  <td>${lab.subject || 'Advanced Computing'}</td>
                  <td>${lab.dueDate}</td>
                  <td>
                    <span class="badge-status ${lab.status === 'Submitted' || lab.status === 'Completed' ? 'success' : 'warning'}">
                      ${lab.status}
                    </span>
                  </td>
                  <td>
                    <a href="${lab.submissionUrl || '#'}" target="_blank" style="color: #2563EB; font-weight: 600; font-size: 12px;">GitHub / Repo ↗</a>
                  </td>
                  <td><strong>${lab.grade || 'Pending'}</strong></td>
                  <td>
                    <button class="btn-faculty-action btn-faculty-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="openGradeSubmissionModal('lab', '${lab.id}')">
                      Evaluate Lab
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
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

          if (p.status === 'Approved' || p.status === 'Development in Progress') {
            statusClass = 'success';
            statusLabel = 'In Development';
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

  function renderFacultyStudents() {
    const mentees = store.getMentees('fac_001');
    const tbody = document.getElementById('faculty-students-table-body');
    if (!tbody) return;

    let filtered = mentees;
    if (window.facultyStudentSearchQuery) {
      const q = window.facultyStudentSearchQuery.toLowerCase();
      filtered = mentees.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.branch.toLowerCase().includes(q)
      );
    }

    tbody.innerHTML = filtered.map(s => {
      let riskBadge = '<span class="badge-status success">Ready</span>';
      if (s.status === 'At Risk' || s.probability < 55 || s.backlogs > 0) {
        riskBadge = '<span class="badge-status error">At Risk</span>';
      } else if (s.probability < 75) {
        riskBadge = '<span class="badge-status warning">Moderate</span>';
      }

      return `
        <tr>
          <td><code>${s.rollNo}</code></td>
          <td><strong>${s.name}</strong></td>
          <td>${s.branch}</td>
          <td><strong>${s.cgpa}</strong></td>
          <td>${s.aptitude}%</td>
          <td>${s.backlogs > 0 ? `<span style="color: #DC2626; font-weight: 700;">${s.backlogs}</span>` : '0'}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700;">${s.probability}%</span>
              ${riskBadge}
            </div>
          </td>
          <td><span class="badge-status ${s.status === 'Placed' ? 'success' : 'blue'}">${s.status}</span></td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="btn-faculty-action btn-faculty-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="openStudentProfileModal('${s.id}')">Profile</button>
              <button class="btn-faculty-action btn-faculty-primary" style="padding: 4px 10px; font-size: 11px;" onclick="openAssignTaskModal('${s.id}')">Assign Drill</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderFacultySubmissionsRecords() {
    const container = document.getElementById('faculty-learning-records-container');
    if (!container) return;

    const learning = store.getLearningRecords ? store.getLearningRecords() : (store.data.learningRecords || []);
    const practice = store.getPracticeRecords ? store.getPracticeRecords() : (store.data.practiceRecords || []);

    container.innerHTML = `
      <div class="panel-grid-2">
        <div class="content-panel">
          <h3 class="panel-title" style="margin-bottom: 12px;">Accredited Learning Coursework</h3>
          <div class="table-container">
            <table class="saas-table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Platform</th>
                  <th>Hours</th>
                  <th>Modules</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${learning.map(l => `
                  <tr>
                    <td><strong>${l.courseTitle || l.title}</strong></td>
                    <td>${l.platform || 'Online'}</td>
                    <td>${l.hoursCompleted || l.hours || 32} hrs</td>
                    <td>${l.completedModules || 4} / ${l.totalModules || 4}</td>
                    <td><span class="badge-status success">${l.status || 'Verified'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="content-panel">
          <h3 class="panel-title" style="margin-bottom: 12px;">Technical Practice Records</h3>
          <div class="table-container">
            <table class="saas-table">
              <thead>
                <tr>
                  <th>Discipline / Topic</th>
                  <th>Solved Count</th>
                  <th>Accuracy</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                ${practice.map(p => `
                  <tr>
                    <td><strong>${p.topic || p.discipline}</strong></td>
                    <td>${p.solvedCount || 45} Problems</td>
                    <td><strong style="color: #059669;">${p.accuracy || '88%'}</strong></td>
                    <td>${p.lastActive || 'Today'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderFacultyMLInsights() {
    const container = document.getElementById('faculty-ml-predictions-container');
    if (!container) return;

    const raw = store.getMLInsights ? store.getMLInsights() : [];
    const list = Array.isArray(raw) ? raw : (raw.completionPredictions || []);
    
    if (list.length === 0) {
      container.innerHTML = `<div class="empty-state-card"><div class="empty-state-title">ML Engine Processing</div><div class="empty-state-desc">Model inputs are being synthesized from database records.</div></div>`;
      return;
    }

    const insights = list.map(item => ({
      studentId: item.studentId || item.id,
      studentName: item.studentName || item.name || 'Student',
      rollNo: item.rollNo || 'CSE-2022',
      branch: item.branch || 'CSE',
      riskLevel: item.riskLevel || (item.risk ? item.risk.replace(' Risk', '') : 'Low'),
      onTimeLikelihood: item.onTimeLikelihood !== undefined ? item.onTimeLikelihood : (item.likelihood || 85),
      contributingFactors: item.contributingFactors || item.factors || ['Consistent practice pace', 'Strong lab attendance'],
      suggestedAction: item.suggestedAction || item.suggestion || 'Maintain progress and review mock interview modules.'
    }));

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px;">
        ${insights.map(item => `
          <div class="ml-insight-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <h4 style="margin: 0; font-size: 15px; color: #1E293B;">${item.studentName}</h4>
                <span style="font-size: 11.5px; color: #64748B;"><code>${item.rollNo}</code> • ${item.branch}</span>
              </div>
              <span class="badge-status ${item.riskLevel === 'High' ? 'error' : item.riskLevel === 'Medium' ? 'warning' : 'success'}">
                ${item.riskLevel} Risk
              </span>
            </div>

            <div style="background: #F8FAFC; border-radius: 8px; padding: 10px; margin: 10px 0; border: 1px solid #E2E8F0;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span>Estimated On-Time Likelihood</span>
                <strong style="color: ${item.onTimeLikelihood < 50 ? '#DC2626' : '#059669'};">${item.onTimeLikelihood}%</strong>
              </div>
              <div style="height: 6px; background: #E2E8F0; border-radius: 3px; overflow: hidden;">
                <div style="width: ${item.onTimeLikelihood}%; height: 100%; background: ${item.onTimeLikelihood < 50 ? '#DC2626' : '#059669'};"></div>
              </div>
            </div>

            <div style="font-size: 11.5px; color: #475569; margin-bottom: 8px;">
              <strong>Key Contributing Factors:</strong>
              <ul style="margin: 4px 0 0 16px; padding: 0; line-height: 1.5;">
                ${(item.contributingFactors || []).map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>

            <div style="font-size: 11.5px; background: #EFF6FF; border-left: 3px solid #2563EB; padding: 8px 10px; border-radius: 4px; color: #1E40AF; margin-bottom: 12px;">
              <strong>Suggested Support Action:</strong> ${item.suggestedAction}
            </div>

            <button class="btn-faculty-action btn-faculty-primary" style="width: 100%; justify-content: center;" onclick="openAssignTaskModal('${item.studentId}')">
              Execute Faculty Support Intervention
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderFacultyNotifications() {
    const container = document.getElementById('faculty-notifications-list-container');
    if (!container) return;

    const notifs = store.getFacultyNotifications ? store.getFacultyNotifications() : [];
    if (notifs.length === 0) {
      container.innerHTML = `<div class="empty-state-card"><div class="empty-state-title">No Notifications</div></div>`;
      return;
    }

    container.innerHTML = `
      <div class="content-panel">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${notifs.map(n => `
            <div style="padding: 12px 14px; background: ${n.read ? '#FFFFFF' : '#EFF6FF'}; border: 1px solid ${n.read ? '#E2E8F0' : '#BFDBFE'}; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 700; color: #1E293B; font-size: 13.5px;">${n.title}</div>
                <div style="color: #475569; font-size: 12px; margin-top: 2px;">${n.message}</div>
                <div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">${n.time || 'Recently'}</div>
              </div>
              ${!n.read ? `
                <button class="btn-faculty-action btn-faculty-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="store.markFacultyNotificationRead('${n.id}')">
                  Mark Read
                </button>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderFacultyProfile() {
    const f = store.data.roles.faculty;
    if (!f) return;
    const nameEl = document.getElementById('faculty-profile-name');
    const deptEl = document.getElementById('faculty-profile-dept');
    const emailEl = document.getElementById('faculty-profile-email');
    const hoursEl = document.getElementById('faculty-profile-hours');
    const cohortsEl = document.getElementById('faculty-profile-cohorts');

    if (nameEl) nameEl.value = f.name || 'Dr. Rajesh Sharma';
    if (deptEl) deptEl.value = f.department || 'Computer Science & Engineering';
    if (emailEl) emailEl.value = f.email || 'dr.rajesh.mentor@college.edu';
    if (hoursEl && f.officeHours) hoursEl.value = f.officeHours;
    if (cohortsEl && f.assignedCohorts) cohortsEl.value = f.assignedCohorts;
  }

  function renderOfficerViews() {
    const drives = store.getDrives();
    const allStudents = store.getStudents();
    const apps = store.getApplications();
    const stats = store.getStats('officer');
    const logs = store.getAuditLogs();

    // KPIs
    const placedEl = document.getElementById('kpi-officer-placed');
    const rateEl = document.getElementById('kpi-officer-rate');
    const drivesEl = document.getElementById('kpi-officer-drives');
    const totalAppsBadge = document.getElementById('officer-total-apps-badge');

    if (placedEl) placedEl.innerHTML = `${stats.placedStudents} <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary);">Placed</span>`;
    if (rateEl) rateEl.textContent = stats.placementRate;
    if (drivesEl) drivesEl.innerHTML = `${stats.activeDrivesCount} <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary);">Drives</span>`;
    if (totalAppsBadge) totalAppsBadge.textContent = `${apps.length} Active Applications`;

    // Drives management table
    const officerDrivesWrap = document.getElementById('officer-drives-table-wrap');
    if (officerDrivesWrap) {
      officerDrivesWrap.innerHTML = `
        <div class="table-container">
          <table class="saas-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Package (LPA)</th>
                <th>Min CGPA</th>
                <th>Max Backlogs</th>
                <th>Deadline</th>
                <th>Applicants</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${drives.map(d => {
                const comp = d.company || d.company_name || 'Campus Drive';
                return `
                <tr>
                  <td><strong>${comp}</strong></td>
                  <td>${d.role || d.role_title || 'Software Engineer'}</td>
                  <td><span class="badge-status success">₹${d.packageLPA || d.package_lpa || 8.0} LPA</span></td>
                  <td>${d.minCGPA || d.min_cgpa || 7.0}</td>
                  <td>${d.maxBacklogs || d.max_backlogs || 0}</td>
                  <td>${d.deadline || 'Upcoming'}</td>
                  <td><strong>${d.applicantsCount || 0}</strong> candidates</td>
                  <td><span class="badge-status blue">${d.status || 'Active'}</span></td>
                </tr>
              `;}).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // All drives list on drives tab
    const officerAllDrives = document.getElementById('officer-all-drives-list');
    if (officerAllDrives) {
      officerAllDrives.innerHTML = drives.map(d => {
        const comp = d.company || d.company_name || 'Campus Drive';
        const branches = Array.isArray(d.allowedBranches) ? d.allowedBranches : (Array.isArray(d.allowed_branches) ? d.allowed_branches : ['CSE', 'IT', 'ECE']);
        return `
        <div class="drive-list-card" style="padding: 16px;">
          <div class="drive-logo-initials" style="width: 44px; height: 44px;">${comp.slice(0, 2).toUpperCase()}</div>
          <div class="drive-info-col">
            <div class="drive-company-title">
              <span>${comp}</span>
              <span class="badge-status success">₹${d.packageLPA || d.package_lpa || 8.0} LPA</span>
            </div>
            <div class="drive-meta-text">
              <span>${d.role || d.role_title || 'Software Engineer'} • Openings: ${d.openings || 10}</span>
              <span>Cutoff: Min CGPA ${d.minCGPA || d.min_cgpa || 7.0}, Max Backlogs ${d.maxBacklogs || d.max_backlogs || 0}</span>
              <span>Branches: ${branches.join(', ')}</span>
              <span>Deadline: ${d.deadline || 'Upcoming'}</span>
              <span>Applicants: <strong>${d.applicantsCount || 0}</strong></span>
            </div>
          </div>
          <div>
            <button class="btn-outline btn-sm" onclick="navigateToRoute('/officer/applications')">Review Queue</button>
          </div>
        </div>
      `;}).join('');
    }

    // Master student registry
    const officerStudentsTbody = document.getElementById('officer-students-table-body');
    if (officerStudentsTbody) {
      officerStudentsTbody.innerHTML = allStudents.map(s => `
        <tr>
          <td><code>${s.rollNo}</code></td>
          <td><strong>${s.name}</strong></td>
          <td>${s.branch}</td>
          <td>${s.cgpa}</td>
          <td>${s.aptitude}%</td>
          <td>${s.backlogs}</td>
          <td><strong>${s.probability}%</strong></td>
          <td>
            <span class="badge-status ${s.status === 'Placed' ? 'success' : s.status === 'At Risk' ? 'error' : 'blue'}">
              ${s.status}
            </span>
          </td>
          <td>${s.placedCompany ? `<strong>${s.placedCompany} (₹${s.placedPackage} LPA)</strong>` : '—'}</td>
        </tr>
      `).join('');
    }

    // Applications & Offers Table with Action Buttons
    const officerAppsTbody = document.getElementById('officer-applications-table-body');
    if (officerAppsTbody) {
      officerAppsTbody.innerHTML = apps.map(app => {
        let badgeClass = 'blue';
        if (app.status === 'Offered') badgeClass = 'success';
        else if (app.status === 'Interview Scheduled') badgeClass = 'teal';

        const comp = app.company || 'Campus Drive';
        const rTitle = app.role || 'Software Engineer';

        return `
          <tr>
            <td><code>${app.id}</code></td>
            <td><strong>${app.studentName || 'Student'}</strong></td>
            <td>${app.rollNo || '—'}</td>
            <td>${app.branch || 'CSE'}</td>
            <td><strong>${comp}</strong></td>
            <td>${rTitle}</td>
            <td>${app.appliedDate || 'Recent'}</td>
            <td><span class="badge-status ${badgeClass}">${app.status || 'Applied'}</span></td>
            <td>
              <div style="display: flex; gap: 6px; align-items: center;">
                ${app.status !== 'Offered' ? `
                  <button class="btn-outline btn-sm" onclick="setAppStatus('${app.id}', 'Shortlisted')">Shortlist</button>
                  <button class="btn-outline btn-sm" onclick="setAppStatus('${app.id}', 'Interview Scheduled')">Interview</button>
                  <button class="btn-primary btn-sm" onclick="openIssueOfferModal('${app.id}', '${(app.studentName || 'Student').replace(/'/g, "\\'")}', '${comp.replace(/'/g, "\\'")}')">Issue Offer</button>
                ` : `
                  <span style="color: var(--success-green); font-weight: 700; font-size: 11.5px;">Offer Issued (₹${app.offerPackage || 8.0} LPA)</span>
                `}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Audit logs
    const auditLogsContainer = document.getElementById('officer-audit-log-list');
    if (auditLogsContainer) {
      auditLogsContainer.innerHTML = logs.slice(0, 6).map(log => `
        <div style="padding: 8px 10px; background: #F8FAFC; border-left: 3px solid var(--primary-blue); border-radius: var(--radius-sm); font-size: 11.5px;">
          <div style="font-weight: 600; color: var(--text-navy);">${log.action}</div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 1px;">${log.time}</div>
        </div>
      `).join('');
    }
  }

  function renderAllViews() {
    try {
      renderStudentViews();
    } catch (e) {
      console.error('[Render Student Views Error]:', e);
    }
    try {
      renderFacultyViews();
    } catch (e) {
      console.error('[Render Faculty Views Error]:', e);
    }
    try {
      renderOfficerViews();
    } catch (e) {
      console.error('[Render Officer Views Error]:', e);
    }
    try {
      updateUserProfileHeader(store.getActiveRole());
    } catch (e) {
      console.error('[Update Profile Header Error]:', e);
    }

    // Auto-direct to setup on initial load if student profile is incomplete
    if (store.getActiveRole() === 'student' && store.isLoaded) {
      const activeStudent = store.data.roles?.student;
      const isProfileIncomplete = activeStudent && (!activeStudent.cgpa || activeStudent.predictionStatus === 'Pending Setup');
      const hash = window.location.hash;
      if (isProfileIncomplete && (hash === '' || hash === '#' || hash === '#/' || hash === '#/student/dashboard' || hash === '#/student/overview')) {
        window.location.hash = '/student/profile?setup=true';
      }
    }
  }

  store.subscribe(renderAllViews);

  // --- ACTIONS & HANDLERS ---

  window.applyForDrive = function(driveId) {
    const student = store.data.roles.student;
    const res = store.applyToDrive(student.id, driveId);
    if (res.success) {
      window.showToast?.('✓ Application submitted successfully! Your profile has been sent to the T&P Cell.', 'success');
    } else {
      window.showToast?.(res.message, 'error');
    }
  };

  window.toggleTaskStatus = function(taskId) {
    const newStatus = store.toggleTaskStatus(taskId);
    window.showToast?.(newStatus === 'Completed' ? '✓ Task marked as Completed!' : 'Task marked as Pending.', 'success');
  };

  window.switchStudentDriveTab = function(tab) {
    const drivesPane = document.getElementById('student-tab-drives-content');
    const appsPane = document.getElementById('student-tab-apps-content');
    const btnDrives = document.getElementById('btn-student-tab-drives');
    const btnApps = document.getElementById('btn-student-tab-apps');

    if (tab === 'drives') {
      if (drivesPane) drivesPane.style.display = 'block';
      if (appsPane) appsPane.style.display = 'none';
      btnDrives?.classList.add('active');
      btnApps?.classList.remove('active');
    } else {
      if (drivesPane) drivesPane.style.display = 'none';
      if (appsPane) appsPane.style.display = 'block';
      btnDrives?.classList.remove('active');
      btnApps?.classList.add('active');
    }
  };

  window.switchStudentTaskTab = function(tab) {
    const tasksPane = document.getElementById('student-tab-tasks-content');
    const assessmentsPane = document.getElementById('student-tab-assessments-content');
    const btnTasks = document.getElementById('btn-student-tab-tasks');
    const btnAssessments = document.getElementById('btn-student-tab-assessments');

    if (tab === 'tasks') {
      if (tasksPane) tasksPane.style.display = 'block';
      if (assessmentsPane) assessmentsPane.style.display = 'none';
      btnTasks?.classList.add('active');
      btnAssessments?.classList.remove('active');
    } else {
      if (tasksPane) tasksPane.style.display = 'none';
      if (assessmentsPane) assessmentsPane.style.display = 'block';
      btnTasks?.classList.remove('active');
      btnAssessments?.classList.add('active');
    }
  };

  // ========================================================================
  // FACULTY DASHBOARD ACTIONS & HANDLERS
  // ========================================================================

  window.openCreateAssignmentModal = function(assignmentId = null) {
    const modal = document.getElementById('modal-create-assignment');
    if (!modal) return;

    const idInput = document.getElementById('faculty-asg-id');
    const titleInput = document.getElementById('faculty-asg-title');
    const subjectSelect = document.getElementById('faculty-asg-subject');
    const categorySelect = document.getElementById('faculty-asg-category');
    const classInput = document.getElementById('faculty-asg-class');
    const maxMarksInput = document.getElementById('faculty-asg-max-marks');
    const dueInput = document.getElementById('faculty-asg-due');
    const prioritySelect = document.getElementById('faculty-asg-priority');
    const instructionsText = document.getElementById('faculty-asg-instructions');
    const attachmentInput = document.getElementById('faculty-asg-attachment');
    const statusSelect = document.getElementById('faculty-asg-status');
    const modalTitle = document.getElementById('faculty-assignment-modal-title');

    if (assignmentId) {
      const assignment = (store.data.facultyAssignments || []).find(a => a.id === assignmentId);
      if (assignment) {
        if (modalTitle) modalTitle.textContent = 'Edit Academic Assignment';
        if (idInput) idInput.value = assignment.id;
        if (titleInput) titleInput.value = assignment.title;
        if (subjectSelect) subjectSelect.value = assignment.subject;
        if (categorySelect) categorySelect.value = assignment.category;
        if (classInput) classInput.value = assignment.targetClass;
        if (maxMarksInput) maxMarksInput.value = assignment.maxMarks;
        if (dueInput) dueInput.value = `${assignment.dueDate}T${assignment.dueTime || '23:59'}`;
        if (prioritySelect) prioritySelect.value = assignment.priority || 'Medium';
        if (instructionsText) instructionsText.value = assignment.instructions || assignment.description || '';
        if (attachmentInput) attachmentInput.value = assignment.attachment || '';
        if (statusSelect) statusSelect.value = assignment.status;
      }
    } else {
      if (modalTitle) modalTitle.textContent = 'Create New Academic Assignment';
      if (idInput) idInput.value = '';
      if (titleInput) titleInput.value = '';
      if (instructionsText) instructionsText.value = '';
      if (attachmentInput) attachmentInput.value = '';
      if (statusSelect) statusSelect.value = 'Published';
      if (dueInput) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        dueInput.value = nextWeek.toISOString().slice(0, 16);
      }
    }

    modal.style.display = 'flex';
  };

  window.closeCreateAssignmentModal = function() {
    const modal = document.getElementById('modal-create-assignment');
    if (modal) modal.style.display = 'none';
  };

  window.handleSaveFacultyAssignment = function(e) {
    e.preventDefault();
    const id = document.getElementById('faculty-asg-id').value;
    const title = document.getElementById('faculty-asg-title').value;
    const subject = document.getElementById('faculty-asg-subject').value;
    const category = document.getElementById('faculty-asg-category').value;
    const targetClass = document.getElementById('faculty-asg-class').value;
    const maxMarks = document.getElementById('faculty-asg-max-marks').value;
    const dueVal = document.getElementById('faculty-asg-due').value;
    const priority = document.getElementById('faculty-asg-priority').value;
    const instructions = document.getElementById('faculty-asg-instructions').value;
    const attachment = document.getElementById('faculty-asg-attachment').value;
    const status = document.getElementById('faculty-asg-status').value;

    const parts = dueVal.split('T');
    const dueDate = parts[0];
    const dueTime = parts[1] || '23:59';

    if (id) {
      store.updateFacultyAssignment(id, {
        title, subject, category, targetClass, maxMarks: parseInt(maxMarks, 10),
        dueDate, dueTime, priority, instructions, description: instructions, attachment, status
      });
      window.showToast?.('✓ Assignment updated successfully.', 'success');
    } else {
      store.createFacultyAssignment({
        title, subject, category, targetClass, maxMarks: parseInt(maxMarks, 10),
        dueDate, dueTime, priority, instructions, description: instructions, attachment, status
      });
      window.showToast?.(`✓ Assignment "${title}" created and ${status.toLowerCase()}!`, 'success');
    }

    closeCreateAssignmentModal();
  };

  window.deleteFacultyAssignment = function(id) {
    if (confirm('Are you sure you want to delete this assignment?')) {
      store.deleteFacultyAssignment(id);
      window.showToast?.('Assignment removed.', 'success');
    }
  };

  window.openGradeSubmissionModal = function(assignmentId, submissionId) {
    const modal = document.getElementById('modal-grade-submission');
    if (!modal) return;

    let subObj = null;
    let asgObj = null;

    if (assignmentId === 'lab') {
      const lab = (store.data.labAssignments || []).find(l => l.id === submissionId);
      if (lab) {
        asgObj = { id: 'lab', title: lab.title, maxMarks: 100 };
        const currentStudent = store.data.roles.student || {};
        subObj = { id: lab.id, studentName: lab.studentName || currentStudent.name || 'Student', rollNo: lab.rollNo || currentStudent.rollNo || '', submittedAt: lab.submittedAt, submissionUrl: lab.submissionUrl, marks: lab.grade ? parseInt(lab.grade) : null, feedback: lab.feedback || '', remarks: lab.studentRemarks || '' };
      }
    } else if (assignmentId === 'project') {
      const proj = (store.data.groupProjects || []).find(p => p.id === submissionId);
      if (proj) {
        asgObj = { id: 'project', title: proj.title, maxMarks: 100 };
        subObj = { id: proj.id, studentName: `${proj.teamLead} & Team`, rollNo: 'CSE-G04', submittedAt: 'Oct 12, 2026', submissionUrl: proj.repositoryUrl, marks: proj.facultyMarks, feedback: proj.feedback, remarks: proj.description || '' };
      }
    } else {
      asgObj = (store.data.facultyAssignments || []).find(a => a.id === assignmentId);
      if (asgObj) {
        subObj = (asgObj.submissions || []).find(s => s.id === submissionId);
      }
    }

    if (!subObj || !asgObj) return;

    document.getElementById('grade-hidden-asg-id').value = asgObj.id;
    document.getElementById('grade-hidden-sub-id').value = subObj.id;
    document.getElementById('grade-display-student-name').textContent = subObj.studentName;
    document.getElementById('grade-display-roll').textContent = subObj.rollNo;
    document.getElementById('grade-display-asg-title').textContent = asgObj.title;
    document.getElementById('grade-display-meta').textContent = `Submitted: ${subObj.submittedAt || subObj.submittedDate || 'Oct 14, 2026'} • On Time`;
    
    const linkEl = document.getElementById('grade-display-link');
    const downloadEl = document.getElementById('grade-download-link');
    const fileUrl = subObj.submissionUrl || subObj.fileUrl || '#';
    if (linkEl) linkEl.href = fileUrl;
    if (downloadEl) {
      downloadEl.href = fileUrl;
      downloadEl.setAttribute('download', subObj.fileName || 'submission_file');
    }

    const remarksEl = document.getElementById('grade-display-student-remarks');
    if (remarksEl) remarksEl.textContent = subObj.remarks || subObj.studentRemarks || 'No student remarks provided.';

    document.getElementById('grade-input-marks').value = subObj.marks != null ? subObj.marks : '';
    document.getElementById('grade-display-max-marks').value = asgObj.maxMarks || 50;
    document.getElementById('grade-input-feedback').value = subObj.feedback || '';

    const strengthsEl = document.getElementById('grade-input-strengths');
    if (strengthsEl) strengthsEl.value = subObj.strengths || '';

    const improvementsEl = document.getElementById('grade-input-improvements');
    if (improvementsEl) improvementsEl.value = subObj.improvements || '';

    const nextStepsEl = document.getElementById('grade-input-next-steps');
    if (nextStepsEl) nextStepsEl.value = subObj.nextSteps || '';

    const resubmitBox = document.getElementById('grade-checkbox-resubmit');
    if (resubmitBox) resubmitBox.checked = !!subObj.isRevisionRequested;

    modal.style.display = 'flex';
  };

  window.closeGradeSubmissionModal = function() {
    const modal = document.getElementById('modal-grade-submission');
    if (modal) modal.style.display = 'none';
  };

  window.handleSaveGradeSubmission = async function(e) {
    e.preventDefault();
    const asgId = document.getElementById('grade-hidden-asg-id').value;
    const subId = document.getElementById('grade-hidden-sub-id').value;
    const marks = parseFloat(document.getElementById('grade-input-marks').value);
    const maxMarks = parseFloat(document.getElementById('grade-display-max-marks').value || '50');
    const feedback = document.getElementById('grade-input-feedback').value;
    const strengths = document.getElementById('grade-input-strengths')?.value || '';
    const improvements = document.getElementById('grade-input-improvements')?.value || '';
    const nextSteps = document.getElementById('grade-input-next-steps')?.value || '';
    const isRevisionRequested = document.getElementById('grade-checkbox-resubmit')?.checked || false;
    const isPublished = document.getElementById('grade-select-status').value === 'Graded';

    if (isNaN(marks) || marks < 0 || marks > maxMarks) {
      window.showToast?.(`Awarded marks must be between 0 and maximum points (${maxMarks})`, 'error');
      return;
    }

    if (asgId === 'lab') {
      store.gradeLabAssignment(subId, marks, feedback);
      window.showToast?.('✓ Lab evaluation saved and updated on student dashboard.', 'success');
    } else if (asgId === 'project') {
      store.gradeGroupProject(subId, marks, feedback);
      window.showToast?.('✓ Project milestone marks saved and published.', 'success');
    } else {
      await store.gradeAssignment('faculty', asgId, {
        submissionId: subId,
        marks,
        feedback,
        strengths,
        improvements,
        nextSteps,
        isRevisionRequested,
        publish: isPublished
      });
      window.showToast?.(isRevisionRequested
        ? '✓ Revision request recorded and communicated to student.'
        : '✓ Student evaluation published and synchronized with student portal.',
        'success'
      );
    }

    closeGradeSubmissionModal();

    if (typeof renderFacultySubmissionsQueue === 'function') renderFacultySubmissionsQueue();
    if (typeof renderFacultyAssignments === 'function') renderFacultyAssignments();
    if (typeof renderStudentAssignments === 'function') renderStudentAssignments(store.data.roles.student);
    if (typeof renderStudentViews === 'function') renderStudentViews();
  };

  window.filterFacultyAssignments = function(filterType) {
    window.facultyAssignmentFilter = filterType;
    document.querySelectorAll('.filter-tab-bar .btn-filter-tab').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filterType);
    });
    renderFacultyAssignments();
  };

  window.filterFacultyStudentsList = function(query) {
    window.facultyStudentSearchQuery = query;
    renderFacultyStudents();
  };

  window.downloadFacultyCSV = function(type) {
    const csvContent = store.exportReportCSV ? store.exportReportCSV(type) : 'ID,Name,Value\n1,Demo,100';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `studyflow_${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.showToast?.(`✓ Report exported: ${type.toUpperCase()} records saved.`, 'success');
  };

  window.handleSaveFacultyProfile = function(e) {
    e.preventDefault();
    const name = document.getElementById('faculty-profile-name').value;
    const dept = document.getElementById('faculty-profile-dept').value;
    const email = document.getElementById('faculty-profile-email').value;
    const hours = document.getElementById('faculty-profile-hours').value;
    const cohorts = document.getElementById('faculty-profile-cohorts').value;

    if (store.data.roles.faculty) {
      store.data.roles.faculty.name = name;
      store.data.roles.faculty.department = dept;
      store.data.roles.faculty.email = email;
      store.data.roles.faculty.officeHours = hours;
      store.data.roles.faculty.assignedCohorts = cohorts;
      store.save();
    }
    window.showToast?.('✓ Faculty profile updated.', 'success');
  };

  window.openAssignTaskModal = function(preselectedStudentId = null) {
    const modal = document.getElementById('modal-assign-task');
    if (modal) {
      const select = document.getElementById('task-select-student');
      if (select) {
        const students = store.data.students || [];
        if (students.length === 0) {
          select.innerHTML = '<option value="">No registered students found</option>';
        } else {
          select.innerHTML = students.map(s => `
            <option value="${s.id}">${s.name} (${s.rollNo || s.email} - ${s.cgpa ? s.cgpa + ' CGPA' : 'Pending CGPA'})</option>
          `).join('');
        }
        if (preselectedStudentId) select.value = preselectedStudentId;
      }
      modal.style.display = 'flex';
    }
  };

  window.handleAssignTaskSubmit = function(e) {
    e.preventDefault();
    const studentId = document.getElementById('task-select-student').value;
    const title = document.getElementById('task-input-title').value;
    const dueDate = document.getElementById('task-input-due').value;
    const priority = document.getElementById('task-select-priority').value;
    const notes = document.getElementById('task-input-notes').value;

    store.assignTask({ studentId, title, dueDate, priority, notes });
    closeModal('modal-assign-task');
    window.showToast?.(`✓ Task "${title}" assigned to mentee successfully.`, 'success');
  };

  window.handleSaveMentorNote = function(e) {
    e.preventDefault();
    const studentId = document.getElementById('note-student-select').value;
    const noteText = document.getElementById('note-content-input').value;

    store.addMentorNote(studentId, noteText);
    document.getElementById('note-content-input').value = '';
    window.showToast?.('✓ Counseling meeting note recorded.', 'success');
  };

  window.openCreateDriveModal = function() {
    const modal = document.getElementById('modal-create-drive');
    if (modal) modal.style.display = 'flex';
  };

  window.handleCreateDriveSubmit = function(e) {
    e.preventDefault();
    const company = document.getElementById('drive-input-company').value;
    const role = document.getElementById('drive-input-role').value;
    const packageLPA = document.getElementById('drive-input-ctc').value;
    const minCGPA = document.getElementById('drive-input-cgpa').value;
    const maxBacklogs = document.getElementById('drive-input-backlogs').value;
    const deadline = document.getElementById('drive-input-deadline').value;
    const location = document.getElementById('drive-input-location').value;

    store.createDrive({
      company,
      role,
      packageLPA,
      minCGPA,
      maxBacklogs,
      deadline,
      location,
      allowedBranches: ['CSE', 'IT', 'ECE']
    });

    closeModal('modal-create-drive');
    window.showToast?.(`✓ Drive for ${company} published successfully!`, 'success');
  };

  window.setAppStatus = function(appId, newStatus) {
    store.updateApplicationStatus(appId, newStatus);
    window.showToast?.(`Application status updated to "${newStatus}".`, 'info');
  };

  window.openIssueOfferModal = function(appId, studentName, company) {
    const modal = document.getElementById('modal-issue-offer');
    if (!modal) return;

    document.getElementById('offer-hidden-app-id').value = appId;
    document.getElementById('offer-display-student').value = studentName;
    document.getElementById('offer-display-company').value = company;
    modal.style.display = 'flex';
  };

  window.handleIssueOfferSubmit = function(e) {
    e.preventDefault();
    const appId = document.getElementById('offer-hidden-app-id').value;
    const packageLPA = document.getElementById('offer-input-package').value;

    store.updateApplicationStatus(appId, 'Offered', packageLPA);
    closeModal('modal-issue-offer');
    window.showToast?.(`🎉 Official Offer Letter issued! Candidate marked as Placed.`, 'success');
  };

  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
  };

  window.openStudentProfileModal = function(studentId) {
    const student = store.getStudentById(studentId);
    if (!student) return;

    const modal = document.getElementById('modal-student-profile');
    const nameEl = document.getElementById('profile-modal-name');
    const contentEl = document.getElementById('profile-modal-content');

    if (nameEl) nameEl.textContent = `${student.name} (${student.rollNo})`;
    if (contentEl) {
      contentEl.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
          <div style="background: #F8FAFC; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 11px; color: var(--text-secondary);">Branch & Dept</div>
            <div style="font-size: 13.5px; font-weight: 700; color: var(--text-navy);">${student.branch}</div>
          </div>
          <div style="background: #F8FAFC; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 11px; color: var(--text-secondary);">CGPA</div>
            <div style="font-size: 13.5px; font-weight: 700; color: var(--primary-blue);">${student.cgpa} / 10.0</div>
          </div>
          <div style="background: #F8FAFC; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 11px; color: var(--text-secondary);">Aptitude Score</div>
            <div style="font-size: 13.5px; font-weight: 700; color: var(--teal-accent);">${student.aptitude}%</div>
          </div>
          <div style="background: #F8FAFC; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 11px; color: var(--text-secondary);">Active Backlogs</div>
            <div style="font-size: 13.5px; font-weight: 700; color: ${student.backlogs > 0 ? 'var(--error-red)' : 'var(--success-green)'};">${student.backlogs} Backlogs</div>
          </div>
        </div>

        <div style="background: var(--primary-blue-light); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: 600; color: var(--primary-navy);">Placement Probability</span>
            <span style="font-size: 16px; font-weight: 800; color: var(--primary-blue);">${student.probability}%</span>
          </div>
          <p style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">Assigned Mentor: ${student.mentorName || 'Dr. Rajesh Sharma'}</p>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn-outline btn-sm" onclick="closeModal('modal-student-profile')">Close</button>
          <button class="btn-primary btn-sm" onclick="closeModal('modal-student-profile'); openAssignTaskModal('${student.id}');">Assign Preparation Task</button>
        </div>
      `;
    }

    if (modal) modal.style.display = 'flex';
  };

  window.exportMenteeCSV = function() {
    const mentees = store.getMentees('fac_001');
    let csv = "RollNo,Name,Branch,CGPA,Aptitude,Backlogs,PlacementProbability,Status\n";
    mentees.forEach(m => {
      csv += `"${m.rollNo}","${m.name}","${m.branch}",${m.cgpa},${m.aptitude},${m.backlogs},${m.probability}%,"${m.status}"\n`;
    });
    downloadCSVFile(csv, 'CSE_Mentee_Placement_Readiness_Report.csv');
  };

  window.exportPlacedStudentsCSV = function() {
    const students = store.getStudents();
    let csv = "RollNo,Name,Branch,CGPA,Aptitude,Backlogs,PlacementProbability,PlacementStatus,PlacedCompany,OfferedPackageLPA\n";
    students.forEach(s => {
      csv += `"${s.rollNo}","${s.name}","${s.branch}",${s.cgpa},${s.aptitude},${s.backlogs},${s.probability}%,"${s.status}","${s.placedCompany || 'N/A'}",${s.placedPackage || 'N/A'}\n`;
    });
    downloadCSVFile(csv, 'College_Placement_Master_Report_2026.csv');
  };

  function downloadCSVFile(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  window.updateSimulation = function() {
    const cgpa = parseFloat(document.getElementById('slider-cgpa')?.value || 8.1);
    const apt = parseInt(document.getElementById('slider-apt')?.value || 78, 10);
    const tech = parseInt(document.getElementById('slider-tech')?.value || 8, 10);
    const intern = parseInt(document.getElementById('slider-intern')?.value || 1, 10);
    const backlogs = parseInt(document.getElementById('slider-backlogs')?.value || 0, 10);

    const cgpaVal = document.getElementById('slider-cgpa-val');
    const aptVal = document.getElementById('slider-apt-val');
    const techVal = document.getElementById('slider-tech-val');
    const internVal = document.getElementById('slider-intern-val');
    const backlogsVal = document.getElementById('slider-backlogs-val');

    if (cgpaVal) cgpaVal.textContent = cgpa.toFixed(1);
    if (aptVal) aptVal.textContent = apt;
    if (techVal) techVal.textContent = tech;
    if (internVal) internVal.textContent = intern;
    if (backlogsVal) backlogsVal.textContent = backlogs;

    let rawScore = (cgpa * 6.5) + (apt * 0.35) + (tech * 2.6) + (intern * 3.5) - (backlogs * 14.0);
    let prob = Math.min(98, Math.max(20, Math.round(rawScore * 0.88)));
    const isPlaced = (prob >= 60 && backlogs <= 1);

    const statusTitle = document.getElementById('sim-status-title');
    const probTitle = document.getElementById('sim-prob-title');
    const explText = document.getElementById('sim-explanation-text');

    if (statusTitle && probTitle) {
      if (isPlaced) {
        statusTitle.textContent = 'PLACED';
        statusTitle.style.color = 'var(--success-green)';
        probTitle.textContent = `${prob}% Probability`;
        probTitle.style.color = 'var(--teal-accent)';
        if (explText) explText.textContent = `High probability of clearing campus placements for Dream / Super Dream recruitment drives.`;
      } else {
        statusTitle.textContent = 'NOT PLACED / AT RISK';
        statusTitle.style.color = 'var(--error-red)';
        probTitle.textContent = `${prob}% Probability`;
        probTitle.style.color = 'var(--error-red)';
        if (explText) explText.textContent = `Placement probability below cutoff threshold. Clearing backlogs and improving aptitude score above 65 is strongly recommended.`;
      }
    }
  };

  window.openAIAssistant = function() {
    const modal = document.getElementById('ai-assistant-modal');
    if (modal) modal.style.display = 'flex';
  };

  window.closeAIAssistant = function() {
    const modal = document.getElementById('ai-assistant-modal');
    if (modal) modal.style.display = 'none';
  };

  window.sendModalAIChat = function() {
    const input = document.getElementById('ai-modal-input');
    const box = document.getElementById('ai-modal-messages');
    if (!input || !box || !input.value.trim()) return;

    const userText = input.value.trim();
    box.innerHTML += `<p style="margin-top: 8px;"><strong>You:</strong> ${userText}</p>`;
    input.value = '';

    setTimeout(() => {
      let reply = "Practicing 15-20 medium LeetCode algorithms on Graphs and Trees alongside maintaining a 75+ Aptitude score yields a 92% placement probability in campus tech drives.";
      if (userText.toLowerCase().includes('microsoft')) {
        reply = "For Microsoft's campus drive (18.0 LPA), the technical rounds prioritize Distributed Systems fundamentals, Operating Systems concurrency, and Dynamic Programming.";
      } else if (userText.toLowerCase().includes('backlog')) {
        reply = "Campus recruiters require 0 active backlogs at the time of joining. Schedule backlog remedial exams immediately to unlock 100% eligibility.";
      }
      box.innerHTML += `<p style="color: var(--primary-blue); margin-top: 6px;"><strong>AI Mentor:</strong> ${reply}</p>`;
      box.scrollTop = box.scrollHeight;
    }, 400);
  };

  window.sendChatMessage = function() {
    const input = document.getElementById('assistant-input-box');
    const container = document.getElementById('assistant-chat-messages');
    if (!input || !container || !input.value.trim()) return;

    const q = input.value.trim();
    container.innerHTML += `
      <div style="background: var(--primary-blue-light); border-radius: var(--radius-md); padding: 10px 14px; max-width: 80%; align-self: flex-end;">
        <div style="font-size: 11px; font-weight: 700; color: var(--primary-blue); margin-bottom: 2px;">You</div>
        <p style="font-size: 13px; color: var(--primary-navy);">${q}</p>
      </div>
    `;
    input.value = '';

    setTimeout(() => {
      container.innerHTML += `
        <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px 14px; max-width: 80%;">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 2px;">Placement AI Mentor</div>
          <p style="font-size: 13px; color: var(--text-navy);">For technical campus recruitment, articulate your problem-solving method using the STAR framework. Highlight your time complexity optimizations and test edge cases proactively.</p>
        </div>
      `;
      container.scrollTop = container.scrollHeight;
    }, 450);
  };

  window.sendQuickPrompt = function(promptText) {
    const input = document.getElementById('assistant-input-box');
    if (input) {
      input.value = promptText;
      window.sendChatMessage();
    }
  };

  window.handleResumeUpload = function(e) {
    const file = e.target.files[0];
    if (file) {
      const filenameLabel = document.getElementById('resume-filename');
      if (filenameLabel) filenameLabel.textContent = file.name;
      window.showToast?.(`✓ Resume "${file.name}" uploaded and parsed! ATS Score: 82/100 (Strong Match).`, 'success');
    }
  };

  window.showNotificationsAlert = function() {
    window.showToast?.('🔔 Latest Announcement: Microsoft Cloud Drive application deadline is Oct 28.', 'info');
  };

  // --- THEME TOGGLE (LIGHT / DARK) ---
  window.toggleTheme = function(mode) {
    const isDark = mode === 'dark';
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.getElementById('btn-theme-dark')?.classList.add('active');
      document.getElementById('btn-theme-light')?.classList.remove('active');
      localStorage.setItem('spp_theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      document.getElementById('btn-theme-light')?.classList.add('active');
      document.getElementById('btn-theme-dark')?.classList.remove('active');
      localStorage.setItem('spp_theme', 'light');
    }
  };

  // Restore saved theme on initial load
  const savedTheme = localStorage.getItem('spp_theme');
  if (savedTheme === 'dark') {
    window.toggleTheme('dark');
  } else {
    window.toggleTheme('light');
  }

  // --- STUDENT PROFILE ACTIONS & MODALS ---
  window.openEditProfileModal = function() {
    const s = store.data.roles.student;
    if (!s) return;
    const nameInput = document.getElementById('edit-sp-name');
    const emailInput = document.getElementById('edit-sp-email');
    const phoneInput = document.getElementById('edit-sp-phone');
    const locInput = document.getElementById('edit-sp-location');
    const degInput = document.getElementById('edit-sp-degree');
    const branchInput = document.getElementById('edit-sp-branch');
    const collegeInput = document.getElementById('edit-sp-college');
    const yearSelect = document.getElementById('edit-sp-year');

    if (nameInput) nameInput.value = (s.name && s.name !== 'Student Profile') ? s.name : (localStorage.getItem('spp_user_name') || '');
    if (emailInput) emailInput.value = s.email || localStorage.getItem('spp_user_email') || '';
    if (phoneInput) phoneInput.value = s.phone || '';
    if (locInput) locInput.value = (s.city && s.state) ? `${s.city}, ${s.state}` : (s.city || s.state || '');
    if (degInput) degInput.value = s.degree || 'B.Tech';
    if (branchInput) branchInput.value = s.branch || '';
    if (collegeInput) collegeInput.value = s.college || '';
    if (yearSelect) yearSelect.value = s.currentYear || '1st Year';

    openModal('modal-edit-student-profile');
  };

  // Toast Notification Helper
  window.showToast = function(message, type = 'success') {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    const icon = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
    toast.innerHTML = `<span style="font-weight: bold; font-size: 15px; margin-right: 4px;">${icon}</span> <span>${message}</span>`;
    toast.className = `toast-notification ${type} show`;

    if (window._toastTimeout) clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  window.handleSaveStudentProfile = async function(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const origText = submitBtn ? submitBtn.textContent : 'Save Changes';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }

    try {
      const locVal = document.getElementById('edit-sp-location')?.value || '';
      const parts = locVal.split(',');
      const city = parts[0]?.trim() || '';
      const state = parts[1]?.trim() || '';

      await store.updateStudentProfile({
        name: document.getElementById('edit-sp-name')?.value?.trim() || store.data.roles.student.name || 'Student',
        email: document.getElementById('edit-sp-email')?.value?.trim() || store.data.roles.student.email || '',
        phone: document.getElementById('edit-sp-phone')?.value?.trim() || '',
        degree: document.getElementById('edit-sp-degree')?.value?.trim() || 'B.Tech',
        branch: document.getElementById('edit-sp-branch')?.value?.trim() || 'Computer Science & Engineering',
        college: document.getElementById('edit-sp-college')?.value?.trim() || 'College of Engineering',
        currentYear: document.getElementById('edit-sp-year')?.value || '1st Year',
        city: city,
        state: state
      });

      closeModal('modal-edit-student-profile');
      showToast('Student profile details updated and saved to SQLite database!', 'success');
      try {
        renderAllViews();
      } catch (renderErr) {
        console.error('[renderAllViews post-save error]:', renderErr);
      }

      // If academic scores are still pending, prompt student to complete academic scores next
      const currentStudent = store.data.roles?.student || {};
      if (!currentStudent.cgpa || currentStudent.predictionStatus === 'Pending Setup') {
        showToast('✓ Identity saved! Next: Update your academic scores to complete setup.', 'info');
        setTimeout(() => {
          if (typeof openEditAcademicModal === 'function') {
            openEditAcademicModal();
          }
        }, 500);
      }
    } catch (err) {
      console.error('[Profile Save Error]:', err);
      showToast('Failed to save profile: ' + (err.message || 'Server error'), 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = origText;
      }
    }
  };

  window.calcAttendancePct = function() {
    const att = parseFloat(document.getElementById('edit-sp-classes-attended')?.value);
    const cond = parseFloat(document.getElementById('edit-sp-classes-conducted')?.value);
    const pctInput = document.getElementById('edit-sp-attendance-pct');
    if (!isNaN(att) && !isNaN(cond) && cond > 0 && pctInput) {
      pctInput.value = Math.min(100, Math.max(0, Math.round((att / cond) * 1000) / 10));
    }
  };

  window._selectedMarksheetFile = null;
  window._extractedSubjectsList = [];

  window.handleMarksheetFileSelect = function(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    window._selectedMarksheetFile = file;

    const label = document.getElementById('marksheet-file-label');
    const statusBox = document.getElementById('marksheet-upload-status');
    const nameEl = document.getElementById('marksheet-selected-filename');

    if (label) label.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    if (nameEl) nameEl.textContent = `📄 ${file.name}`;
    if (statusBox) statusBox.style.display = 'flex';
  };

  window.extractMarksheetData = async function() {
    const file = window._selectedMarksheetFile;
    if (!file) {
      showToast('Please select a report-card file (PDF, PNG, JPG) first.', 'info');
      return;
    }

    const btn = document.getElementById('btn-extract-marks');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Extracting...';
    }

    try {
      const reader = new FileReader();
      reader.onload = async function() {
        try {
          const base64Data = reader.result;
          const sem = document.getElementById('edit-sp-current-semester')?.value || 'Semester 5';
          const yr = document.getElementById('edit-sp-current-year')?.value || '3rd Year';

          const res = await sendBackendMutation('/api/student/marksheet/upload', 'POST', {
            fileName: file.name,
            fileData: base64Data,
            semester: sem,
            academicYear: yr
          });

          if (res && res.extractedData) {
            const ext = res.extractedData;
            window._extractedSubjectsList = ext.subjects || [];

            if (ext.cgpa !== undefined && ext.cgpa !== null) {
              const cgpaInput = document.getElementById('edit-sp-cgpa');
              if (cgpaInput && !cgpaInput.value) cgpaInput.value = ext.cgpa;
            }
            if (ext.marksAverage !== undefined && ext.marksAverage !== null) {
              const mAvg = document.getElementById('edit-sp-marks-avg');
              if (mAvg) mAvg.value = ext.marksAverage;
            }
            if (ext.attendancePct !== undefined && ext.attendancePct !== null) {
              const attInput = document.getElementById('edit-sp-attendance-pct');
              if (attInput && !attInput.value) attInput.value = ext.attendancePct;
            }
            if (ext.classesAttended !== undefined && ext.classesAttended !== null) {
              const attClasses = document.getElementById('edit-sp-classes-attended');
              if (attClasses && !attClasses.value) attClasses.value = ext.classesAttended;
            }
            if (ext.classesConducted !== undefined && ext.classesConducted !== null) {
              const condClasses = document.getElementById('edit-sp-classes-conducted');
              if (condClasses && !condClasses.value) condClasses.value = ext.classesConducted;
            }
            if (ext.quizAverage !== undefined && ext.quizAverage !== null) {
              const quizIn = document.getElementById('edit-sp-quiz-avg');
              if (quizIn && !quizIn.value) quizIn.value = ext.quizAverage;
            }
            if (ext.internalAverage !== undefined && ext.internalAverage !== null) {
              const intIn = document.getElementById('edit-sp-internal-avg');
              if (intIn && !intIn.value) intIn.value = ext.internalAverage;
            }

            renderExtractedSubjectsTable(window._extractedSubjectsList);
            showToast('✓ Marksheet data extracted! Review and verify marks below.', 'success');
          }
        } catch (err) {
          console.error('[Extractor Error]:', err);
          showToast('Failed to extract marksheet: ' + err.message, 'error');
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'Extract Marks';
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Extract Marks';
      }
      showToast('Error reading file: ' + err.message, 'error');
    }
  };

  window.renderExtractedSubjectsTable = function(subjects) {
    const tbody = document.getElementById('extracted-subjects-tbody');
    const panel = document.getElementById('extracted-marks-review-panel');
    if (!tbody || !panel) return;

    if (!Array.isArray(subjects) || subjects.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94A3B8; padding: 12px;">No subjects added yet. Click "+ Add Subject" to manually add records.</td></tr>`;
      panel.style.display = 'block';
      return;
    }

    panel.style.display = 'block';
    tbody.innerHTML = subjects.map((s, idx) => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 4px 6px;">
          <input type="text" class="form-input" style="padding: 4px 6px; font-size: 11px;" value="${s.code || ''}" onchange="updateExtractedSubject(${idx}, 'code', this.value)">
        </td>
        <td style="padding: 4px 6px;">
          <input type="text" class="form-input" style="padding: 4px 6px; font-size: 11px;" value="${s.name || s.subjectName || ''}" onchange="updateExtractedSubject(${idx}, 'name', this.value)">
        </td>
        <td style="padding: 4px 6px;">
          <input type="number" class="form-input" style="padding: 4px 6px; font-size: 11px; width: 60px;" value="${s.marksObtained !== undefined ? s.marksObtained : (s.currentMark || '')}" onchange="updateExtractedSubject(${idx}, 'marksObtained', parseFloat(this.value))">
        </td>
        <td style="padding: 4px 6px;">
          <input type="number" class="form-input" style="padding: 4px 6px; font-size: 11px; width: 60px;" value="${s.maxMarks || 100}" onchange="updateExtractedSubject(${idx}, 'maxMarks', parseFloat(this.value))">
        </td>
        <td style="padding: 4px 6px;">
          <input type="text" class="form-input" style="padding: 4px 6px; font-size: 11px; width: 50px;" value="${s.grade || 'A'}" onchange="updateExtractedSubject(${idx}, 'grade', this.value)">
        </td>
        <td style="padding: 4px 6px;">
          <input type="number" step="0.5" class="form-input" style="padding: 4px 6px; font-size: 11px; width: 45px;" value="${s.credits || 3}" onchange="updateExtractedSubject(${idx}, 'credits', parseFloat(this.value))">
        </td>
        <td style="padding: 4px 6px; text-align: center;">
          <button type="button" style="border: none; background: transparent; cursor: pointer; color: #DC2626; font-size: 14px;" onclick="removeExtractedSubjectRow(${idx})" title="Remove Subject">✕</button>
        </td>
      </tr>
    `).join('');
  };

  window.updateExtractedSubject = function(idx, field, value) {
    if (window._extractedSubjectsList && window._extractedSubjectsList[idx]) {
      window._extractedSubjectsList[idx][field] = value;
      if (field === 'marksObtained' || field === 'maxMarks') {
        const totalObt = window._extractedSubjectsList.reduce((sum, s) => sum + (parseFloat(s.marksObtained || s.currentMark) || 0), 0);
        const totalMax = window._extractedSubjectsList.reduce((sum, s) => sum + (parseFloat(s.maxMarks) || 100), 0);
        if (totalMax > 0) {
          const avg = Math.round((totalObt / totalMax) * 1000) / 10;
          const mAvg = document.getElementById('edit-sp-marks-avg');
          if (mAvg) mAvg.value = avg;
        }
      }
    }
  };

  window.addExtractedSubjectRow = function() {
    if (!window._extractedSubjectsList) window._extractedSubjectsList = [];
    window._extractedSubjectsList.push({
      code: 'CS' + (500 + window._extractedSubjectsList.length + 1),
      name: 'New Coursework Subject',
      marksObtained: 80,
      maxMarks: 100,
      grade: 'A',
      credits: 3
    });
    renderExtractedSubjectsTable(window._extractedSubjectsList);
  };

  window.removeExtractedSubjectRow = function(idx) {
    if (window._extractedSubjectsList && window._extractedSubjectsList[idx] !== undefined) {
      window._extractedSubjectsList.splice(idx, 1);
      renderExtractedSubjectsTable(window._extractedSubjectsList);
    }
  };

  window.openEditAcademicModal = function() {
    const s = store.data.roles.student;
    if (!s) return;
    const profile = s.academicProfile || {};

    const curYr = document.getElementById('edit-sp-current-year');
    const curSem = document.getElementById('edit-sp-current-semester');
    const cgpa = document.getElementById('edit-sp-cgpa');
    const prevCgpa = document.getElementById('edit-sp-prev-cgpa');
    const marksAvg = document.getElementById('edit-sp-marks-avg');
    const backlogs = document.getElementById('edit-sp-backlogs');

    const attended = document.getElementById('edit-sp-classes-attended');
    const conducted = document.getElementById('edit-sp-classes-conducted');
    const attPct = document.getElementById('edit-sp-attendance-pct');
    const quizAvg = document.getElementById('edit-sp-quiz-avg');
    const intAvg = document.getElementById('edit-sp-internal-avg');
    const techSkills = document.getElementById('edit-sp-tech-skills');

    if (curYr) curYr.value = s.currentYear || '3rd Year';
    if (curSem) curSem.value = s.semester || 'Semester 5';
    if (cgpa) cgpa.value = (s.cgpa !== null && s.cgpa !== undefined) ? s.cgpa : '';
    if (prevCgpa) prevCgpa.value = (s.prevYearCgpa !== null && s.prevYearCgpa !== undefined) ? s.prevYearCgpa : '';
    if (marksAvg) marksAvg.value = (s.marksAverage !== null && s.marksAverage !== undefined) ? s.marksAverage : (profile.currentMarksPct || '');
    if (backlogs) backlogs.value = (s.backlogs !== null && s.backlogs !== undefined) ? s.backlogs : 0;

    if (attended) attended.value = (s.classesAttended !== null && s.classesAttended !== undefined) ? s.classesAttended : '';
    if (conducted) conducted.value = (s.classesConducted !== null && s.classesConducted !== undefined) ? s.classesConducted : '';
    if (attPct) attPct.value = (s.attendancePct !== null && s.attendancePct !== undefined) ? s.attendancePct : (profile.attendancePct || '');
    if (quizAvg) quizAvg.value = (s.quizAvg !== null && s.quizAvg !== undefined) ? s.quizAvg : (profile.quizAverage || '');
    if (intAvg) intAvg.value = (s.internalAvg !== null && s.internalAvg !== undefined) ? s.internalAvg : (profile.internalAverage || '');

    if (techSkills) {
      if (Array.isArray(s.technicalSkills) && s.technicalSkills.length > 0) {
        techSkills.value = s.technicalSkills.join(', ');
      } else if (Array.isArray(s.skills) && s.skills.length > 0) {
        techSkills.value = s.skills.join(', ');
      } else {
        techSkills.value = '';
      }
    }

    const tenthSchool = document.getElementById('edit-sp-tenth-school');
    const tenthBoard = document.getElementById('edit-sp-tenth-board');
    const tenthPct = document.getElementById('edit-sp-tenth-pct');
    const tenthYear = document.getElementById('edit-sp-tenth-year');

    const twCollege = document.getElementById('edit-sp-twelfth-college');
    const twStream = document.getElementById('edit-sp-twelfth-stream');
    const twBoard = document.getElementById('edit-sp-twelfth-board');
    const twPct = document.getElementById('edit-sp-twelfth-pct');
    const twYear = document.getElementById('edit-sp-twelfth-year');

    if (tenthSchool) tenthSchool.value = s.tenthSchool || '';
    if (tenthBoard) tenthBoard.value = s.tenthBoard || '';
    if (tenthPct) tenthPct.value = (s.tenthPct !== null && s.tenthPct !== undefined) ? s.tenthPct : '';
    if (tenthYear) tenthYear.value = s.tenthYear || '';

    if (twCollege) twCollege.value = s.twelfthCollege || '';
    if (twStream) twStream.value = s.twelfthStream || '';
    if (twBoard) twBoard.value = s.twelfthBoard || '';
    if (twPct) twPct.value = (s.twelfthPct !== null && s.twelfthPct !== undefined) ? s.twelfthPct : '';
    if (twYear) twYear.value = s.twelfthYear || '';

    // Extracted subject marks
    const existingSubjects = (profile && Array.isArray(profile.subjects) && profile.subjects.length > 0)
      ? profile.subjects
      : (Array.isArray(s.subjects) ? s.subjects : []);

    if (existingSubjects.length > 0) {
      window._extractedSubjectsList = [...existingSubjects];
      renderExtractedSubjectsTable(window._extractedSubjectsList);
    } else {
      window._extractedSubjectsList = [];
      const reviewPanel = document.getElementById('extracted-marks-review-panel');
      if (reviewPanel) reviewPanel.style.display = 'none';
    }

    openModal('modal-edit-academic-scores');
  };

  window.handleSaveAcademicScores = async function(e, isDraft = false) {
    if (e && e.preventDefault) e.preventDefault();
    const form = document.getElementById('form-edit-academic-scores');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    const origText = submitBtn ? submitBtn.textContent : 'Verify & Save Complete Profile';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = isDraft ? 'Saving Draft...' : 'Verifying & Saving...';
    }

    try {
      const curYr = document.getElementById('edit-sp-current-year')?.value || '3rd Year';
      const curSem = document.getElementById('edit-sp-current-semester')?.value || 'Semester 5';
      const cgpaVal = document.getElementById('edit-sp-cgpa')?.value;
      const prevCgpaVal = document.getElementById('edit-sp-prev-cgpa')?.value;
      const marksAvgVal = document.getElementById('edit-sp-marks-avg')?.value;
      const backlogsVal = document.getElementById('edit-sp-backlogs')?.value;

      const attendedVal = document.getElementById('edit-sp-classes-attended')?.value;
      const conductedVal = document.getElementById('edit-sp-classes-conducted')?.value;
      const attPctVal = document.getElementById('edit-sp-attendance-pct')?.value;
      const quizAvgVal = document.getElementById('edit-sp-quiz-avg')?.value;
      const intAvgVal = document.getElementById('edit-sp-internal-avg')?.value;
      const techSkillsVal = document.getElementById('edit-sp-tech-skills')?.value || '';

      const tenthPctVal = document.getElementById('edit-sp-tenth-pct')?.value;
      const twelfthPctVal = document.getElementById('edit-sp-twelfth-pct')?.value;

      if (!isDraft && !cgpaVal && (!window._extractedSubjectsList || window._extractedSubjectsList.length === 0)) {
        throw new Error('Please enter your CGPA or upload a marksheet to complete your profile verification.');
      }

      await store.updateStudentAcademic({
        currentYear: curYr,
        year: curYr,
        semester: curSem,
        cgpa: cgpaVal !== '' && cgpaVal !== undefined ? parseFloat(cgpaVal) : null,
        prevYearCgpa: prevCgpaVal !== '' && prevCgpaVal !== undefined ? parseFloat(prevCgpaVal) : null,
        marksAverage: marksAvgVal !== '' && marksAvgVal !== undefined ? parseFloat(marksAvgVal) : null,
        backlogs: backlogsVal !== '' && backlogsVal !== undefined ? parseInt(backlogsVal, 10) : 0,

        classesAttended: attendedVal !== '' && attendedVal !== undefined ? parseInt(attendedVal, 10) : null,
        classesConducted: conductedVal !== '' && conductedVal !== undefined ? parseInt(conductedVal, 10) : null,
        attendancePct: attPctVal !== '' && attPctVal !== undefined ? parseFloat(attPctVal) : null,
        quizAvg: quizAvgVal !== '' && quizAvgVal !== undefined ? parseFloat(quizAvgVal) : null,
        internalAvg: intAvgVal !== '' && intAvgVal !== undefined ? parseFloat(intAvgVal) : null,
        technicalSkills: techSkillsVal.split(',').map(s => s.trim()).filter(Boolean),

        subjects: window._extractedSubjectsList || [],
        reportCardFileName: window._selectedMarksheetFile ? window._selectedMarksheetFile.name : null,
        isDraft: Boolean(isDraft),

        tenthSchool: document.getElementById('edit-sp-tenth-school')?.value?.trim() || '',
        tenthBoard: document.getElementById('edit-sp-tenth-board')?.value?.trim() || '',
        tenthPct: tenthPctVal !== '' && tenthPctVal !== undefined ? parseFloat(tenthPctVal) : null,
        tenthYear: document.getElementById('edit-sp-tenth-year')?.value ? parseInt(document.getElementById('edit-sp-tenth-year').value, 10) : null,

        twelfthCollege: document.getElementById('edit-sp-twelfth-college')?.value?.trim() || '',
        twelfthStream: document.getElementById('edit-sp-twelfth-stream')?.value?.trim() || '',
        twelfthBoard: document.getElementById('edit-sp-twelfth-board')?.value?.trim() || '',
        twelfthPct: twelfthPctVal !== '' && twelfthPctVal !== undefined ? parseFloat(twelfthPctVal) : null,
        twelfthYear: document.getElementById('edit-sp-twelfth-year')?.value ? parseInt(document.getElementById('edit-sp-twelfth-year').value, 10) : null
      });

      closeModal('modal-edit-academic-scores');
      showToast(
        isDraft ? 'Incomplete draft saved! You can complete records later.' : 'Academic records verified & committed to SQLite! ML projections updated.',
        'success'
      );
      try {
        renderAllViews();
      } catch (renderErr) {
        console.error('[renderAllViews post-save error]:', renderErr);
      }

      // If user was onboarding with ?setup=true, navigate to dashboard now!
      if (window.location.hash.includes('setup=true')) {
        setTimeout(() => {
          window.location.hash = '/student/dashboard';
        }, 500);
      }
    } catch (err) {
      console.error('[Academic Save Error]:', err);
      showToast(err.message || 'Server error saving scores', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = origText;
      }
    }
  };

  window.openAddInternshipModal = function() {
    document.getElementById('form-add-internship')?.reset();
    openModal('modal-add-internship');
  };

  window.handleSaveInternship = function(e) {
    e.preventDefault();
    store.addStudentInternship({
      company: document.getElementById('edit-sp-int-company')?.value?.trim() || 'Tech Corp',
      role: document.getElementById('edit-sp-int-role')?.value?.trim() || 'Software Intern',
      startDate: document.getElementById('edit-sp-int-period')?.value?.trim() || 'May 2025',
      endDate: 'Completed',
      stipend: document.getElementById('edit-sp-int-stipend')?.value?.trim() || '₹25,000 / month',
      mode: document.getElementById('edit-sp-int-mode')?.value || 'Hybrid',
      skillsUsed: document.getElementById('edit-sp-int-tech')?.value?.trim() || 'React, Node.js',
      responsibilities: document.getElementById('edit-sp-int-resp')?.value?.trim() || ''
    });
    closeModal('modal-add-internship');
    showToast('Internship experience added successfully!');
  };

  window.deleteStudentInternship = function(id) {
    if (confirm('Are you sure you want to remove this internship experience?')) {
      store.deleteStudentInternship(id);
      showToast('Internship removed.');
    }
  };

  window.openAddWorkExperienceModal = function() {
    document.getElementById('form-add-work')?.reset();
    openModal('modal-add-work');
  };

  window.handleSaveWorkExperience = function(e) {
    e.preventDefault();
    store.addStudentWorkExperience({
      company: document.getElementById('edit-sp-work-company')?.value?.trim() || 'Company',
      jobTitle: document.getElementById('edit-sp-work-role')?.value?.trim() || 'Engineer',
      empType: document.getElementById('edit-sp-work-type')?.value || 'Full-time',
      duration: document.getElementById('edit-sp-work-duration')?.value?.trim() || '2024 - 2025',
      description: document.getElementById('edit-sp-work-desc')?.value?.trim() || ''
    });
    closeModal('modal-add-work');
    showToast('Work experience added successfully!');
  };

  window.deleteStudentWorkExperience = function(id) {
    if (confirm('Are you sure you want to remove this work experience?')) {
      store.deleteStudentWorkExperience(id);
      showToast('Work experience removed.');
    }
  };

  // Skills Modal logic
  function renderModalSkillsList() {
    const container = document.getElementById('modal-skills-list-container');
    if (!container) return;
    const skills = store.data.roles.student.skills || [];
    container.innerHTML = skills.map(skill => `
      <span class="skill-chip-pill">
        ${skill}
        <button type="button" onclick="removeStudentSkillItem('${skill}')" style="background: transparent; border: none; cursor: pointer; color: #DC2626; margin-left: 4px; font-weight: 700;">✕</button>
      </span>
    `).join('');
  }

  window.openEditSkillsModal = function() {
    renderModalSkillsList();
    openModal('modal-edit-skills');
  };

  window.addNewSkillFromInput = function() {
    const input = document.getElementById('edit-sp-new-skill');
    if (!input || !input.value.trim()) return;
    const val = input.value.trim();
    store.addStudentSkill(val);
    input.value = '';
    renderModalSkillsList();
    showToast(`Skill "${val}" added!`);
  };

  window.quickAddSkill = function(skillName) {
    store.addStudentSkill(skillName);
    renderModalSkillsList();
    showToast(`Skill "${skillName}" added!`);
  };

  window.removeStudentSkillItem = function(skillName) {
    store.removeStudentSkill(skillName);
    renderModalSkillsList();
    showToast(`Skill "${skillName}" removed.`);
  };

  window.openAddProjectModal = function() {
    document.getElementById('form-add-project')?.reset();
    openModal('modal-add-project');
  };

  window.handleSaveProject = function(e) {
    e.preventDefault();
    const title = document.getElementById('edit-sp-proj-title')?.value?.trim() || 'Technical Project';
    store.addStudentProject({
      title,
      tech: document.getElementById('edit-sp-proj-tech')?.value?.trim() || 'Full Stack',
      domain: document.getElementById('edit-sp-proj-domain')?.value?.trim() || 'Software Development',
      githubUrl: document.getElementById('edit-sp-proj-github')?.value?.trim() || '',
      description: document.getElementById('edit-sp-proj-desc')?.value?.trim() || '',
      startDate: '2025',
      endDate: '2025'
    });
    closeModal('modal-add-project');
    showToast(`Project "${title}" added to portfolio!`);
  };

  window.deleteStudentProject = function(id) {
    if (confirm('Are you sure you want to remove this project?')) {
      store.deleteStudentProject(id);
      showToast('Project removed.');
    }
  };

  window.openAddCertificationModal = function() {
    document.getElementById('form-add-certification')?.reset();
    openModal('modal-add-certification');
  };

  window.handleSaveCertification = function(e) {
    e.preventDefault();
    const name = document.getElementById('edit-sp-cert-name')?.value?.trim() || 'Certification';
    store.addStudentCertification({
      name,
      issuer: document.getElementById('edit-sp-cert-issuer')?.value?.trim() || 'Issuing Authority',
      date: document.getElementById('edit-sp-cert-date')?.value?.trim() || '2025',
      credentialUrl: document.getElementById('edit-sp-cert-url')?.value?.trim() || ''
    });
    closeModal('modal-add-certification');
    showToast(`Certification "${name}" added!`);
  };

  window.deleteStudentCertification = function(id) {
    if (confirm('Are you sure you want to remove this certification?')) {
      store.deleteStudentCertification(id);
      showToast('Certification removed.');
    }
  };

  // Backdrop overlay click to dismiss any modal
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        if (overlay.id === 'modal-record-details') {
          closeRecordDetailsModal();
        } else if (overlay.id === 'modal-submit-assignment') {
          closeSubmitAssignmentModal();
        } else if (overlay.id === 'modal-submission-details') {
          closeSubmissionDetailsModal();
        } else {
          overlay.style.display = 'none';
        }
      }
    });
  });

  // Escape key to dismiss any active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const recordModal = document.getElementById('modal-record-details');
      if (recordModal && recordModal.style.display === 'flex') {
        closeRecordDetailsModal();
      }
      const submitModal = document.getElementById('modal-submit-assignment');
      if (submitModal && submitModal.style.display === 'flex') {
        closeSubmitAssignmentModal();
      }
      const subDetailModal = document.getElementById('modal-submission-details');
      if (subDetailModal && subDetailModal.style.display === 'flex') {
        closeSubmissionDetailsModal();
      }
      document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.style.display = 'none';
      });
    }
  });

  if (typeof setupModalFileUploads === 'function') {
    setupModalFileUploads();
  }

  const sidebarEl = document.getElementById('app-sidebar');
  const backdropEl = document.getElementById('sidebar-backdrop');

  function openMobileSidebar() {
    sidebarEl?.classList.add('mobile-open');
    backdropEl?.classList.add('active');
  }

  function closeMobileSidebar() {
    sidebarEl?.classList.remove('mobile-open');
    backdropEl?.classList.remove('active');
  }

  function handleSidebarToggle() {
    if (window.innerWidth <= 992) {
      if (sidebarEl?.classList.contains('mobile-open')) {
        closeMobileSidebar();
      } else {
        openMobileSidebar();
      }
    } else {
      document.body.classList.toggle('sidebar-collapsed');
      const isCollapsed = document.body.classList.contains('sidebar-collapsed');
      localStorage.setItem('spp_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    }
  }

  // Restore desktop collapsed preference
  if (window.innerWidth > 992 && localStorage.getItem('spp_sidebar_collapsed') === 'true') {
    document.body.classList.add('sidebar-collapsed');
  }

  document.getElementById('btn-toggle-sidebar')?.addEventListener('click', handleSidebarToggle);
  document.getElementById('btn-close-sidebar')?.addEventListener('click', closeMobileSidebar);
  backdropEl?.addEventListener('click', closeMobileSidebar);

  updateRouting();
  renderAllViews();
});
