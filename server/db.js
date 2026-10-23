import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'beep.db');
const db = new Database(DB_PATH);

// Enable foreign keys and WAL mode for high performance, concurrency & crash safety
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema and migrations tracking transactionally
const initSchemaTransaction = db.transaction(() => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      college TEXT,
      graduation_year TEXT,
      avatar TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      ref_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL COLLATE NOCASE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      github_url TEXT,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      match_score INTEGER,
      status TEXT NOT NULL DEFAULT 'Submitted',
      submitted_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_applications_user_email ON applications(user_email);
    CREATE INDEX IF NOT EXISTS idx_applications_ref_id ON applications(ref_id);

    CREATE TABLE IF NOT EXISTS quiz_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      target_role TEXT NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'expert',
      questions_public TEXT NOT NULL,
      answer_keys TEXT NOT NULL,
      user_answers TEXT,
      score INTEGER,
      status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
  `);

  // Record migrations
  const hasInit = db.prepare('SELECT 1 FROM _migrations WHERE name = ?').get('001_initial_schema');
  if (!hasInit) {
    db.prepare('INSERT INTO _migrations (name, applied_at) VALUES (?, ?)').run('001_initial_schema', new Date().toISOString());
  }

  const hasQuiz = db.prepare('SELECT 1 FROM _migrations WHERE name = ?').get('002_quiz_sessions_schema');
  if (!hasQuiz) {
    db.prepare('INSERT INTO _migrations (name, applied_at) VALUES (?, ?)').run('002_quiz_sessions_schema', new Date().toISOString());
  }
});

initSchemaTransaction();

// Clean up legacy flat JSON files (prevent lingering unencrypted personal data)
try {
  const legacyUsersFile = path.join(DATA_DIR, 'users.json');
  const legacyAppsFile = path.join(DATA_DIR, 'applications.json');
  if (fs.existsSync(legacyUsersFile)) fs.unlinkSync(legacyUsersFile);
  if (fs.existsSync(legacyAppsFile)) fs.unlinkSync(legacyAppsFile);
} catch {
  // ignore
}

// --- Exported User Queries ---
export const userQueries = {
  findByEmail(email) {
    if (!email) return null;
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
  },

  findById(id) {
    if (!id) return null;
    return db.prepare('SELECT id, email, name, college, graduation_year, avatar, created_at, updated_at FROM users WHERE id = ?').get(id);
  },

  createUser({ email, passwordHash, name, college, graduationYear, avatar }) {
    const id = 'usr_' + crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, college, graduation_year, avatar, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      email.trim().toLowerCase(),
      passwordHash,
      name.trim(),
      (college || 'College Student').trim(),
      (graduationYear || '2026').trim(),
      avatar || null,
      now,
      now
    );
    return this.findById(id);
  },

  updateProfile(id, { name, college, graduationYear, avatar }) {
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name),
          college = COALESCE(?, college),
          graduation_year = COALESCE(?, graduation_year),
          avatar = COALESCE(?, avatar),
          updated_at = ?
      WHERE id = ?
    `).run(name, college, graduationYear, avatar, now, id);
    return this.findById(id);
  }
};

// --- Exported Application Queries ---
export const applicationQueries = {
  createApplication({ refId, userId, userEmail, name, phone, githubUrl, role, company, matchScore }) {
    const id = 'app_' + crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO applications (id, ref_id, user_id, user_email, name, phone, github_url, role, company, match_score, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', ?)
    `).run(
      id,
      refId,
      userId,
      userEmail.trim().toLowerCase(),
      name.trim(),
      phone.trim(),
      (githubUrl || '').trim(),
      role.trim(),
      company.trim(),
      typeof matchScore === 'number' ? matchScore : null,
      now
    );
    return this.findByRefId(refId);
  },

  findByRefId(refId) {
    return db.prepare('SELECT * FROM applications WHERE ref_id = ?').get(refId);
  },

  listByUserId(userId) {
    return db.prepare('SELECT * FROM applications WHERE user_id = ? ORDER BY submitted_at DESC').all(userId);
  },

  listByUserEmail(email) {
    return db.prepare('SELECT * FROM applications WHERE user_email = ? ORDER BY submitted_at DESC').all(email.trim().toLowerCase());
  }
};

// --- Exported Quiz Session Queries ---
export const quizQueries = {
  createSession({ id, userId, targetRole, difficulty, questionsPublic, answerKeys }) {
    const sessionId = id || 'qz_' + crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO quiz_sessions (id, user_id, target_role, difficulty, questions_public, answer_keys, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'IN_PROGRESS', ?)
    `).run(
      sessionId,
      userId || null,
      targetRole || 'Software Engineering Intern',
      difficulty || 'expert',
      typeof questionsPublic === 'string' ? questionsPublic : JSON.stringify(questionsPublic),
      typeof answerKeys === 'string' ? answerKeys : JSON.stringify(answerKeys),
      now
    );
    return this.findById(sessionId);
  },

  findById(id) {
    if (!id) return null;
    return db.prepare('SELECT * FROM quiz_sessions WHERE id = ?').get(id);
  },

  completeSession(id, { userAnswers, score }) {
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE quiz_sessions
      SET user_answers = ?,
          score = ?,
          status = 'COMPLETED',
          completed_at = ?
      WHERE id = ?
    `).run(
      typeof userAnswers === 'string' ? userAnswers : JSON.stringify(userAnswers),
      score,
      now,
      id
    );
    return this.findById(id);
  },

  listByUserId(userId) {
    if (!userId) return [];
    return db.prepare('SELECT id, target_role, difficulty, score, status, created_at, completed_at FROM quiz_sessions WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  }
};

export default db;
