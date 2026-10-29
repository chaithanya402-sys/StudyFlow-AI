# StudyFlow AI — Next-Gen Academic & Placement Intelligence Platform

> An end-to-end, full-stack academic intelligence, mentorship, collaborative project management, and machine-learning placement prediction platform for universities, faculty, T&P officers, and students.

---

## 🌟 Overview & Key Modules

StudyFlow AI combines modern web engineering, SQLite persistence, and supervised machine learning to provide a seamless academic and career lifecycle experience across three distinct institutional roles:

### 1. 🎓 Student Experience & Predictive Analytics
- **Supervised Placement Prediction**: Real-time ML model assessing placement readiness, salary band predictions, and actionable skill gaps.
- **Academic Marksheet Extractor & Verifier**: Automated marksheet upload, OCR/tabular extraction preview, CGPA calculation, and official verification against SQLite academic records.
- **Profile Simulator & What-If Engine**: Interactive sliders for CGPA, aptitude scores, and technical competencies to simulate potential placement outcome shifts.
- **Resume & Skill-Gap Analysis**: Benchmark resume credentials against top hiring company requirements.
- **Collaborative Group Projects Hub**: Form multi-student teams (2–5 members), submit project proposals mapped to subject faculty, track milestones, and submit project deliverables.
- **Assignment Submissions & Campus Drives**: View faculty assignments, submit coursework with file attachments, and apply for verified T&P campus placement drives.

### 2. 👨‍🏫 Faculty Mentoring & Academic Governance
- **Subject-Matched Project Approvals**: Specialized queue matching student project proposals with the designated subject faculty.
- **Structured Proposal Iteration**: One-click actions to Approve, Request Changes (with mandatory revision notes), or Resubmit.
- **Continuous Project Supervision**: Review milestone progress updates, review GitHub/demo links, provide structured feedback, and award final evaluations.
- **Coursework Management**: Post assignments with deadlines and score criteria, review submissions, and provide marks and personalized student feedback.
- **Mentorship Tasks**: Assign personalized guidance tasks directly to mentored students.

### 3. 🏢 Training & Placement (T&P) Officer Portal
- **Campus Placement Drives**: Create and publish recruitment drives with minimum CGPA criteria, package details, and application deadlines.
- **Cohort Analytics & Batch Prediction**: Run batch predictions on entire student cohorts with visual placement distribution charts.
- **Application Management**: Review eligible applicant pools and export placement readiness reports.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Node.js, Express 5, Better-SQLite3
- **Security & Authentication**: SQLite-backed session tokens, bcrypt password hashing, role-based endpoint authorization
- **Database**: Embedded SQLite (`data/studyflow.db`) with relational integrity, foreign key constraints, and automatic schema bootstrap
- **Machine Learning**: Supervised Ridge Regression (Target A: Exam Performance) & Logistic Classification (Target B: Placement Probability)
- **Frontend**: Vanilla ES6+ JavaScript, CSS3 Glassmorphism design system, responsive layouts, dynamic modal dialogs, and SVG visual charts

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/chaithanya402-sys/StudyFlow-AI.git
   cd StudyFlow-AI
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Local Secrets**:
   Copy `.env.example` to `.env`, then set private values for `FACULTY_PASSCODES` and `ALLOWED_ORIGINS`. Keep `.env` out of version control.

4. **Start the Application**:
   ```bash
   npm start
   ```

5. **Access the Application**:
   - **Landing Page**: [http://localhost:3000/landing.html](http://localhost:3000/landing.html)
   - **Main App Dashboard**: [http://localhost:3000/](http://localhost:3000/)
   - **Authentication Portal**: [http://localhost:3000/login.html](http://localhost:3000/login.html)

---

## 🧪 Automated Testing & Verification

Run the comprehensive end-to-end integration test suite:

```bash
npm test
```

This verifies:
- Database health & schema migrations
- Student, Faculty, and T&P Officer authentication & session management
- Multi-tenant account isolation and security boundaries
- Faculty task assignment & student submission workflows
- Supervised ML prediction calculations & SQLite audit logging
- Marksheet OCR extraction, validation, and CGPA recalculation
- Collaborative Group Projects proposal approval, revision requests, member isolation, and grading workflows

---

## 📂 Project Structure

```
StudyFlow-AI/
├── app.js                 # Frontend application router, state management & UI renderers
├── dataStore.js           # Client-side data access layer & API bridge
├── db.js                  # SQLite database connection & schema bootstrap
├── server.js              # Express REST API server, authentication & business logic
├── mlEngine.js            # Supervised Machine Learning prediction engine
├── test_workflows.js      # Comprehensive automated verification test suite
├── landing.html           # Public platform landing page
├── login.html             # Multi-role authentication portal
├── index.html             # Main responsive dashboard container
├── styles.css             # Glassmorphic UI design system tokens & components
├── supabaseClient.js      # Auth & session security adapter
├── data/
│   └── studyflow.db       # Embedded SQLite database
└── uploads/               # File attachments & marksheet document storage
```

---

## 📄 License
ISC License. Built for CSE-AIML academic research, institutional governance, and career acceleration.
