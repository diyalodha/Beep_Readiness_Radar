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
import { getGeminiConfig, isGeminiConfigured } from './services/geminiService.js';
import { analyzeResumeWithGemini } from './services/semanticAnalysisService.js';
import { validateInputPayload } from './services/analysisValidator.js';
import { generateExpertQuiz, gradeQuizSession } from './services/quizService.js';
import { runDynamicHeuristicAnalysis } from '../src/utils/heuristicCore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// --- Security: Ensure strong JWT_SECRET (Zero-Crash Fallback) ---
let JWT_SECRET = process.env.JWT_SECRET?.trim();
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  JWT_SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('[SECURITY NOTICE] No strong JWT_SECRET set in .env. Generated secure in-memory 256-bit secret for this runtime session.');
}

// --- Security Headers via Helmet ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: [
        "'self'", 
        'https:', 
        'http://localhost:5000', 
        'http://localhost:5173', 
        'http://127.0.0.1:5173', 
        'https://generativelanguage.googleapis.com'
      ],
      frameSrc: ["'self'", 'blob:', 'data:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// --- CORS Configuration ---
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const configuredOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : defaultOrigins;
const ALLOWED_ORIGINS = new Set(configuredOrigins);

app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.has(origin) || ALLOWED_ORIGINS.has('*') || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        /\.(onrender\.com|vercel\.app|railway\.app|fly\.dev)$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '4mb' }));

// --- Rate Limiters ---
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many analysis requests. Please wait a minute and try again.' },
});

const quizLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many quiz requests. Please wait a minute and try again.' },
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
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication session.' });
  }
}

// ==========================================
// 1. HEALTH AND STATUS ENDPOINT (SAFE METADATA)
// ==========================================
app.get('/api/status', (req, res) => {
  const { isConfigured, model, provider } = getGeminiConfig();

  res.json({
    status: 'ok',
    aiEnabled: isConfigured,
    aiConfigured: isConfigured,
    engine: isConfigured ? `Gemini LLM (${model})` : 'Fallback Analysis (Heuristic Engine)',
    model: isConfigured ? model : null,
    provider,
    database: 'SQLite (WAL Mode)',
    persistenceNotice: 'Render Free web services run on ephemeral disks. For permanent storage across re-deploys, mount a persistent disk.',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. AUTHENTICATION ENDPOINTS
// ==========================================
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

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

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = userQueries.findByEmail(cleanEmail);

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
// 3. APPLICATION TRACKING ENDPOINTS
// ==========================================
function generateRefId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `BEEP-${stamp}-${rand}`;
}

app.post('/api/applications', authMiddleware, (req, res) => {
  const { phone, githubUrl, role, company, matchScore } = req.body || {};
  const errors = [];

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
// 4. SEMANTIC LLM RESUME ANALYSIS ENDPOINT
// ==========================================
app.post('/api/analyze', analyzeLimiter, async (req, res) => {
  const { studentSkills, jobDescription, targetRole, companyName } = req.body || {};

  const validation = validateInputPayload({
    resumeText: studentSkills,
    jobDescription,
    targetRole,
    companyName
  });

  if (!validation.isValid) {
    return res.status(400).json({ error: 'Validation failed', details: validation.errors });
  }

  try {
    const analysis = await analyzeResumeWithGemini(
      studentSkills,
      jobDescription,
      targetRole || 'Internship Candidate',
      companyName || 'Target Company'
    );
    return res.json(analysis);
  } catch (err) {
    console.error('Analysis execution error:', err);
    return res.status(500).json({ error: 'Analysis failed due to a server error.' });
  }
});

// ==========================================
// 5. EXPERT ADAPTIVE QUIZ ENDPOINTS
// ==========================================

// Generate Expert Quiz (Zero answer leakage)
app.post('/api/quiz/generate', quizLimiter, async (req, res) => {
  const { targetRole, jobDescription, skillGaps, difficulty, questionCount } = req.body || {};

  // Extract optional user ID if auth header exists
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      userId = decoded.id;
    } catch {
      // Guest testing permitted
    }
  }

  try {
    const quiz = await generateExpertQuiz({
      targetRole: typeof targetRole === 'string' && targetRole.trim() ? targetRole.trim() : 'Software Engineering Intern',
      jobDescription: typeof jobDescription === 'string' ? jobDescription : '',
      skillGaps: Array.isArray(skillGaps) ? skillGaps : [],
      difficulty: typeof difficulty === 'string' ? difficulty : 'expert',
      questionCount: typeof questionCount === 'number' && questionCount > 0 && questionCount <= 10 ? questionCount : 5,
      userId
    });

    return res.json(quiz);
  } catch (err) {
    console.error('Quiz generation error:', err);
    return res.status(500).json({ error: 'Failed to generate quiz assessment.' });
  }
});

// Grade Expert Quiz (Server-Side Evaluation & Explanations)
app.post('/api/quiz/grade', quizLimiter, async (req, res) => {
  const { sessionId, userAnswers } = req.body || {};

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'A valid sessionId string is required.' });
  }
  if (!userAnswers || typeof userAnswers !== 'object') {
    return res.status(400).json({ error: 'userAnswers object is required.' });
  }

  // Extract optional user ID
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      userId = decoded.id;
    } catch {
      // ignore
    }
  }

  try {
    const graded = await gradeQuizSession(sessionId, userAnswers, userId);
    return res.json(graded);
  } catch (err) {
    console.error('Quiz grading error:', err);
    return res.status(400).json({ error: err.message || 'Failed to grade quiz session.' });
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

export { app, runDynamicHeuristicAnalysis };

// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error('[Beep Server Error]:', err?.message || err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('[Beep Unhandled Rejection]:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Beep Uncaught Exception]:', err);
});

// Only bind listener if executed directly (supports test runner importing app)
const isDirectRun = !process.env.NODE_TEST_CONTEXT && process.argv[1] && (
  process.argv[1].endsWith('index.js') || 
  process.argv[1].endsWith('server') ||
  process.argv[1].includes('server' + path.sep + 'index.js') ||
  process.argv[1].includes('server/index.js')
);

if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`[Beep Server] Backend API running at http://localhost:${PORT}`);
    console.log(`[Beep Server] Persistence: SQLite active with WAL journal mode`);
    console.log(`[Beep Server] Security: JWT sessions active, Helmet CSP enabled`);
    console.log(`[Beep Server] Mode: ${isGeminiConfigured() ? 'Live Gemini LLM' : 'Curated Heuristic Fallback'}`);
  });
}
