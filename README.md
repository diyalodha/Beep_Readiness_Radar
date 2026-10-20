# Beep Internship Readiness Checker (Radar)
> **Founder’s Office Discovery MVP for Beep (EventBeep)**  
> *Closing the student "Actionability Gap" with transparent skills diagnostics, proof-of-work project blueprints, and cryptographic application tracking.*

---

## 🎯 Executive Problem Statement
College students from Indian engineering universities (especially Tier-2 and Tier-3 institutions) face an acute **Actionability Gap** when applying for tech internships:
1. **Silent ATS Drop-offs:** Over 74% of candidate drops occur because resumes mention academic lab coursework without live deployment links, quantifiable impact metrics, or canonical stack keywords.
2. **Generic Score Black Holes:** Traditional ATS scanners give an arbitrary percentage score without prescribing actionable steps.
3. **The Beep Solution:** **Beep Readiness Radar** turns rejection anxiety into structured career momentum by:
   - Diagnosing **Matched**, **Adjacent Transferable**, and **Missing Core** skills against target job descriptions.
   - Prescribing a **48-Hour Weekend Proof-of-Work Project** with a copyable `README.md` template.
   - Formulating a **7-Day Day-by-Day Preparation Plan** with Google XYZ bullet formulas and recruiter cold outreach templates.
   - Providing a **Fast-Track Application Pipeline** with real-time tracking from submission to interview callback.

---

## 🛠️ System Architecture & Security Design

```
d:\EventBeep_Founder's_Office
├── .env.example              # Environment configuration template
├── package.json              # Scripts & dependencies
├── vite.config.js            # Vite build configuration with /api proxy to port 5000
├── server/
│   ├── db.js                 # SQLite persistent database (WAL mode, parameterized queries)
│   ├── index.js              # Express 5 backend API:
│   │                         # - Helmet HTTP security headers (CSP, Frameguard)
│   │                         # - JWT authentication middleware & bcrypt password hashing
│   │                         # - Rate limiting on analysis and authentication endpoints
│   │                         # - Gemini 2.5 Flash live LLM integration with heuristic fallback
│   │                         # - Strict student account isolation for all applications
│   └── data/                 # SQLite storage directory (ignored in Git)
│       └── beep.db
└── src/
    ├── App.jsx               # Main application container, session manager & modals
    ├── components/
    │   ├── LoginScreen.jsx   # Email-first JWT authentication & returning student quick-login
    │   ├── Header.jsx        # Navigation, live engine status pill & user profile controls
    │   ├── Hero.jsx          # Clean, focused landing screen
    │   ├── InternshipExplorer.jsx # Curated tech roles + custom JD input
    │   ├── ResumeUploader.jsx# PDF/DOCX/TXT dropzone with native PDF iframe viewer
    │   ├── ResultsView.jsx   # Match scorecard, ATS matrix, interview prep & 48-hr project
    │   ├── StatisticsModal.jsx # Dual-tab student analytics & 2026 campus hiring benchmarks
    │   ├── ApplicationModal.jsx # Fast-track internship submission
    │   └── ApplicationTrackerModal.jsx # 4-stage pipeline tracker & receipt download
    └── utils/
        ├── documentParser.js # Multi-format client-side parser (pdfjs-dist + mammoth.js)
        └── heuristicCore.js  # 50+ technology taxonomy, transferable logic & zero fake metrics
```

### 🔒 Enterprise Security & Privacy (P0 Standards)
- **Cryptographic Authentication:** Passwords hashed with `bcryptjs` (salt rounds: 10), sessions secured with signed `jsonwebtoken` (JWT).
- **Strict Account Isolation:** Students can only fetch and modify their own applications (`WHERE user_id = req.user.id`).
- **HTTP Security Headers:** Protected with `helmet` against cross-site scripting and MIME sniffing.
- **Rate Limiting:** Guarded by `express-rate-limit` (25 analysis calls/min, 40 auth attempts/15 min).
- **Relational Persistence:** SQLite database (`better-sqlite3`) with WAL journal mode, relational foreign keys, and 100% parameterized queries.

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20/v22/v24)
- **npm** v10+

### 2. Install Dependencies
```bash
npm install
```

### 3. (Optional) Configure Live Gemini AI
By default, the server runs in **Curated Heuristic Mode** with zero configuration required.

To connect live Gemini 2.5 Flash:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your Google Gemini API key:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET=your_secure_jwt_secret_key
   ```
3. Restart the server. The header badge will automatically update to **🟢 Gemini 2.5 Flash (Live AI)**.

### 4. Start the Application
Run both backend and frontend concurrently:
```bash
npm run dev
```
* **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 🧪 Testing & Code Quality
- **Linter Check:**
  ```bash
  npm run lint
  ```
  *(0 warnings, 0 errors via oxlint)*
- **Production Build:**
  ```bash
  npm run build
  ```
  *(Bundles cleanly in <1s with Vite)*

---

## 💼 Demo Credentials for Evaluators
For instant recruiter/evaluator review without filling in a new registration form:
* Click **"Quick Evaluator Access (Demo Student) ➔"** on the login screen, or sign in with:
  * **Email:** `diya05lodha@gmail.com`
  * **Password:** `Beep@2026`

---

## 📄 License & Attribution
Built for the **EventBeep Founder’s Office Assignment (2026)**.
All diagnostic recommendations, Google XYZ bullet templates, and proof-of-work project blueprints are tailored for Indian college technology interns.
