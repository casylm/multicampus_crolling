const axios = require('axios');

const WANTED_API_URL = 'https://www.wanted.co.kr/api/v4/jobs';

async function crawlWanted() {
  const results = [];

  try {
    const response = await axios.get(WANTED_API_URL, {
      params: {
        query: 'Salesforce',
        job_sort: 'job.latest_order',
        limit: 100,
        offset: 0,
      },
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: 'https://www.wanted.co.kr',
      },
    });

    const items = response.data.data || [];
    const normalized = items.map((item) => ({
      title: item.position,
      company: item.company?.name || '',
      url: `https://www.wanted.co.kr/wd/${item.id}`,
      description: item.summary || '',
      source: 'wanted',
      collectedAt: new Date().toISOString(),
    }));

    results.push(...normalized);
  } catch (err) {
    console.error('[wanted] 크롤링 실패:', err.message);
  }

  return results;
}

module.exports = { crawlWanted };
