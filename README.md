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

**Average improvement in technical assessment scores after seven days of personalized preparation.**

- **Baseline:** Each participating student's score on an initial technical assessment relevant to their target internship role.
- **Target:** An average improvement of at least **15 percentage points within seven days**. For example, an increase from 60% to 75% meets the target.
- **Status:** This is a proposed target, not a measured or proven result.

### Seven-Day Experiment

**Day 1 — Establish the Baseline**  
Recruit 5–10 students preparing for internships. Record their target roles and initial technical assessment scores.

**Days 2–5 — Personalized Preparation**  
Use Beep Readiness Radar to generate individual readiness reports, identify skill gaps, and create personalized preparation plans. Ask students to complete the recommended activities and record their progress.

**Day 6 — Follow-Up Assessment**  
Give participants a second assessment covering comparable topics at a similar difficulty level, using different questions to reduce the effect of memorization.

**Day 7 — Measure the Outcome**  
Calculate the change in each participant's score, the average improvement across participants who completed both assessments, and the preparation-plan completion rate.

### Measurement Formula

**Average score improvement = Average follow-up score − Average baseline score**

For example, if the average baseline score is 55% and the average follow-up score is 72%, the improvement is **17 percentage points**.

Report:
- Number of students recruited and number who completed both assessments.
- Average baseline and follow-up scores.
- Actual average improvement in percentage points.
- Preparation-plan completion rate.
- Whether the 15-percentage-point target was achieved.

If participants do not complete the follow-up assessment, report their number separately and calculate score improvement only for students with both scores. Report actual results honestly, even if the target is not achieved.

### Longer-Term Outcome

Track internship applications, interview invitations, and callbacks over a longer period to explore whether improved readiness translates into better application outcomes. Do not claim an increase in interview callbacks until sufficient real-world data has been collected.

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

### 1. Dual-Engine Analysis and Transparency

- **Gemini LLM Mode:** When `GEMINI_API_KEY` is configured and the service is available, the backend uses Google's official `@google/genai` SDK with `gemini-2.5-flash` to perform semantic resume–job description analysis. Structured JSON output, a 25-second timeout, bounded retries, and XML-delimited input boundaries help improve response consistency and reduce prompt-injection risks.
- **Dynamic Heuristic Fallback:** If Gemini is unavailable, rate-limited, or not configured, the backend can fall back to a rule-based analysis engine. The fallback follows the unified response schema and should clearly identify fallback mode rather than presenting heuristic output as LLM-generated analysis.
- **Evidence Validation:** Generated findings and supporting quotes should be checked against the supplied resume and job description. Unsupported evidence must not be presented as verified, and fallback or validation limitations should be disclosed.

### 2. Weighted Readiness Score

Readiness is calculated using five weighted dimensions:

\[
\begin{aligned}
\text{Readiness Score} ={}&
0.35R + 0.25E + 0.15X\\
&+ 0.15P + 0.10T
\end{aligned}
\]

Here, each dimension is scored from 0 to 100 before weighting.

- **Required Competencies (35%):** Coverage of essential technologies, core skills, and mandatory job requirements.
- **Depth of Evidence (25%):** Strength of supporting evidence, including relevant projects, demonstrated technical depth, measurable outcomes, and code or portfolio links where available.
- **Relevant Experience (15%):** Relevant internships, practical work, project experience, and domain exposure.
- **Preferred Competencies (15%):** Coverage of desirable technologies, additional tools, and other non-mandatory qualifications.
- **Transferable Skills (10%):** Relevant adjacent technologies, concepts, and experience that may transfer to the target role.

The weighted formula produces a preliminary score. Any applicable prerequisite cap is applied afterward to determine the final readiness score.

### 3. Mandatory Prerequisite Blocker

If a qualification or skill explicitly identified as mandatory by the job description is missing from the supplied resume, the system applies a maximum score of **65%**, provided the requirement has been reliably identified as a genuine prerequisite.

The final score is calculated as:

\[
\text{Final Score} =
\min(\text{Weighted Score},\text{Applicable Cap})
\]

When a mandatory prerequisite is missing, the applicable cap is 65%. The report should identify the missing requirement and explain its impact instead of treating the score alone as sufficient guidance.

**Important:** A missing mention in a resume does not necessarily prove that the candidate lacks the skill. The system should distinguish between *not demonstrated in the supplied resume* and *confirmed missing* wherever the available evidence cannot establish the difference.

### 4. Readiness Classification Bands

| Final score | Readiness band | Interpretation |
|---|---|---|
| 85–100% | **Strong Alignment** | Strong evidence of alignment with the role's requirements. |
| 70–84% | **Good Alignment** | Substantial alignment, with identifiable gaps to address. |
| 50–69% | **Partial Alignment** | Some relevant skills are demonstrated, but important gaps remain. |
| 0–49% | **Significant Gaps** | More foundational preparation may be needed. |

The readiness band is based on the final score after applying any prerequisite cap. These bands are decision-support indicators, not guarantees of hiring success.

### 5. Personalized Preparation and Honest Reporting

The final analysis should connect each identified gap to a practical next step, including:

- A targeted 48-hour mini-project blueprint.
- A personalized seven-day preparation plan based on the candidate's current gaps.
- Role-relevant technical questions and server-side answer evaluation.
- Interview preparation, STAR-format answer guidance, and a tailored LinkedIn outreach message.

The depth of preparation should reflect the candidate's actual gaps: a candidate with 90% readiness should receive focused guidance on remaining weaknesses, while a candidate with 70% readiness should receive a broader plan addressing foundational and role-specific gaps.

The system must clearly distinguish LLM-generated findings, heuristic fallback results, and evidence that has actually been validated. Readiness scores are estimates based on the supplied information, not predictions or guarantees of selection.

## 🎓 Adaptive, Resume-Guided Technical Quiz

### 1. Resume-Guided, Role-Relevant Scenarios

- **Personalized Question Generation:** Uses the candidate's supplied resume, stated projects, technologies, target job description, and identified skill gaps to generate relevant technical questions and practical scenarios.
- **Applied Technical Reasoning:** Questions can test concepts such as Redux state management, SQL query optimization, API latency trade-offs, debugging, and system design when relevant to the candidate's background and target role.
- **Gap-Focused Practice:** Prioritizes weaker or insufficiently demonstrated skills so candidates can focus their preparation on the areas most relevant to their target internship.

### 2. Server-Side Answer-Key Protection

- **Separate Public and Private Data:** The `POST /api/quiz/generate` endpoint should return questions and permitted display metadata without exposing correct answer indexes, grading rubrics, or sample answers.
- **Server-Side Answer-Key Storage:** Correct answers and grading information should remain on the server, associated with the relevant quiz session in the SQLite `quiz_sessions` table.
- **Reduced Answer Leakage:** The frontend should receive only the information needed to display questions and collect responses. Server-side storage reduces exposure through API responses, although complete protection also requires checking logs, database access, and other API endpoints.

### 3. Server-Side Grading and Skill-Gap Diagnosis

- **Backend Evaluation:** The `POST /api/quiz/grade` endpoint evaluates submitted answers against the server-side answer key or grading criteria.
- **Question-Level Feedback:** Returns explanations for answers and identifies concepts that need further revision, where supported by the grading implementation.
- **Targeted Revision:** Uses quiz results to guide the candidate toward relevant learning resources, practice questions, and preparation activities.
- **Preparation Feedback Loop:** Combines resume analysis and quiz performance to help candidates prioritize skill gaps instead of following a generic study plan.

### 4. Intended Outcome

Help students move from identifying internship skill gaps to practising the relevant concepts and measuring their progress. The quiz is designed to support focused preparation; its effectiveness should be evaluated through assessment results and student feedback rather than assumed in advance.
---

## 🔒 Security, Authentication & Operational Standards

### 1. Safe System Status Endpoint

- **Operational Health Checks:** `GET /api/status` reports service health and non-sensitive configuration metadata, including `aiConfigured`, `engine`, `model`, `provider`, `database`, and `persistenceNotice`.
- **Secret Protection:** API keys, passwords, JWT secrets, and other sensitive environment values must never be included in public status responses or error messages.

### 2. Password Security and Authentication

- **Password Hashing:** Uses `bcryptjs` with 10 salt rounds to hash passwords before storing them.
- **JWT-Based Sessions:** Uses signed JSON Web Tokens with a 24-hour lifetime to authenticate requests.
- **Token Validation:** Protected endpoints must verify token signatures and expiration before granting access.

### 3. User-Level Data Isolation

- **Authenticated Data Access:** Application and analysis-history queries are scoped to the authenticated user's ID, using conditions such as `WHERE user_id = req.user.id`.
- **Ownership Validation:** Create, read, update, and delete operations must verify record ownership to prevent users from accessing or modifying another student's data.

### 4. HTTP Security Headers

- **Helmet Integration:** Uses Helmet to configure HTTP security headers, including Content Security Policy where configured.
- **Browser-Side Protection:** These headers help reduce risks such as clickjacking and certain cross-site scripting (XSS) attacks. They complement, rather than replace, secure input handling, output encoding, and other application-level protections.

### 5. API Rate Limiting

- **Analysis Endpoint:** Configured to limit analysis requests to 20 calls per minute.
- **Authentication Endpoints:** Configured to limit authentication attempts to 30 requests per 15 minutes.
- **Abuse Mitigation:** Rate limiting helps reduce excessive requests and automated abuse. Its effectiveness depends on the configured routes, client identification, and deployment environment.

### 6. Deployment and Data-Persistence Considerations

The current Render Free deployment uses local SQLite storage without guaranteed persistence across service restarts or redeployments. Persistent storage and appropriate backup procedures are required if application history and user records must be retained reliably.

**Security note:** These controls reduce common application risks but do not, by themselves, establish that the application is fully secure or enterprise-certified. Claims should be confirmed against the current implementation and tested API behavior.
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
