const axios = require('axios');

const GOOGLE_API_URL = 'https://www.googleapis.com/customsearch/v1';
const QUERIES = [
  'Salesforce Developer 채용 site:saramin.co.kr OR site:wanted.co.kr',
  'Salesforce 개발자 채용공고',
];

async function crawlGoogle() {
  const results = [];

  for (const query of QUERIES) {
    try {
      const response = await axios.get(GOOGLE_API_URL, {
        params: {
          key: process.env.GOOGLE_API_KEY,
          cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
          q: query,
          num: 10, // 최대 10건 (Google 무료 제한)
        },
      });

      const items = response.data.items || [];
      const normalized = items.map((item) => ({
        title: item.title,
        company: extractCompany(item.displayLink),
        url: item.link,
        description: item.snippet || '',
        source: 'google',
        collectedAt: new Date().toISOString(),
      }));

      results.push(...normalized);
    } catch (err) {
      console.error(`[google] 크롤링 실패 (query: ${query}):`, err.message);
    }
  }

  return dedup(results);
}

// displayLink(도메인)에서 회사명 추정
function extractCompany(displayLink = '') {
  return displayLink.replace('www.', '').split('.')[0];
}

function dedup(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

module.exports = { crawlGoogle };
