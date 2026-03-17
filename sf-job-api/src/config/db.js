const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../../data/jobs.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS job_postings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    company     TEXT NOT NULL,
    url         TEXT UNIQUE NOT NULL,
    description TEXT,
    source      TEXT,
    is_new      INTEGER DEFAULT 1,
    is_favorite INTEGER DEFAULT 0,
    collected_at TEXT,
    created_at  TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// 기존 DB에 컬럼이 없을 경우 마이그레이션
try { db.exec('ALTER TABLE job_postings ADD COLUMN is_favorite INTEGER DEFAULT 0'); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS cover_letters (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    url         TEXT UNIQUE NOT NULL,
    description TEXT,
    source      TEXT,
    collected_at TEXT,
    created_at  TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
