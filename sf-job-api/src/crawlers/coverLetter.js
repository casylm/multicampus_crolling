const axios = require('axios');

const NAVER_API_URL = 'https://openapi.naver.com/v1/search/webkr.json';
const QUERIES = [
  '세일즈포스 자기소개서 합격',
  'Salesforce 취업 자소서 후기',
  '세일즈포스 개발자 자기소개서',
];

async function crawlCoverLetters() {
  const results = [];

  for (const query of QUERIES) {
    try {
      const response = await axios.get(NAVER_API_URL, {
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
        },
        params: { query, display: 100, sort: 'date' },
      });

      const items = response.data.items || [];
      const normalized = items.map((item) => ({
        title: stripHtml(item.title),
        url: item.link,
        description: stripHtml(item.description),
        source: 'naver',
        collectedAt: new Date().toISOString(),
      }));

      results.push(...normalized);
    } catch (err) {
      console.error(`[coverLetter] 크롤링 실패 (query: ${query}):`, err.message);
    }
  }

  return dedup(results);
}

function stripHtml(str = '') {
  return str.replace(/<[^>]*>/g, '').trim();
}

function dedup(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

module.exports = { crawlCoverLetters };
