const cron = require('node-cron');
const { runAllCrawlers } = require('./crawlerService');

// 매일 오전 9시, 오후 6시 실행
const SCHEDULE = '0 9,18 * * *';

function startScheduler() {
  cron.schedule(SCHEDULE, async () => {
    console.log(`[scheduler] 크롤링 시작 — ${new Date().toLocaleString('ko-KR')}`);
    try {
      const result = await runAllCrawlers();
      console.log(`[scheduler] 완료 — 신규: ${result.added}건`);
    } catch (err) {
      console.error('[scheduler] 오류 발생:', err.message);
    }
  }, {
    timezone: 'Asia/Seoul',
  });

  console.log('[scheduler] 등록 완료 (매일 09:00, 18:00 KST)');
}

module.exports = { startScheduler };
