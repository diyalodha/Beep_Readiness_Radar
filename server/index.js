import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runDynamicHeuristicAnalysis } from '../src/utils/heuristicCore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS: restrict to known development origins ---
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);
app.use(cors({
  origin(origin, callback) {
    // Allow same-origin / curl / no-Origin requests (e.g., server-to-server).
    if (!origin || ALLOWED_ORIGINS.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: false,
}));

app.use(express.json({ limit: '4mb' }));

// --- Rate limiter for the analysis endpoint ---
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many analysis requests. Please wait a minute and try again.' },
});

// Health and AI status check endpoint
app.get('/api/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  res.json({
    status: 'ok',
    aiEnabled: hasKey,
    engine: hasKey ? 'Gemini 2.5 Flash (Live AI)' : 'Curated Heuristic Engine (Demo Mode)',
    message: hasKey
      ? 'Genuine AI analysis engine active via backend Gemini API.'
      : 'Running in Demo/Heuristic mode. Add GEMINI_API_KEY to server .env for live LLM extraction.'
  });
});

// ---------- Heuristic engine (imported from src/utils/heuristicCore.js) ----------

// ---------- Request body validation ----------
const MAX_FIELD_CHARS = 50000;
function validateAnalyzeBody(body) {
  const errors = [];
  const { studentSkills, jobDescription, targetRole, companyName } = body || {};
  if (typeof studentSkills !== 'string' || studentSkills.trim().length === 0) {
    errors.push('studentSkills must be a non-empty string.');
  } else if (studentSkills.length > MAX_FIELD_CHARS) {
    errors.push(`studentSkills exceeds the ${MAX_FIELD_CHARS} character limit.`);
  }
  if (typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
    errors.push('jobDescription must be a non-empty string.');
  } else if (jobDescription.length > MAX_FIELD_CHARS) {
    errors.push(`jobDescription exceeds the ${MAX_FIELD_CHARS} character limit.`);
  }
  if (targetRole !== undefined && (typeof targetRole !== 'string' || targetRole.length > 200)) {
    errors.push('targetRole must be a string under 200 characters.');
  }
  if (companyName !== undefined && (typeof companyName !== 'string' || companyName.length > 200)) {
    errors.push('companyName must be a string under 200 characters.');
  }
  return errors;
}

// ---------- AI output schema validation ----------
function validateAIResult(data) {
  if (!data || typeof data !== 'object') return 'Response is not an object.';
  if (typeof data.matchScore !== 'number' || Number.isNaN(data.matchScore) || data.matchScore < 0 || data.matchScore > 100) {
    return 'matchScore must be a number between 0 and 100.';
  }
  if (!data.skillsBreakdown || typeof data.skillsBreakdown !== 'object') {
    return 'skillsBreakdown is missing.';
  }
  for (const key of ['matched', 'transferable', 'missingCritical']) {
    if (!Array.isArray(data.skillsBreakdown[key])) return `skillsBreakdown.${key} must be an array.`;
    if (data.skillsBreakdown[key].length > 100) return `skillsBreakdown.${key} is too large.`;
  }
  if (!Array.isArray(data.sevenDayPlan) || data.sevenDayPlan.length < 1) {
    return 'sevenDayPlan must be an array with at least one entry.';
  }
  if (typeof data.targetRole !== 'string' || typeof data.company !== 'string') {
    return 'targetRole and company must be strings.';
  }
  return null; // valid
}

// ---------- Analysis endpoint ----------
app.post('/api/analyze', analyzeLimiter, async (req, res) => {
  const validationErrors = validateAnalyzeBody(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: 'Invalid request', details: validationErrors });
  }

  const { studentSkills, jobDescription, targetRole, companyName } = req.body;
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // Heuristic mode: no Gemini key configured.
  if (!apiKey) {
    const heuristicResult = runDynamicHeuristicAnalysis(studentSkills, jobDescription, targetRole, companyName);
    return res.json(heuristicResult);
  }

  // Live Gemini analysis with a hard 15s timeout.
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), 15_000);

  try {
    const prompt = `
You are a senior hiring partner and career mentor for Beep, an AI career platform for college students in India.
Analyze this student's actual resume against the target internship job description.
Calculate a strictly DYNAMIC score that genuinely reflects whether the resume is beginner, intermediate, or advanced for this role.

IMPORTANT RULES:
- Do NOT invent metrics, percentages, or achievements the candidate did not state.
- When suggesting resume bullets, use bracketed placeholders like [X]%, [N] tests, [Y]% uptime so the student fills in real numbers.
- Only describe recruiter/ATS behavior as general industry observation, never as a guaranteed outcome.

STUDENT RESUME CONTENT:
${studentSkills}

TARGET INTERNSHIP JOB DESCRIPTION:
${jobDescription}

TARGET ROLE TITLE:
${targetRole || 'Internship Candidate'}

COMPANY NAME:
${companyName || 'Target Company'}

Respond strictly with valid JSON without any markdown formatting or backticks:
{
  "targetRole": "${targetRole || 'Internship Candidate'}",
  "company": "${companyName || 'Target Company'}",
  "matchScore": 68,
  "readinessLevel": "High Match - Ready to Apply | Moderate Match - 7-Day Sprint Needed | Developing Match",
  "badgeColor": "emerald | blue | amber",
  "resumeStats": {
    "wordCount": 240,
    "hasLiveLinks": true,
    "hasMetrics": true,
    "skillsIdentified": 8
  },
  "silentRejectionFlags": [
    {
      "type": "critical | warning | pass",
      "title": "Clear short flag title",
      "description": "Specific explanation of why an ATS or Indian tech recruiter might flag or pass this"
    }
  ],
  "scoreBreakdown": {
    "mustHaveCoverage": "Percentage of non-negotiable skills possessed",
    "transferableBonus": "Bonus potential from related skills",
    "riskFactor": "Why automated ATS or recruiters might drop this resume"
  },
  "skillsBreakdown": {
    "matched": ["SKILL1", "SKILL2"],
    "transferable": ["SKILL3 (Bridgeable)"],
    "missingCritical": ["MISSING_SKILL1", "MISSING_SKILL2"]
  },
  "recruiterInsight": "Direct, empathetic 2-sentence explanation of what an Indian tech/startup recruiter will typically notice when reading this specific resume for this role.",
  "proofOfWorkProject": {
    "title": "Clear Name for a 48-Hour Micro Project",
    "deliverable": "Specific description of what the student should build over a weekend to prove the #1 missing skill. Only claim metrics the student actually measures.",
    "estimatedHours": "6-8 hours"
  },
  "sevenDayPlan": [
    { "day": "Day 1 & 2", "phase": "Core Concept Immersion", "tasks": ["Task 1", "Task 2"] },
    { "day": "Day 3 & 4", "phase": "The 48-Hour Proof-of-Work Project", "tasks": ["Task 1", "Task 2"] },
    { "day": "Day 5", "phase": "Resume Optimization (Google XYZ Formula)", "tasks": ["Task 1", "Task 2"] },
    { "day": "Day 6", "phase": "Targeted Outreach", "tasks": ["Task 1", "Task 2"] },
    { "day": "Day 7", "phase": "Final Preparation & Submission", "tasks": ["Task 1", "Task 2"] }
  ],
  "applicationBooster": {
    "metricNotice": "Replace every [X]/[Y]/[N] placeholder with a real measured number before adding these bullets to your resume.",
    "tailoredBullets": [
      "XYZ bullet using bracketed placeholders like [X]% - never invented numbers",
      "Another bullet using [Y] placeholders",
      "Third bullet using [N]/[M] placeholders"
    ],
    "coldPitchMessage": "A concise 4-sentence high-intent LinkedIn DM template with bracketed fields the student fills in."
  }
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json' }
        }),
        signal: controller.signal
      }
    );
    clearTimeout(timeoutHandle);

    if (!response.ok) {
      const fallbackResult = runDynamicHeuristicAnalysis(studentSkills, jobDescription, targetRole, companyName);
      fallbackResult.fallbackNotice = `Gemini API returned ${response.status}. Showing heuristic results instead.`;
      return res.json(fallbackResult);
    }

    const result = await response.json();
    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error('No content returned from Gemini model');

    const cleanedText = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    // Validate the AI-produced structure before handing it to the client.
    const validationError = validateAIResult(parsedData);
    if (validationError) {
      const fallbackResult = runDynamicHeuristicAnalysis(studentSkills, jobDescription, targetRole, companyName);
      fallbackResult.fallbackNotice = `AI response failed schema validation (${validationError}). Falling back to heuristic engine.`;
      return res.json(fallbackResult);
    }

    return res.json({
      ...parsedData,
      isAIGenerated: true,
      engine: 'Gemini 2.5 Flash (Live AI)',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    clearTimeout(timeoutHandle);
    const reason = error.name === 'AbortError' ? 'Gemini API timed out after 15 seconds.' : 'Live AI error occurred.';
    console.error('Error during AI analysis, invoking fallback:', error);
    const fallbackResult = runDynamicHeuristicAnalysis(studentSkills, jobDescription, targetRole, companyName);
    fallbackResult.fallbackNotice = `${reason} Fallback dynamic heuristic analysis loaded.`;
    return res.json(fallbackResult);
  }
});

// ---------- Application persistence ----------
const DATA_DIR = path.join(__dirname, 'data');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');

function ensureApplicationsFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(APPLICATIONS_FILE)) fs.writeFileSync(APPLICATIONS_FILE, '[]', 'utf8');
}

function readApplications() {
  ensureApplicationsFile();
  try {
    return JSON.parse(fs.readFileSync(APPLICATIONS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function appendApplication(app) {
  const all = readApplications();
  all.push(app);
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(all, null, 2), 'utf8');
}

function generateRefId() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `BEEP-${stamp}-${rand}`;
}

app.post('/api/applications', (req, res) => {
  const { name, email, phone, githubUrl, role, company, matchScore } = req.body || {};
  const errors = [];
  if (typeof name !== 'string' || !name.trim()) errors.push('name is required');
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) errors.push('a valid email is required');
  if (typeof phone !== 'string' || phone.trim().length < 6) errors.push('phone is required');
  if (typeof role !== 'string' || !role.trim()) errors.push('role is required');
  if (githubUrl !== undefined && githubUrl !== '' && typeof githubUrl !== 'string') errors.push('githubUrl must be a string');
  if (matchScore !== undefined && (typeof matchScore !== 'number' || matchScore < 0 || matchScore > 100)) {
    errors.push('matchScore must be a number between 0 and 100');
  }
  if (errors.length > 0) return res.status(400).json({ error: 'Invalid application payload', details: errors });

  const record = {
    refId: generateRefId(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    githubUrl: (githubUrl || '').trim(),
    role: role.trim(),
    company: (company || '').trim(),
    matchScore: typeof matchScore === 'number' ? matchScore : null,
    submittedAt: new Date().toISOString()
  };

  try {
    appendApplication(record);
  } catch (err) {
    console.error('Failed to persist application:', err);
    return res.status(500).json({ error: 'Could not save application on the server.' });
  }

  return res.json({ ok: true, refId: record.refId, submittedAt: record.submittedAt });
});

app.get('/api/applications', (req, res) => {
  const { email } = req.query;
  const all = readApplications();
  if (email && typeof email === 'string') {
    const clean = email.trim().toLowerCase();
    const filtered = all.filter(a => a.email && a.email.toLowerCase() === clean);
    return res.json({ applications: filtered });
  }
  return res.json({ applications: all });
});

// ---------- User Profile persistence ----------
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureUsersFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]', 'utf8');
}

function readUsers() {
  ensureUsersFile();
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveUserRecord(userData) {
  const all = readUsers();
  const existingIdx = all.findIndex(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existingIdx >= 0) {
    all[existingIdx] = { ...all[existingIdx], ...userData, updatedAt: new Date().toISOString() };
  } else {
    all.push({ ...userData, createdAt: new Date().toISOString() });
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(all, null, 2), 'utf8');
  return all.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
}

app.get('/api/users/lookup', (req, res) => {
  const { email } = req.query;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email is required' });
  }
  const all = readUsers();
  const found = all.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (found) {
    return res.json({ found: true, user: found });
  }
  return res.json({ found: false });
});

app.post('/api/users', (req, res) => {
  const { name, email, college, graduationYear, avatar } = req.body || {};
  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required' });
  }
  const cleanUser = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    college: (college || 'College Student').trim(),
    graduationYear: (graduationYear || '').trim(),
    avatar: avatar || null
  };
  const saved = saveUserRecord(cleanUser);
  return res.json({ ok: true, user: saved });
});

// ---------- Client-safe analysis fallback (exported for reuse) ----------
export { runDynamicHeuristicAnalysis };

app.listen(PORT, () => {
  console.log(`[Beep Server] Backend API running at http://localhost:${PORT}`);
  console.log(`[Beep Server] Mode: ${process.env.GEMINI_API_KEY ? 'Live Gemini AI' : 'Demo / Dynamic Heuristic Mode'}`);
});
