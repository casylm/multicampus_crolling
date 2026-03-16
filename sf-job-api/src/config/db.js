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
    collected_at TEXT,
    created_at  TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
