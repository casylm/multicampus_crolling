const db = require('../config/db');

function insertJob(job) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO job_postings (title, company, url, description, source, collected_at)
    VALUES (@title, @company, @url, @description, @source, @collectedAt)
  `);
  const result = stmt.run(job);
  return result.changes; // 1: 삽입됨, 0: 중복으로 스킵
}

function insertJobs(jobs) {
  let added = 0;
  const insertMany = db.transaction((list) => {
    for (const job of list) {
      added += insertJob(job);
    }
  });
  insertMany(jobs);
  return { added, skipped: jobs.length - added };
}

function getAllJobs({ page = 1, limit = 20, source, keyword, isNew } = {}) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (source) { conditions.push('source = ?'); params.push(source); }
  if (keyword) { conditions.push('(title LIKE ? OR company LIKE ?)'); params.push(`%${keyword}%`, `%${keyword}%`); }
  if (isNew !== undefined) { conditions.push('is_new = ?'); params.push(isNew ? 1 : 0); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) as cnt FROM job_postings ${where}`).get(...params).cnt;
  const data = db.prepare(`SELECT * FROM job_postings ${where} ORDER BY collected_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);

  return { data, total, page, limit };
}

function getJobById(id) {
  return db.prepare('SELECT * FROM job_postings WHERE id = ?').get(id);
}

function getStats() {
  const total = db.prepare('SELECT COUNT(*) as cnt FROM job_postings').get().cnt;
  const bySource = db.prepare('SELECT source, COUNT(*) as cnt FROM job_postings GROUP BY source').all();
  const lastCrawledAt = db.prepare('SELECT MAX(collected_at) as last FROM job_postings').get().last;
  return { total, bySource, lastCrawledAt };
}

function markAsNotified() {
  db.prepare('UPDATE job_postings SET is_new = 0 WHERE is_new = 1').run();
}

module.exports = { insertJob, insertJobs, getAllJobs, getJobById, getStats, markAsNotified };
