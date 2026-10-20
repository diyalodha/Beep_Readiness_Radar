import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { userQueries, applicationQueries } from './db.js';
import { runDynamicHeuristicAnalysis } from '../src/utils/heuristicCore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'beep-founder-office-secure-jwt-key-2026';

// --- Security Headers via Helmet ---
// Configure Helmet to allow Vite dev mode and safe iframe preview of documents
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  frameguard: false, // allows same-origin PDF previews in modal
}));

// --- CORS: restrict to known development origins ---
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '4mb' }));

// --- Rate Limiting ---
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many analysis requests. Please wait a minute and try again.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
});

// --- Authentication Middleware ---
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No session token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication session.' });
  }
}

// ==========================================
// 1. HEALTH AND STATUS ENDPOINT
// ==========================================
app.get('/api/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  res.json({
    status: 'ok',
    database: 'SQLite (WAL mode)',
    security: 'JWT + bcrypt + Helmet active',
    aiEnabled: hasKey,
    engine: hasKey ? 'Gemini 2.5 Flash (Live AI)' : 'Curated Heuristic Engine (Demo Mode)',
    message: hasKey
      ? 'Genuine AI analysis engine active via backend Gemini API.'
      : 'Running in Demo/Heuristic mode. Add GEMINI_API_KEY to server .env for live LLM extraction.'
  });
});

// ==========================================
// 2. AUTHENTICATION ENDPOINTS
// ==========================================

// Check if an email is registered (for step-by-step UI UX)
app.post('/api/auth/check-email', (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email is required' });
  }
  const clean = email.trim().toLowerCase();
  const user = userQueries.findByEmail(clean);
  if (user) {
    return res.json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        college: user.college,
        graduationYear: user.graduation_year,
        avatar: user.avatar
      }
    });
  }
  return res.json({ exists: false });
});

// Student Registration
app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { name, email, password, college, graduationYear } = req.body || {};

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required.' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = userQueries.findByEmail(cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = userQueries.createUser({
      email: cleanEmail,
      passwordHash,
      name: name.trim(),
      college: (college || 'College Student (India)').trim(),
      graduationYear: (graduationYear || '2026').trim(),
      avatar: null
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      ok: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        college: newUser.college,
        graduationYear: newUser.graduation_year,
        avatar: newUser.avatar,
        createdAt: newUser.created_at
      },
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed due to a server error.' });
  }
});

// Student Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = userQueries.findByEmail(cleanEmail);
  if (!user) {
    // Constant-time style response to prevent email enumeration
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      college: user.college,
      graduationYear: user.graduation_year,
      avatar: user.avatar,
      createdAt: user.created_at
    },
    token
  });
});

// Verify current session / token
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = userQueries.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }
  return res.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      college: user.college,
      graduationYear: user.graduation_year,
      avatar: user.avatar,
      createdAt: user.created_at
    }
  });
});

// Backward compatibility helper for legacy lookup
app.get('/api/users/lookup', (req, res) => {
  const { email } = req.query;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email is required' });
  }
  const user = userQueries.findByEmail(email.trim().toLowerCase());
  if (user) {
    return res.json({
      found: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        college: user.college,
        graduationYear: user.graduation_year,
        avatar: user.avatar
      }
    });
  }
  return res.json({ found: false });
});

// ==========================================
// 3. APPLICATION TRACKING ENDPOINTS (PROTECTED)
// ==========================================

function generateRefId() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `BEEP-${stamp}-${rand}`;
}

// Submit a new application (Strictly bound to authenticated student)
app.post('/api/applications', authMiddleware, (req, res) => {
  const { name, phone, githubUrl, role, company, matchScore } = req.body || {};
  const errors = [];

  if (typeof name !== 'string' || !name.trim()) errors.push('Applicant name is required');
  if (typeof phone !== 'string' || phone.trim().length < 6) errors.push('Valid phone number is required');
  if (typeof role !== 'string' || !role.trim()) errors.push('Role is required');
  if (githubUrl !== undefined && githubUrl !== '' && typeof githubUrl !== 'string') {
    errors.push('githubUrl must be a string');
  }
  if (matchScore !== undefined && matchScore !== null && (typeof matchScore !== 'number' || matchScore < 0 || matchScore > 100)) {
    errors.push('matchScore must be a number between 0 and 100');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid application payload', details: errors });
  }

  const refId = generateRefId();

  try {
    const record = applicationQueries.createApplication({
      refId,
      userId: req.user.id,
      userEmail: req.user.email,
      name: name.trim(),
      phone: phone.trim(),
      githubUrl: (githubUrl || '').trim(),
      role: role.trim(),
      company: (company || 'Hiring Partner').trim(),
      matchScore: typeof matchScore === 'number' ? matchScore : null
    });

    return res.status(201).json({
      ok: true,
      refId: record.ref_id,
      submittedAt: record.submitted_at,
      status: record.status
    });
  } catch (err) {
    console.error('Failed to persist application:', err);
    return res.status(500).json({ error: 'Could not save application to the database.' });
  }
});

// Get applications (STRICT ISOLATION: returns ONLY the authenticated user's records)
app.get('/api/applications', authMiddleware, (req, res) => {
  try {
    const apps = applicationQueries.listByUserId(req.user.id);
    // Format response objects cleanly
    const formatted = apps.map(a => ({
      refId: a.ref_id,
      name: a.name,
      email: a.user_email,
      phone: a.phone,
      githubUrl: a.github_url,
      role: a.role,
      company: a.company,
      matchScore: a.match_score,
      status: a.status,
      submittedAt: a.submitted_at
    }));

    return res.json({ applications: formatted });
  } catch (err) {
    console.error('Failed to read applications:', err);
    return res.status(500).json({ error: 'Could not retrieve applications.' });
  }
});

// ==========================================
// 4. AI & HEURISTIC ANALYSIS ENDPOINT
// ==========================================

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
  return null;
}

app.post('/api/analyze', analyzeLimiter, async (req, res) => {
  const validationErrors = validateAnalyzeBody(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: 'Invalid request', details: validationErrors });
  }

  const { studentSkills, jobDescription, targetRole, companyName } = req.body;
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // Heuristic mode: no Gemini key configured
  if (!apiKey) {
    const heuristicResult = runDynamicHeuristicAnalysis(studentSkills, jobDescription, targetRole, companyName);
    return res.json(heuristicResult);
  }

  // Live Gemini analysis with a hard 15s timeout
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

export { runDynamicHeuristicAnalysis };

app.listen(PORT, () => {
  console.log(`[Beep Server] Backend API running at http://localhost:${PORT}`);
  console.log(`[Beep Server] Database: SQLite persistent storage active at server/data/beep.db`);
  console.log(`[Beep Server] Security: JWT authentication + Helmet headers active`);
  console.log(`[Beep Server] Mode: ${process.env.GEMINI_API_KEY ? 'Live Gemini AI' : 'Demo / Dynamic Heuristic Mode'}`);
});
