const express = require('express');
const router = express.Router();
const { getAllJobs, getJobById, getStats } = require('../models/job');
const { runAllCrawlers } = require('../services/crawlerService');

// GET /jobs
router.get('/', (req, res) => {
  const { page, limit, source, keyword, isNew } = req.query;
  const result = getAllJobs({
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    source,
    keyword,
    isNew: isNew !== undefined ? isNew === 'true' : undefined,
  });
  res.json(result);
});

// GET /jobs/stats
router.get('/stats', (req, res) => {
  res.json(getStats());
});

// GET /jobs/:id
router.get('/:id', (req, res) => {
  const job = getJobById(Number(req.params.id));
  if (!job) return res.status(404).json({ message: '공고를 찾을 수 없습니다.' });
  res.json(job);
});

// POST /jobs/crawl
router.post('/crawl', async (req, res) => {
  try {
    const result = await runAllCrawlers();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: '크롤링 중 오류가 발생했습니다.', error: err.message });
  }
});

module.exports = router;
