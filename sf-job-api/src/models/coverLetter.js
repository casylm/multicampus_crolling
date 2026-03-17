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

function getAllCoverLetters({ page = 1, limit = 10, keyword, isFavorite } = {}) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (keyword) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (isFavorite !== undefined) {
    conditions.push('is_favorite = ?');
    params.push(isFavorite ? 1 : 0);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const total = db.prepare(`SELECT COUNT(*) as cnt FROM cover_letters ${where}`).get(...params).cnt;
  const data = db.prepare(`SELECT * FROM cover_letters ${where} ORDER BY collected_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);

  return { data, total, page, limit };
}

function toggleCoverLetterFavorite(id) {
  const item = db.prepare('SELECT is_favorite FROM cover_letters WHERE id = ?').get(id);
  if (!item) return null;
  const next = item.is_favorite ? 0 : 1;
  db.prepare('UPDATE cover_letters SET is_favorite = ? WHERE id = ?').run(next, id);
  return { id, is_favorite: next };
}

module.exports = { insertCoverLetters, getAllCoverLetters, toggleCoverLetterFavorite };
