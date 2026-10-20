# Beep Internship Readiness Radar
> **Founder’s Office Discovery Platform for Beep (EventBeep)**  
> *Closing the student "Actionability Gap" with transparent skills diagnostics, weekend proof-of-work project blueprints, and authenticated application tracking.*

---

## 🎯 Executive Problem Statement
College engineering students applying for tech internships face an acute **Actionability Gap**:
1. **Uncertain Screening Criteria:** Resumes listing generic coursework without measurable outcomes or canonical stack keywords face high early rejection rates.
2. **Generic Score Black Holes:** Traditional ATS scanners produce arbitrary percentage scores without explaining missing technical foundations or concrete remediation steps.
3. **The Beep Solution:** **Beep Readiness Radar** turns rejection anxiety into structured career momentum by:
   - Diagnosing **Direct Matches**, **Adjacent Foundations**, and **Missing Requirements** against specific target internship job descriptions using boundary-aware token matching.
   - Prescribing a **48-Hour Weekend Proof-of-Work Project** with an architectural blueprint and copyable `README.md` template.
   - Formulating a **7-Day Preparation Plan** with Google XYZ bullet formulas and recruiter cold outreach templates.
   - Providing an **Authenticated Application Tracking Pipeline** backed by SQLite persistent storage.

---

## 🛠️ System Architecture & Security Design

```
d:\EventBeep_Founder's_Office
├── .env.example              # Environment configuration template
├── package.json              # Scripts, dependencies, and test runner
├── vite.config.js            # Vite build configuration with /api proxy to port 5000
├── tests/
│   ├── auth_and_api.test.js  # Automated authentication & database isolation tests
│   └── heuristicCore.test.js # Boundary-aware skill collision tests (Java vs JS, C vs CSS, etc.)
├── server/
│   ├── db.js                 # SQLite persistent database (WAL mode, parameterized queries)
│   ├── index.js              # Express 5 backend API:
│   │                         # - Helmet HTTP security headers & Content Security Policy
│   │                         # - Fail-safe JWT authentication & bcrypt password hashing
│   │                         # - Protection against account enumeration & timing attacks
│   │                         # - Gemini 2.5 Flash live LLM integration with heuristic fallback
│   │                         # - Strict student account isolation for all applications
│   └── data/                 # SQLite storage directory (strictly ignored in Git)
│       └── beep.db
└── src/
    ├── App.jsx               # Main application container, session manager & modals
    ├── components/
    │   ├── LoginScreen.jsx   # Tabbed Sign In / Registration with strong password policy
    │   ├── Header.jsx        # Navigation, live engine status badge & user profile controls
    │   ├── Hero.jsx          # Focused landing screen
    │   ├── InternshipExplorer.jsx # Curated tech roles + custom JD input
    │   ├── ResumeUploader.jsx# PDF/DOCX/TXT dropzone with native PDF iframe viewer & privacy notice
    │   ├── ResultsView.jsx   # Honest match scorecard, ATS matrix, interview prep & 48-hr project
    │   ├── StatisticsModal.jsx # Dual-tab student analytics & 2026 campus hiring benchmarks
    │   ├── ApplicationModal.jsx # Authenticated internship submission
    │   └── ApplicationTrackerModal.jsx # Transparent status tracker & receipt download
    └── utils/
        ├── documentParser.js # Multi-format client-side parser (pdfjs-dist + mammoth.js)
        └── heuristicCore.js  # Boundary-aware skill taxonomy, evidence scoring & zero fake metrics
```

### 🔒 Enterprise Security & Privacy Standards
- **Cryptographic Authentication:** Passwords hashed with `bcryptjs` (salt rounds: 10), sessions secured with signed `jsonwebtoken` (JWT, 24-hour lifetime).
- **Startup Protection:** In production, the server strictly refuses to start if `JWT_SECRET` is missing or under 32 characters. In development, an ephemeral 256-bit key is generated in memory.
- **Account Privacy:** Authentication endpoints employ constant-time dummy comparisons to eliminate email enumeration and timing attacks.
- **Strict Account Isolation:** Students can only fetch and submit their own applications (`WHERE user_id = req.user.id`).
- **HTTP Security Headers:** Protected with `helmet` Content Security Policy, preventing clickjacking and cross-site scripting.
- **Rate Limiting:** Guarded by `express-rate-limit` (20 analysis calls/min, 30 auth attempts/15 min).
- **Relational Persistence:** SQLite database (`better-sqlite3`) with WAL journal mode, relational foreign keys, schema version tracking, and 100% parameterized queries.

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js** v20+ or v22+ LTS (required for Vite 8 and native SQLite support)
- **npm** v10+

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your secrets:
```env
PORT=5000
JWT_SECRET=your-random-jwt-secret-min-32-chars-long
# Optional: Add Google Gemini API Key for live AI analysis
GEMINI_API_KEY=
```

### 4. Start the Application
Run both backend and frontend concurrently:
```bash
npm run dev
```
* **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 🧪 Automated Testing & Code Quality
- **Automated Test Suite:**
  ```bash
  npm test
  ```
  *(13/13 passing tests: boundary-aware regex collisions, bcrypt hashing, JWT issuance, SQLite isolation)*
- **Linter Check:**
  ```bash
  npm run lint
  ```
  *(0 warnings, 0 errors via oxlint)*
- **Production Build:**
  ```bash
  npm run build
  ```
  *(Vite production build verified in <1s)*

---

## 📄 License & Attribution
Built for the **EventBeep Founder’s Office Discovery Assignment (2026)**.
All diagnostic recommendations, Google XYZ bullet templates, and proof-of-work project blueprints are tailored for Indian college technology interns.
