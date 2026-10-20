import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'beep.db');
const db = new Database(DB_PATH);

// Enable foreign keys and WAL mode for high performance & reliability
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
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
`);

// Safe Migration: import legacy JSON data if database is empty
function migrateLegacyJson() {
  const usersFile = path.join(DATA_DIR, 'users.json');
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

  if (userCount === 0 && fs.existsSync(usersFile)) {
    try {
      const legacyUsers = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      if (Array.isArray(legacyUsers)) {
        const defaultHash = bcrypt.hashSync('Beep@2026', 10);
        const insertUser = db.prepare(`
          INSERT OR IGNORE INTO users (id, email, password_hash, name, college, graduation_year, avatar, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const u of legacyUsers) {
          if (u.email && u.name) {
            const userId = 'usr_' + Math.random().toString(36).substring(2, 10);
            insertUser.run(
              userId,
              u.email.trim().toLowerCase(),
              defaultHash,
              u.name.trim(),
              u.college || 'College Student',
              u.graduationYear || '2026',
              u.avatar || null,
              u.createdAt || new Date().toISOString(),
              new Date().toISOString()
            );
          }
        }
        console.log(`[Database] Migrated ${legacyUsers.length} legacy user(s) into SQLite.`);
      }
    } catch (err) {
      console.warn('[Database] Legacy user migration skipped:', err.message);
    }
  }

  // Migrate applications for legitimate users (skipping obsolete demo entries)
  const appsFile = path.join(DATA_DIR, 'applications.json');
  const appCount = db.prepare('SELECT COUNT(*) as count FROM applications').get().count;

  if (appCount === 0 && fs.existsSync(appsFile)) {
    try {
      const legacyApps = JSON.parse(fs.readFileSync(appsFile, 'utf8'));
      if (Array.isArray(legacyApps)) {
        const insertApp = db.prepare(`
          INSERT OR IGNORE INTO applications (id, ref_id, user_id, user_email, name, phone, github_url, role, company, match_score, status, submitted_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const a of legacyApps) {
          // Skip old dummy test entries with Priya Sharma
          if (a.name?.toLowerCase().includes('priya')) continue;

          // Find or create associated user ID
          let userRow = db.prepare('SELECT id FROM users WHERE email = ?').get(a.email?.toLowerCase());
          let userId = userRow?.id;
          if (!userId) {
            userId = 'usr_' + Math.random().toString(36).substring(2, 10);
            const defaultHash = bcrypt.hashSync('Beep@2026', 10);
            db.prepare(`
              INSERT OR IGNORE INTO users (id, email, password_hash, name, college, graduation_year, avatar, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(userId, a.email.toLowerCase(), defaultHash, a.name, 'Student', '2026', null, new Date().toISOString(), new Date().toISOString());
          }

          const appId = 'app_' + Math.random().toString(36).substring(2, 10);
          insertApp.run(
            appId,
            a.refId,
            userId,
            a.email.toLowerCase(),
            a.name,
            a.phone || '',
            a.githubUrl || '',
            a.role,
            a.company || 'Hiring Partner',
            a.matchScore || null,
            'Submitted',
            a.submittedAt || new Date().toISOString()
          );
        }
        console.log(`[Database] Migrated verified legacy applications into SQLite.`);
      }
    } catch (err) {
      console.warn('[Database] Legacy applications migration skipped:', err.message);
    }
  }
}

migrateLegacyJson();

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
    const id = 'usr_' + Math.random().toString(36).substring(2, 11);
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
    const id = 'app_' + Math.random().toString(36).substring(2, 11);
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

export default db;
