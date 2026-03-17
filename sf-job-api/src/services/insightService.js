const db = require('../config/db');

// 분석할 키워드 카테고리
const KEYWORD_GROUPS = {
  'Salesforce 제품': [
    'Sales Cloud', 'Service Cloud', 'Marketing Cloud', 'Commerce Cloud',
    'Experience Cloud', 'CPQ', 'Pardot', 'Tableau', 'MuleSoft', 'Slack',
    'Field Service', 'Health Cloud', 'Financial Services Cloud',
  ],
  '기술 스킬': [
    'Apex', 'Visualforce', 'Lightning', 'LWC', 'Aura', 'SOQL', 'SOSL',
    'REST', 'API', 'Integration', 'Flow', 'Process Builder', 'Trigger',
    'JavaScript', 'Java', 'Python', 'SQL', 'HTML', 'CSS',
  ],
  'Salesforce 자격증': [
    'Administrator', 'Platform Developer', 'Architect', 'Consultant',
    'Advanced Administrator', 'App Builder', 'Sales Cloud Consultant',
    'Service Cloud Consultant', 'Certified',
  ],
  '경력 / 경험': [
    '경력', '신입', '3년', '5년', '7년', '10년',
    '프로젝트', '구축', '운영', '유지보수',
  ],
  '기타 역량': [
    '영어', '커뮤니케이션', '협업', '분석', '문서화',
    'AWS', 'Azure', 'GCP', 'CI/CD', 'Git',
  ],
};

function analyzeInsights() {
  const rows = db.prepare('SELECT title, description FROM job_postings').all();
  const corpus = rows.map(r => `${r.title} ${r.description}`).join(' ');
  const total = rows.length;

  const result = {};

  for (const [category, keywords] of Object.entries(KEYWORD_GROUPS)) {
    result[category] = keywords
      .map(kw => {
        const regex = new RegExp(kw, 'gi');
        const count = (corpus.match(regex) || []).length;
        const jobCount = rows.filter(r =>
          new RegExp(kw, 'i').test(`${r.title} ${r.description}`)
        ).length;
        return { keyword: kw, count, jobCount, ratio: Math.round((jobCount / total) * 100) };
      })
      .filter(r => r.count > 0)
      .sort((a, b) => b.jobCount - a.jobCount)
      .slice(0, 8);
  }

  return { totalJobs: total, analysis: result };
}

module.exports = { analyzeInsights };
