import fs from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { userQueries, applicationQueries } from './db.js';
import { runDynamicHeuristicAnalysis } from '../src/utils/heuristicCore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// --- Security: Fail startup if JWT_SECRET is missing or weak in production ---
let JWT_SECRET = process.env.JWT_SECRET?.trim();
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[FATAL SECURITY ERROR] JWT_SECRET must be configured with at least 32 characters in production.');
    process.exit(1);
  } else {
    JWT_SECRET = crypto.randomBytes(32).toString('hex');
    console.warn('[SECURITY NOTICE] No JWT_SECRET set in .env. Generated temporary in-memory 256-bit secret for this development session.');
  }
} else if (JWT_SECRET.length < 32 && process.env.NODE_ENV === 'production') {
  console.error('[FATAL SECURITY ERROR] JWT_SECRET must be at least 32 characters long in production.');
  process.exit(1);
}

// --- Security Headers via Helmet ---
// Configured with Content Security Policy allowing necessary local development and blob previews
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'http://localhost:5000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'https://generativelanguage.googleapis.com'],
      frameSrc: ["'self'", 'blob:'], // allows sandboxed PDF preview iframe
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// --- CORS: configurable via environment with local development defaults ---
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const configuredOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : defaultOrigins;
const ALLOWED_ORIGINS = new Set(configuredOrigins);

app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS policy'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '4mb' }));

// --- Rate Limiters ---
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many analysis requests. Please wait a minute and try again.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
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
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
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
    aiEnabled: hasKey,
    engine: hasKey ? 'Gemini 2.5 Flash (Live AI)' : 'Curated Heuristic Engine (Demo Mode)'
  });
});

// ==========================================
// 2. AUTHENTICATION ENDPOINTS (NO ACCOUNT ENUMERATION)
// ==========================================

// Password policy: minimum 8 characters, at least 1 letter and 1 number
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

// Student Registration
app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { name, email, password, college, graduationYear } = req.body || {};

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!name || typeof name !== 'string' || !name.trim() || name.length > 100) {
    return res.status(400).json({ error: 'Full name is required (up to 100 characters).' });
  }
  if (!password || typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long and contain both letters and numbers.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = userQueries.findByEmail(cleanEmail);
  if (existing) {
    // Generic response to mitigate email enumeration
    return res.status(400).json({ error: 'Unable to complete registration with the provided details. Please try signing in.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = userQueries.createUser({
      email: cleanEmail,
      passwordHash,
      name: name.trim(),
      college: (college || 'College Student').trim().slice(0, 150),
      graduationYear: (graduationYear || '2026').trim().slice(0, 50),
      avatar: null
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '24h' }
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

// Student Login (Constant-time check to prevent timing-based user enumeration)
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = userQueries.findByEmail(cleanEmail);

  // Constant-time dummy hash comparison to prevent timing-based enumeration
  const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  const hashToCompare = user ? user.password_hash : DUMMY_HASH;
  const passwordMatch = await bcrypt.compare(password, hashToCompare);

  if (!user || !passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
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

// ==========================================
// 3. APPLICATION TRACKING ENDPOINTS (STRICT ISOLATION)
// ==========================================

function generateRefId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `BEEP-${stamp}-${rand}`;
}

// Submit a new application (Strictly bound to authenticated student)
app.post('/api/applications', authMiddleware, (req, res) => {
  const { phone, githubUrl, role, company, matchScore } = req.body || {};
  const errors = [];

  // Strictly bind name and email to authenticated session
  const name = req.user.name;
  const email = req.user.email;

  if (typeof role !== 'string' || !role.trim() || role.length > 100) {
    errors.push('Role is required (max 100 characters)');
  }
  if (typeof company !== 'string' || !company.trim() || company.length > 100) {
    errors.push('Company is required (max 100 characters)');
  }

  const cleanPhone = (phone || '').toString().replace(/[\s-]/g, '');
  if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
    errors.push('Valid phone number is required (10-15 digits)');
  }

  if (githubUrl && typeof githubUrl === 'string' && githubUrl.trim()) {
    const cleanUrl = githubUrl.trim();
    if (!/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(cleanUrl)) {
      errors.push('GitHub URL must be a valid HTTP or HTTPS link');
    }
  }

  if (matchScore !== undefined && matchScore !== null && (typeof matchScore !== 'number' || matchScore < 0 || matchScore > 100)) {
    errors.push('matchScore must be a number between 0 and 100');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  let record = null;
  let attempts = 0;
  while (!record && attempts < 5) {
    try {
      const refId = generateRefId();
      record = applicationQueries.createApplication({
        refId,
        userId: req.user.id,
        userEmail: email,
        name: name,
        phone: cleanPhone,
        githubUrl: (githubUrl || '').trim(),
        role: role.trim(),
        company: company.trim(),
        matchScore: typeof matchScore === 'number' ? matchScore : null
      });
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        attempts++;
      } else {
        console.error('Failed to persist application:', err);
        return res.status(500).json({ error: 'Could not save application to the database.' });
      }
    }
  }

  if (!record) {
    return res.status(500).json({ error: 'Failed to generate unique application ID. Please retry.' });
  }

  return res.status(201).json({
    ok: true,
    refId: record.ref_id,
    submittedAt: record.submitted_at,
    status: record.status
  });
});

// Get applications (STRICT ISOLATION: returns ONLY the authenticated user's records)
app.get('/api/applications', authMiddleware, (req, res) => {
  try {
    const apps = applicationQueries.listByUserId(req.user.id);
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

// Comprehensive Schema Validator for AI Output
function validateAIResult(data) {
  if (!data || typeof data !== 'object') return 'Response is not an object.';
  if (typeof data.matchScore !== 'number' || Number.isNaN(data.matchScore) || data.matchScore < 0 || data.matchScore > 100) {
    return 'matchScore must be a number between 0 and 100.';
  }
  if (typeof data.targetRole !== 'string' || typeof data.company !== 'string') {
    return 'targetRole and company must be strings.';
  }
  if (!data.skillsBreakdown || typeof data.skillsBreakdown !== 'object') {
    return 'skillsBreakdown is missing.';
  }
  for (const key of ['matched', 'transferable', 'missingCritical']) {
    if (!Array.isArray(data.skillsBreakdown[key])) return `skillsBreakdown.${key} must be an array.`;
    if (data.skillsBreakdown[key].length > 100) return `skillsBreakdown.${key} exceeds size limit.`;
    for (const item of data.skillsBreakdown[key]) {
      if (typeof item !== 'string') return `skillsBreakdown.${key} items must be strings.`;
    }
  }
  if (!Array.isArray(data.sevenDayPlan) || data.sevenDayPlan.length < 1) {
    return 'sevenDayPlan must be an array with at least one entry.';
  }
  for (const dayEntry of data.sevenDayPlan) {
    if (typeof dayEntry !== 'object' || typeof dayEntry.day !== 'string' || typeof dayEntry.phase !== 'string') {
      return 'sevenDayPlan entries must have day and phase strings.';
    }
    if (!Array.isArray(dayEntry.tasks)) return 'sevenDayPlan tasks must be an array.';
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
You are a career mentor for Beep, evaluating an Indian college student's resume against an internship job description.
Calculate an honest match score that accurately reflects whether the candidate has the required technical stack.

IMPORTANT CONSTRAINTS:
- Do NOT invent metrics, percentages, or achievements the candidate did not explicitly state.
- When suggesting resume bullets, use bracketed placeholders like [X]%, [N] tests, [Y]% uptime so the student fills in real numbers.
- Do NOT claim you verified external code or live links; only evaluate what is written in the text.

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
      "description": "Specific explanation of why an ATS or recruiter might flag or pass this"
    }
  ],
  "scoreBreakdown": {
    "mustHaveCoverage": "Percentage of required skills possessed",
    "transferableBonus": "Bonus potential from related skills",
    "riskFactor": "Areas where the resume lacks required keywords"
  },
  "skillsBreakdown": {
    "matched": ["SKILL1", "SKILL2"],
    "transferable": ["SKILL3 (Bridgeable)"],
    "missingCritical": ["MISSING_SKILL1", "MISSING_SKILL2"]
  },
  "recruiterInsight": "Direct, empathetic 2-sentence explanation of what a recruiter typically notices when reading this specific resume for this role.",
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
    "coldPitchMessage": "A concise 4-sentence high-intent outreach template with bracketed fields the student fills in."
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
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
        }),
        signal: controller.signal
      }
    );
    clearTimeout(timeoutHandle);

    if (!response.ok) {
      const fallbackResult = runDynamicHeuristicAnalysis(studentSkills, jobDescription, targetRole, companyName);
      fallbackResult.fallbackNotice = `Gemini API returned status ${response.status}. Evaluated using offline heuristic engine.`;
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
      fallbackResult.fallbackNotice = `AI output failed validation (${validationError}). Showing heuristic match results.`;
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
    const reason = error.name === 'AbortError' ? 'Gemini API timed out after 15 seconds.' : 'AI provider connection error.';
    console.error('Error during AI analysis, invoking fallback:', error.message);
    const fallbackResult = runDynamicHeuristicAnalysis(studentSkills, jobDescription, targetRole, companyName);
    fallbackResult.fallbackNotice = `${reason} Showing heuristic match estimate instead.`;
    return res.json(fallbackResult);
  }
});

// --- Serve Production Client Bundle ---
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

export { runDynamicHeuristicAnalysis };

app.listen(PORT, () => {
  console.log(`[Beep Server] Backend API running at http://localhost:${PORT}`);
  console.log(`[Beep Server] Persistence: SQLite active with WAL journal mode`);
  console.log(`[Beep Server] Security: JWT sessions active, Helmet CSP enabled`);
  console.log(`[Beep Server] Mode: ${process.env.GEMINI_API_KEY ? 'Live Gemini AI' : 'Curated Heuristic Engine'}`);
});
