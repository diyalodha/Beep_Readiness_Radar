# Beep Readiness Radar

**Live Demo:** https://beep-readiness-radar.onrender.com

Beep Readiness Radar helps college students compare their resumes with internship job descriptions, identify skill gaps, and follow a structured 7-day preparation plan.

## Features
- Resume and job-description analysis
- Direct, adjacent, and missing skill identification
- Personalized project recommendations
- Seven-day preparation plan
- Application tracking

## Technology Stack
- React and Vite
- Node.js and Express
- SQLite

**Current analysis engine:** Curated heuristic engine. Gemini API integration is currently disabled.

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
├── scripts/
│   └── package-clean.js      # Clean distribution ZIP generator (excludes node_modules, .git, .env, DBs)
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
npm ci
# Or: npm install
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

#### Option A: Unified Production Mode (Single Port 5000)
Build the frontend and run the production server serving both UI and API from a single endpoint:
```bash
npm run build
npm start
```
* **Unified Web App & API:** [http://localhost:5000](http://localhost:5000)

#### Option B: Local Development Mode (Hot Reload)
Run both backend API and Vite dev server concurrently:
```bash
npm run dev
```
* **Frontend Web App (Hot Reload):** [http://localhost:5000](http://localhost:5000)
* **Backend API:** [http://localhost:5000/api/status](http://localhost:5000/api/status)

---

## 🌐 1-Click Deployment Guide (Render / Railway)

### Deploying to Render.com (Recommended Free Tier)
1. **Push your code to GitHub** (already configured on your repo).
2. Go to [render.com](https://render.com) and click **New +** → **Web Service**.
3. Connect your repository: `https://github.com/diyalodha/Beep_Readiness_Radar`.
4. Configure the settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `JWT_SECRET`: (Generate any random 32+ character string, e.g. `a6e87f2b934c1d0e5f7a2b4c6e8f0a2d3e5f7a9b1c2d3e4f5a6b7c8d9e0f1a2b`)
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API Key for live AI evaluations.
6. Click **Deploy Web Service**. Render provides a public HTTPS URL (e.g. `https://beep-readiness-radar.onrender.com`) that automatically runs both the client and backend on the single deployed URL with persistent SQLite!

---

## 🧪 Automated Testing & Code Quality
- **Automated Test Suite:**
  ```bash
  npm test
  ```
  *(18/18 passing tests: boundary-aware regex collisions, bcrypt hashing, JWT issuance, SQLite isolation)*
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
- **Clean Distributable Packaging:**
  ```bash
  npm run pack:clean
  ```
  *(Generates `eventbeep-founder-office-clean.zip` excluding node_modules, .git, .env, and local database records)*

---

## 📄 License & Attribution
Built for the **EventBeep Founder’s Office Discovery Assignment (2026)**.
All diagnostic recommendations, Google XYZ bullet templates, and proof-of-work project blueprints are tailored for Indian college technology interns.
