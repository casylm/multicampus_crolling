const { crawlNaver } = require('../crawlers/naver');
const { crawlGoogle } = require('../crawlers/google');
const { crawlWanted } = require('../crawlers/wanted');
const { insertJobs, getAllJobs } = require('../models/job');
const { sendSlackNotification } = require('./notification');

async function runAllCrawlers() {
  const start = Date.now();

  // 세 크롤러 동시 실행
  const [naverJobs, googleJobs, wantedJobs] = await Promise.all([
    crawlNaver(),
    crawlGoogle(),
    crawlWanted(),
  ]);

  const allJobs = [...naverJobs, ...googleJobs, ...wantedJobs];
  const { added, skipped } = insertJobs(allJobs);
  const duration = Date.now() - start;

  console.log(`[crawler] 완료 — 수집: ${allJobs.length}건, 신규: ${added}건, 중복: ${skipped}건, 소요: ${duration}ms`);

  // 신규 공고만 슬랙 알림 발송
  const { data: newJobs } = getAllJobs({ isNew: true, limit: 100 });
  await sendSlackNotification(newJobs);

  return { added, skipped, total: allJobs.length, duration };
}

module.exports = { runAllCrawlers };
