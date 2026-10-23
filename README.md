# Beep Readiness Radar
> **Founder’s Office Discovery Platform for Beep (EventBeep)**  
> *Transforming student resume evaluation with genuine Google Gemini LLM semantic matching, transparent threshold-based scoring, expert-level scenario quizzes, and authenticated application tracking.*

**Live Deployment:** [https://beep-readiness-radar.onrender.com](https://beep-readiness-radar.onrender.com)  
**GitHub Repository:** [https://github.com/diyalodha/Beep_Readiness_Radar](https://github.com/diyalodha/Beep_Readiness_Radar)  
**Submission Form:** [https://app.youform.com/forms/zp9defmm](https://app.youform.com/forms/zp9defmm)

---

## 🎯 Executive Problem Statement: The Beep App Review

After reviewing the Beep app ([Android](https://play.google.com/store/apps/details?id=com.eventbeep.android) / [iOS](https://apps.apple.com/app/id1476715510)) and analyzing community feedback from college students, 3 core problems were identified:

1. **Problem #1 (The Winner & Focus): The "Actionability Gap" in Campus Hiring**  
   * **Evidence:** Play Store reviews and campus chats repeatedly report: *"Applied to 40+ internships with zero response"*, *"Companies want experience for an intern role, how do I prove my skills?"* Traditional ATS scanners rely on naive keyword overlap, penalizing qualified students who phrase projects differently while rewarding keyword-stuffed resumes. Rejected students receive opaque rejection notices without explanations of missing technical foundations or how to fix them.
2. **Problem #2: Superficial Peer Networking vs. Proof-of-Work Collaboration**  
   * **Evidence:** Community forums easily devolve into generic chatter. Students struggle to find verified co-builders for hackathons because user profiles only show college names rather than demonstrated capabilities.
3. **Problem #3: Passive Event Attendance Without Skill Retention**  
   * **Evidence:** High drop-off after webinars and events; students collect participation certificates that recruiters ignore because they lack verifiable hands-on execution.

---

## 💡 The Solution: Beep Readiness Radar

**Beep Readiness Radar** helps students turn internship uncertainty into a structured, actionable preparation plan.

- **AI-Powered Resume–Job Description Analysis:** Uses Google Gemini (`gemini-2.5-flash`) through the official `@google/genai` SDK to analyze candidate skills, evidence, project relevance, and transferable skills, with a heuristic fallback when AI analysis is unavailable.
- **Weighted Readiness Scoring:** Evaluates five dimensions—Required Skills (35%), Evidence Depth (25%), Experience (15%), Preferred Skills (15%), and Transferable Skills (10%)—with blocker rules that can cap the final score.
- **Evidence-Grounding Checks:** Applies a verification layer to check generated scores and supporting evidence against the supplied resume and job description.
- **Targeted 48-Hour Project Blueprint:** Suggests a focused mini-project addressing a key skill gap, with implementation guidance, resume bullet-point templates using the Google XYZ format, and a copyable `README.md` template.
- **Personalized 7-Day Preparation Plan:** Organizes preparation into daily steps, from learning missing concepts to building, deploying, and presenting a relevant project.
- **Adaptive Technical Quiz:** Generates role-relevant technical questions and scenarios based on identified skill gaps, with server-side answer evaluation.
- **Interview and Outreach Preparation:** Provides anticipated technical interview questions, structured STAR-format answer guidance, and a LinkedIn outreach message.
- **SQLite-Based Data Storage and JWT Authentication:** Supports user authentication, resume analysis history, quiz-session tracking, and application records. The current Render Free deployment uses ephemeral local storage, so data persistence across restarts and redeployments is not guaranteed without persistent storage.
---

## 📈 The 7-Day Metric: Measuring Real Student Progress

### Primary Metric
**Average improvement in technical assessment scores**

- **Baseline:** Each participating student's score on an initial assessment.
- **Target:** An average improvement of at least 15 percentage points after seven days of using the personalized preparation plan.
- **Status:** This is a proposed target, not a measured result.

### Seven-Day Experiment

1. **Day 1 — Baseline:** Recruit 5–10 students preparing for internships. Record their target roles and initial assessment scores.
2. **Days 2–5 — Preparation:** Generate individualized skill-gap reports and preparation plans. Ask students to complete the recommended activities and record completion.
3. **Day 6 — Practice:** Have students complete a follow-up assessment covering comparable topics at a similar difficulty level.
4. **Day 7 — Measurement:** Calculate each student's score change, average improvement, and preparation-plan completion rate.

### Measurement Formula

Average score improvement = average follow-up score − average baseline score.

Report the number of participants, initial and follow-up averages, completion rate, and actual improvement. If the target is not achieved, report the result honestly and investigate why.

**Longer-term outcome:** Track internship applications and interview callbacks over a longer period. Do not claim a callback-rate improvement until sufficient real application data has been collected.

---

## 🛠️ System Architecture & Services

```
d:\EventBeep_Founder's_Office
├── .env.example                       # Environment configuration template with Gemini placeholders
├── package.json                       # Scripts, dependencies (@google/genai, express 5, better-sqlite3)
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
│   ├── db.js                          # SQLite database (WAL mode, migrations for analyses & quiz sessions)
│   ├── index.js                       # Express 5 backend API:
│   │                                  # - Safe /api/status endpoint (zero secret leakage)
│   │                                  # - /api/analyze with audit persistence
│   │                                  # - /api/quiz/generate and /api/quiz/grade
│   │                                  # - /api/analyses/history & /api/quiz/history
│   │                                  # - Helmet CSP, JWT auth, and rate limiting
│   └── data/                          # SQLite database directory (strictly git-ignored)
│       └── beep.db
└── src/
    ├── App.jsx                        # Main state orchestrator & navigation
    ├── components/
    │   ├── AppHeader.jsx              # Header with extreme-left menu, branding & feature tabs
    │   ├── InternshipExplorer.jsx     # Curated roles & custom job description auditor
    │   ├── ResumeUploader.jsx         # Multi-format dropzone (PDF/DOCX/TXT) with native preview
    │   ├── RoadmapFocusedView.jsx     # Resume-personalized 48h blueprint + 7-day sprint plan
    │   ├── InterviewFocusedView.jsx   # Anticipated questions + STAR answers + cold pitch
    │   ├── AdaptiveQuizView.jsx       # 100% resume-personalized quiz with server grading
    │   ├── ApplicationsView.jsx       # SQLite-backed candidate applications pipeline
    │   ├── ApplicationModal.jsx       # Authenticated application submission modal
    │   ├── StatisticsModal.jsx        # Placement analytics (illustrative guidelines)
    │   └── ResumePreviewModal.jsx     # Clean, white-background document viewer
    └── utils/
        ├── documentParser.js          # Multi-format client-side parser (pdfjs-dist + mammoth.js)
        └── heuristicCore.js           # Boundary-aware taxonomy & fallback matching
```

---

## 🧠 Semantic LLM Analysis & Threshold-Based Scoring Policy

### 1. Dual-Engine Transparency
* **Real Gemini LLM Mode:** When `GEMINI_API_KEY` is configured, calls the official `@google/genai` SDK using `gemini-2.5-flash` with structured JSON output, a 25-second timeout, bounded backoff retries, and strict XML sandboxing against prompt injection.
* **Fallback Mode:** If Gemini is unconfigured, rate-limited, or unavailable, the backend automatically engages `Fallback Analysis (Dynamic Heuristic Engine)`, returning the full unified schema with verified text quotes and explicit fallback notices. No fabricated AI claims.

### 2. Weighted Dimension Breakdown
Rather than arbitrary keyword counts, readiness is calculated using a mathematically verified policy:
$$\text{Readiness Score} = 0.35 \times \text{Required} + 0.25 \times \text{Evidence} + 0.15 \times \text{Experience} + 0.15 \times \text{Preferred} + 0.10 \times \text{Transferable}$$

* **Required Competencies (35%):** Must-have core technologies and foundational stack qualifications.
* **Depth of Evidence (25%):** Verifiable projects, measurable metrics, code links, and technical depth.
* **Relevant Experience (15%):** Production exposure, internships, and domain experience.
* **Preferred Competencies (15%):** Bonus technologies and nice-to-have tools.
* **Transferable Skills (10%):** Adjacent languages and architectures that translate to the target stack.

### 3. Mandatory Prerequisite Blocker Cap
If a mandatory qualification or prerequisite skill is missing from the candidate resume, the score is capped at **65%** and the readiness band is classified as `Partial Alignment (Critical Prerequisite Missing)`.

### 4. Readiness Classification Bands
* **85–100%:** `Strong Alignment` (Immediate Fast-Track)
* **70–84%:** `Good Alignment` (Minor Addressable Gaps)
* **50–69%:** `Partial Alignment` (Foundational Experience Present)
* **0–49%:** `Significant Gaps` (Structured Preparation Needed)

---

## 🎓 Expert-Level Adaptive Tech Quiz

* **100% Resume-Personalized Scenarios:** Synthesized directly from candidate stated projects, libraries, and diagnosed gaps (e.g., verifying Redux state management, SQL query execution plans, or API latency trade-offs).
* **Zero Client-Side Answer Leakage:** When generating a quiz via `POST /api/quiz/generate`, the public question payload returned to the client contains **zero** correct answer indexes, rubrics, or sample answers. Secret keys are persisted securely in the SQLite `quiz_sessions` table.
* **Server-Side Grading & Gap Diagnosis:** Client submissions to `POST /api/quiz/grade` are evaluated against server keys, returning per-question architectural explanations and diagnosed knowledge gaps for focused revision.

---

## 🔒 Enterprise Security & Operational Standards

* **Safe Status Endpoint:** `GET /api/status` provides safe system metadata (`aiConfigured`, `engine`, `model`, `provider`, `database`, `persistenceNotice`) without leaking secrets.
* **Cryptographic Authentication:** Passwords hashed with `bcryptjs` (salt rounds: 10), sessions secured with signed `jsonwebtoken` (JWT, 24-hour lifetime).
* **Strict User Isolation:** Students can only fetch and submit their own applications and audits (`WHERE user_id = req.user.id`).
* **HTTP Security Headers:** Protected with `helmet` Content Security Policy, preventing clickjacking and cross-site scripting.
* **Rate Limiting:** Guarded by `express-rate-limit` (20 analysis calls/min, 30 auth attempts/15 min).

---

## ☁️ Deployment Guide (Render Compatibility)

### 1. Render Deployment Settings
* **Environment:** Node
* **Build Command:** `npm ci && npm run build`
* **Start Command:** `npm start`
* **Environment Variables:**
  * `NODE_ENV=production`
  * `PORT=5000` (or automatically assigned by Render)
  * `JWT_SECRET=your-random-jwt-secret-min-32-chars-long`
  * `GEMINI_API_KEY=your_google_ai_studio_api_key`
  * `GEMINI_MODEL=gemini-2.5-flash`

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
* **Node.js** v20+ or v22+ / v24+ LTS
* **npm** v10+

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
* **Frontend Client:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000](http://localhost:5000)
* **System Health:** [http://localhost:5000/api/status](http://localhost:5000/api/status)

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
