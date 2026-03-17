const { crawlNaver } = require('../crawlers/naver');
const { crawlGoogle } = require('../crawlers/google');
const { crawlWanted } = require('../crawlers/wanted');
const { crawlCoverLetters } = require('../crawlers/coverLetter');
const { insertJobs, getAllJobs } = require('../models/job');
const { insertCoverLetters } = require('../models/coverLetter');
const { sendSlackNotification } = require('./notification');

async function runAllCrawlers() {
  const start = Date.now();

  const [naverJobs, googleJobs, wantedJobs, coverLetters] = await Promise.all([
    crawlNaver(),
    crawlGoogle(),
    crawlWanted(),
    crawlCoverLetters(),
  ]);

  const allJobs = [...naverJobs, ...googleJobs, ...wantedJobs];
  const { added, skipped } = insertJobs(allJobs);
  const { added: clAdded } = insertCoverLetters(coverLetters);
  const duration = Date.now() - start;

  console.log(`[crawler] 완료 — 공고: ${allJobs.length}건(신규 ${added}), 자소서: ${coverLetters.length}건(신규 ${clAdded}), 소요: ${duration}ms`);

  const { data: newJobs } = getAllJobs({ isNew: true, limit: 100 });
  await sendSlackNotification(newJobs);

  return { added, skipped, total: allJobs.length, coverLettersAdded: clAdded, duration };
}

module.exports = { runAllCrawlers };
