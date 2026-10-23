# Beep Readiness Radar
> **Founder’s Office Discovery Platform for Beep (EventBeep)**  
> *Transforming student resume evaluation with genuine Google Gemini LLM semantic matching, transparent threshold-based scoring, expert-level scenario quizzes, and authenticated application tracking.*

**Live Deployment:** [https://beep-readiness-radar.onrender.com](https://beep-readiness-radar.onrender.com)

---

## 🎯 Executive Problem Statement
College engineering students applying for tech internships face an acute **Actionability Gap**:
1. **Superficial Keyword Matching:** Traditional ATS scanners rely on naive keyword overlap, rewarding keyword-stuffed resumes while penalizing qualified candidates who phrase transferable skills differently.
2. **Generic Score Black Holes:** Students receive opaque percentages without clear explanations of missing technical foundations, evidence depth, or concrete remediation steps.
3. **The Beep Solution:** **Beep Readiness Radar** turns rejection anxiety into structured career momentum by:
   - **Real Semantic LLM Analysis:** Evaluates candidate depth, evidence quality, project relevance, and adjacent skills using Google Gemini (`gemini-2.5-flash`) or an honest fallback heuristic engine.
   - **Central Threshold-Based Scoring Policy:** 5 weighted dimensions (35% Required, 25% Evidence Depth, 15% Experience, 15% Preferred, 10% Transferable) with mandatory blocker caps.
   - **Independent Validation Layer:** Mathematically recalculates scores and verifies that all quoted evidence exists verbatim in the candidate resume or job description text.
   - **Expert-Level Adaptive Tech Quiz:** Generates multi-step scenarios and code inspection questions with zero client-side answer leakage, evaluated strictly server-side.
   - **48-Hour Weekend Proof-of-Work Project:** Prescribes a deliverable specification, system architecture overview, and copyable `README.md` boilerplate.
   - **Authenticated Application Pipeline:** Backed by persistent SQLite storage with user isolation and downloadable receipts.

---

## 🛠️ System Architecture & Services

```
d:\EventBeep_Founder's_Office
├── .env.example                       # Environment configuration template with Gemini placeholders
├── package.json                       # Scripts, dependencies (@google/genai, express 5, better-sqlite3), and start command
├── vite.config.js                     # Vite build configuration with /api proxy to port 5000
├── scripts/
│   └── package-clean.js               # Clean distribution ZIP generator with standard forward-slash paths
├── tests/
│   ├── auth_and_api.test.js           # Automated authentication & database isolation tests
│   ├── heuristicCore.test.js          # Boundary-aware skill collision tests (Java vs JS, C vs CSS, etc.)
│   ├── semanticAnalysis.test.js       # Scoring policy math, excerpt grounding, validator, and fallback tests
│   └── expertQuiz.test.js             # Quiz generation, zero answer leakage, and server grading tests
├── server/
│   ├── config/
│   │   └── scoringPolicy.js           # Central 5-dimension threshold weights & mandatory blocker rules
│   ├── services/
│   │   ├── geminiService.js           # Official @google/genai SDK wrapper with timeouts & prompt injection defense
│   │   ├── analysisValidator.js       # Independent validation layer enforcing policy math & excerpt grounding
│   │   ├── fallbackAnalysisService.js # High-fidelity fallback engine with unified schema
│   │   └── quizService.js             # Expert-level scenario quiz generator & server-side grading engine
│   ├── db.js                          # SQLite database (WAL mode, parameterized queries, migrations for quiz sessions)
│   ├── index.js                       # Express 5 backend API:
│   │                                  # - Safe /api/status endpoint (zero secret leakage)
│   │                                  # - /api/analyze with validation & prompt injection protection
│   │                                  # - /api/quiz/generate and /api/quiz/grade
│   │                                  # - Helmet CSP, JWT auth, and rate limiting
│   └── data/                          # SQLite database directory (strictly git-ignored)
│       └── beep.db
└── src/
    ├── App.jsx                        # Main state orchestrator & navigation
    ├── components/
    │   ├── AppHeader.jsx              # Navigation header with engine status badge & user controls
    │   ├── ResultsView.jsx            # Semantic analysis report: engine badge, dimension cards, grounded excerpts
    │   ├── AdaptiveQuizView.jsx       # Real API-driven expert quiz with server grading & gap diagnostics
    │   ├── ResumeUploader.jsx         # Multi-format dropzone (PDF/DOCX/TXT) with live preview
    │   ├── InternshipExplorer.jsx     # Curated roles & custom job description auditor
    │   ├── ApplicationModal.jsx       # Authenticated application submission modal
    │   ├── ApplicationTrackerModal.jsx# Application pipeline tracker
    │   └── StatisticsModal.jsx        # Benchmark analytics (clearly labeled illustrative estimates)
    └── utils/
        ├── documentParser.js          # Multi-format client-side parser (pdfjs-dist + mammoth.js)
        └── heuristicCore.js           # Boundary-aware taxonomy & fallback matching
```

---

## 🧠 Semantic LLM Analysis & Threshold-Based Scoring Policy

### 1. Dual-Engine Transparency
- **Real Gemini LLM Mode:** When `GEMINI_API_KEY` is configured, calls the official `@google/genai` SDK using `gemini-2.5-flash` with structured JSON output, a 25-second timeout, bounded backoff retries, and strict XML sandboxing against prompt injection.
- **Fallback Mode:** If Gemini is unconfigured, rate-limited, or unavailable, the backend automatically engages `Fallback Analysis (Dynamic Heuristic Engine)`, returning the full unified schema with verified text quotes and explicit fallback notices. No fabricated AI claims.

### 2. Weighted Dimension Breakdown
Rather than arbitrary keyword counts, readiness is calculated using a mathematically verified policy:
$$\text{Readiness Score} = 0.35 \times \text{Required} + 0.25 \times \text{Evidence} + 0.15 \times \text{Experience} + 0.15 \times \text{Preferred} + 0.10 \times \text{Transferable}$$

- **Required Competencies (35%):** Must-have core technologies and foundational stack qualifications.
- **Depth of Evidence (25%):** Verifiable projects, measurable metrics, code links, and technical depth.
- **Relevant Experience (15%):** Production exposure, internships, and domain experience.
- **Preferred Competencies (15%):** Bonus technologies and nice-to-have tools.
- **Transferable Skills (10%):** Adjacent languages and architectures that translate to the target stack.

### 3. Mandatory Prerequisite Blocker Cap
If a mandatory qualification or prerequisite skill is missing from the candidate resume, the score is capped at **65%** and the readiness band is classified as `Partial Alignment (Critical Prerequisite Missing)`.

### 4. Readiness Classification Bands
- **85–100%:** `Strong Alignment` (Immediate Fast-Track)
- **70–84%:** `Good Alignment` (Minor Addressable Gaps)
- **50–69%:** `Partial Alignment` (Foundational Experience Present)
- **0–49%:** `Significant Gaps` (Structured Preparation Needed)

---

## 🎓 Expert-Level Adaptive Tech Quiz

- **Zero Client-Side Answer Leakage:** When generating a quiz via `POST /api/quiz/generate`, the public question payload returned to the client contains **zero** correct answer indexes, rubrics, or sample answers. Secret keys are persisted in the SQLite `quiz_sessions` table.
- **Role-Tailored Scenario Questions:** Generated dynamically for the target role (`Frontend Developer`, `Backend Developer`, etc.) and incorporates identified skill gaps from the resume audit.
- **Multi-Format Questions:**
  - `scenario-based`: Architectural design choices under trade-off constraints.
  - `code-analysis`: Code inspection for race conditions, stale closures, or performance bottlenecks.
  - `multi-select`: Requires selecting all valid architectural choices.
  - `short-answer`: Graded server-side against architectural rubrics.
- **Server-Side Grading & Gap Diagnosis:** Client submissions to `POST /api/quiz/grade` are evaluated against server keys, returning per-question architectural explanations and diagnosed knowledge gaps for focused revision.

---

## 🔒 Enterprise Security & Operational Standards

- **Safe Status Endpoint:** `GET /api/status` provides safe system metadata (`aiConfigured`, `engine`, `model`, `provider`, `database`, `persistenceNotice`) without leaking secrets.
- **Cryptographic Authentication:** Passwords hashed with `bcryptjs` (salt rounds: 10), sessions secured with signed `jsonwebtoken` (JWT, 24-hour lifetime).
- **Strict User Isolation:** Students can only fetch and submit their own applications (`WHERE user_id = req.user.id`).
- **HTTP Security Headers:** Protected with `helmet` Content Security Policy, preventing clickjacking and cross-site scripting.
- **Rate Limiting:** Guarded by `express-rate-limit` (20 analysis calls/min, 30 auth attempts/15 min).

---

## ☁️ Deployment Guide (Render Compatibility)

### 1. Render Deployment Settings
- **Environment:** Node
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `NODE_ENV=production`
  - `PORT=5000` (or automatically assigned by Render)
  - `JWT_SECRET=your-random-jwt-secret-min-32-chars-long`
  - `GEMINI_API_KEY=your_google_ai_studio_api_key`
  - `GEMINI_MODEL=gemini-2.5-flash`

### 2. Ephemeral SQLite Disk Disclosure on Render Free Tier
> [!IMPORTANT]
> On Render's Free web service tier, the container uses an **ephemeral local filesystem**. The SQLite database (`server/data/beep.db`) will persist across requests during normal operation, but will reset if the free instance spins down after inactivity or during redeployments.
> 
> For public production with guaranteed data retention across redeployments:
> 1. Attach a **Render Persistent Disk** mounted at `/server/data`, or
> 2. Connect an external managed database (e.g. Supabase, Render PostgreSQL).

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js** v20+ or v22+ / v24+ LTS
- **npm** v10+

### 2. Install Dependencies
```bash
npm ci
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your credentials in `.env`:
```env
PORT=5000
JWT_SECRET=your-random-jwt-secret-min-32-chars-long
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
GEMINI_MODEL=gemini-2.5-flash
NODE_ENV=development
```

### 4. Start the Application
Run both backend API and frontend Vite client:
```bash
npm run dev
```
- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **System Health:** [http://localhost:5000/api/status](http://localhost:5000/api/status)

---

## 🧪 Automated Testing & Code Verification

Run the full verification suite before deployment:

```bash
# 1. Run all 34 automated unit and integration tests
npm test

# 2. Run oxlint check (0 warnings, 0 errors)
npm run lint

# 3. Verify Vite production build
npm run build

# 4. Generate clean distributable ZIP (forward-slash paths, sensitive files excluded)
npm run pack:clean
```

---

## 📄 License & Attribution
Built for the **EventBeep Founder’s Office Discovery Platform (2026)**.
All diagnostic recommendations, Google XYZ bullet templates, proof-of-work blueprints, and scenario quizzes are designed for Indian college technology interns.
