const axios = require('axios');
const { markAsNotified } = require('../models/job');

const MAX_DISPLAY = 5;

async function sendSlackNotification(jobs) {
  if (!process.env.SLACK_WEBHOOK_URL) {
    console.log('[notification] SLACK_WEBHOOK_URL 미설정 — 알림 스킵');
    return;
  }

  if (jobs.length === 0) {
    console.log('[notification] 신규 공고 없음 — 알림 스킵');
    return;
  }

  const displayed = jobs.slice(0, MAX_DISPLAY);
  const extra = jobs.length - MAX_DISPLAY;

  const jobBlocks = displayed.map((job) => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*<${job.url}|${job.title}>*\n${job.company} · ${job.source}`,
    },
  }));

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🔔 Salesforce 신규 채용공고 ${jobs.length}건`,
        },
      },
      { type: 'divider' },
      ...jobBlocks,
      ...(extra > 0
        ? [{
            type: 'context',
            elements: [{ type: 'mrkdwn', text: `외 *${extra}건* 더 있습니다.` }],
          }]
        : []),
    ],
  };

  try {
    await axios.post(process.env.SLACK_WEBHOOK_URL, message);
    markAsNotified();
    console.log(`[notification] 슬랙 전송 완료 — ${jobs.length}건`);
  } catch (err) {
    console.error('[notification] 슬랙 전송 실패:', err.message);
  }
}

module.exports = { sendSlackNotification };
