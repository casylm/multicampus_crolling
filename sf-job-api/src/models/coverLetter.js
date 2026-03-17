const db = require('../config/db');

function insertCoverLetters(items) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO cover_letters (title, url, description, source, collected_at)
    VALUES (@title, @url, @description, @source, @collectedAt)
  `);
  let added = 0;
  const insertMany = db.transaction((list) => {
    for (const item of list) {
      added += stmt.run(item).changes;
    }
  });
  insertMany(items);
  return { added, skipped: items.length - added };
}

function getAllCoverLetters({ page = 1, limit = 50, keyword } = {}) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (keyword) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const total = db.prepare(`SELECT COUNT(*) as cnt FROM cover_letters ${where}`).get(...params).cnt;
  const data = db.prepare(`SELECT * FROM cover_letters ${where} ORDER BY collected_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);

  return { data, total, page, limit };
}

module.exports = { insertCoverLetters, getAllCoverLetters };
