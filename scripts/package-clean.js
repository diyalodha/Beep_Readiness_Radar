import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const STAGING = path.join(ROOT, '_clean_export_staging');
const OUTPUT_ZIP = path.join(ROOT, 'eventbeep-founder-office-clean.zip');

console.log('[Packaging] Creating clean distributable source archive...');

// Remove prior staging and output
if (fs.existsSync(STAGING)) fs.rmSync(STAGING, { recursive: true, force: true });
if (fs.existsSync(OUTPUT_ZIP)) fs.rmSync(OUTPUT_ZIP, { force: true });

fs.mkdirSync(STAGING, { recursive: true });

// List of allowed files and directories to copy
const INCLUDED_FILES = [
  'index.html',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'README.md',
  '.env.example',
  '.gitignore'
];

const INCLUDED_DIRS = [
  'src',
  'tests',
  'server'
];

// Copy individual files
for (const file of INCLUDED_FILES) {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(STAGING, file));
  }
}

// Copy directories while filtering out disallowed files
function copyDirFiltered(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    // Strictly skip data directory, databases, and logs
    if (entry.name === 'data' && srcDir.endsWith('server')) continue;
    if (entry.name.endsWith('.db') || entry.name.endsWith('.db-wal') || entry.name.endsWith('.db-shm')) continue;
    if (entry.name === '.DS_Store' || entry.name === 'Thumbs.db') continue;

    if (entry.isDirectory()) {
      copyDirFiltered(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

for (const dir of INCLUDED_DIRS) {
  const src = path.join(ROOT, dir);
  if (fs.existsSync(src)) {
    copyDirFiltered(src, path.join(STAGING, dir));
  }
}

// Ensure clean empty server/data directory exists with a placeholder
const serverDataDir = path.join(STAGING, 'server', 'data');
fs.mkdirSync(serverDataDir, { recursive: true });
fs.writeFileSync(path.join(serverDataDir, '.gitkeep'), '', 'utf8');

// Compress staging directory into ZIP using powershell on Windows or zip on Unix
try {
  if (process.platform === 'win32') {
    const escapedStaging = (STAGING + '\\*').replace(/'/g, "''");
    const escapedOutput = OUTPUT_ZIP.replace(/'/g, "''");
    execSync(`powershell -Command "Compress-Archive -Path '${escapedStaging}' -DestinationPath '${escapedOutput}' -Force"`, { stdio: 'inherit' });
  } else {
    execSync(`cd "${STAGING}" && zip -r "${OUTPUT_ZIP}" .`, { stdio: 'inherit' });
  }

  // Cleanup staging directory
  fs.rmSync(STAGING, { recursive: true, force: true });

  const stats = fs.statSync(OUTPUT_ZIP);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  const sizeKB = (stats.size / 1024).toFixed(1);

  console.log('----------------------------------------------------');
  console.log(`[Packaging] Clean export archive generated successfully!`);
  console.log(`[Packaging] File: ${path.basename(OUTPUT_ZIP)}`);
  console.log(`[Packaging] Size: ${sizeKB} KB (${sizeMB} MB)`);
  console.log(`[Packaging] Excluded: node_modules, .git, .env, dist, and local database records.`);
  console.log('----------------------------------------------------');
} catch (err) {
  console.error('[Packaging Error]:', err.message);
  process.exit(1);
}
