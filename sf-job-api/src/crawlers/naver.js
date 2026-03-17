const axios = require('axios');

const NAVER_API_URL = 'https://openapi.naver.com/v1/search/webkr.json';
const QUERIES = [
  '세일즈포스 개발자 채용',
  'Salesforce Developer 채용공고',
  'Salesforce 개발자 구인',
];

async function crawlNaver(customQueries) {
  const results = [];
  const queries = customQueries || QUERIES;

  for (const query of queries) {
    try {
      const response = await axios.get(NAVER_API_URL, {
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
        },
        params: {
          query,
          display: 100,
          sort: 'date',
        },
      });

      const items = response.data.items || [];
      const normalized = items.map((item) => ({
        title: stripHtml(item.title),
        company: extractDomain(item.link),
        url: item.link,
        description: stripHtml(item.description),
        source: 'naver',
        collectedAt: new Date().toISOString(),
      }));

      results.push(...normalized);
    } catch (err) {
      console.error(`[naver] 크롤링 실패 (query: ${query}):`, err.message);
    }
  }

  return dedup(results);
}

function extractDomain(url = '') {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

function stripHtml(str = '') {
  return str.replace(/<[^>]*>/g, '').trim();
}

// URL 기준 중복 제거
function dedup(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

module.exports = { crawlNaver };
