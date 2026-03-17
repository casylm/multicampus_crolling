const express = require('express');
const router = express.Router();
const { getAllJobs, getJobById, getStats, toggleFavorite } = require('../models/job');
const { runAllCrawlers } = require('../services/crawlerService');
const { analyzeInsights } = require('../services/insightService');

// GET /jobs
router.get('/', (req, res) => {
  const { page, limit, source, keyword, isNew, isFavorite } = req.query;
  const result = getAllJobs({
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    source,
    keyword,
    isNew: isNew !== undefined ? isNew === 'true' : undefined,
    isFavorite: isFavorite !== undefined ? isFavorite === 'true' : undefined,
  });
  res.json(result);
});

// GET /jobs/stats
router.get('/stats', (req, res) => {
  res.json(getStats());
});

// GET /jobs/insights — 공통 자격요건 분석 JSON
router.get('/insights', (req, res) => {
  res.json(analyzeInsights());
});

// GET /jobs/insights-view — 자격요건 분석 HTML
router.get('/insights-view', (req, res) => {
  const { totalJobs, analysis } = analyzeInsights();

  const sections = Object.entries(analysis).map(([category, items]) => {
    if (!items.length) return '';
    const bars = items.map(item => `
      <div class="bar-row">
        <div class="bar-label">${escHtml(item.keyword)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${item.ratio}%"></div></div>
        <div class="bar-meta">${item.jobCount}건 (${item.ratio}%)</div>
      </div>`).join('');
    return `<div class="card"><h3>${escHtml(category)}</h3>${bars}</div>`;
  }).join('');

  res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>자격요건 분석</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f7fa;color:#333}
  header{background:#0070d2;color:#fff;padding:16px 32px;display:flex;align-items:center;gap:16px}
  header h1{font-size:1.2rem;font-weight:600}
  header a{color:rgba(255,255,255,.8);text-decoration:none;font-size:.9rem}
  header a:hover{color:#fff}
  .container{max-width:1000px;margin:24px auto;padding:0 16px;display:grid;grid-template-columns:1fr 1fr;gap:20px}
  .card{background:#fff;border-radius:8px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.1)}
  .card h3{font-size:1rem;font-weight:600;margin-bottom:16px;color:#0070d2;border-bottom:2px solid #e8f4fd;padding-bottom:8px}
  .bar-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
  .bar-label{width:160px;font-size:.83rem;flex-shrink:0}
  .bar-track{flex:1;background:#f0f4f8;border-radius:4px;height:16px;overflow:hidden}
  .bar-fill{height:100%;background:linear-gradient(90deg,#0070d2,#1ab3ff);border-radius:4px}
  .bar-meta{width:80px;font-size:.78rem;color:#666;text-align:right;flex-shrink:0}
  .summary{grid-column:1/-1;background:#fff3cd;border-radius:8px;padding:16px 20px;border-left:4px solid #ff6b35}
  .summary h3{margin-bottom:8px;color:#ff6b35}
  .summary p{font-size:.9rem;line-height:1.6}
  @media(max-width:700px){.container{grid-template-columns:1fr}}
</style>
</head>
<body>
<header>
  <h1>📊 자격요건 분석</h1>
  <span style="flex:1"></span>
  <a href="/jobs/view">← 공고 목록</a>
</header>
<div class="container">
  <div class="summary">
    <h3>분석 대상: 총 ${totalJobs}건의 Salesforce 채용공고</h3>
    <p>각 키워드가 등장한 공고 수와 전체 대비 비율입니다. 비율이 높을수록 해당 기술/자격이 많이 요구됩니다.</p>
  </div>
  ${sections}
</div>
</body></html>`);
});

// GET /jobs/view — HTML 목록 (즐겨찾기 + 링크)
router.get('/view', (req, res) => {
  const { page, keyword, filter } = req.query;
  const currentPage = Number(page) || 1;
  const isFavorite = filter === 'favorites' ? true : undefined;
  const { data: jobs, total } = getAllJobs({ page: currentPage, limit: 50, keyword, isFavorite });
  const totalPages = Math.ceil(total / 50);

  const buildUrl = (p, kw, f) => {
    const params = new URLSearchParams();
    if (p > 1) params.set('page', p);
    if (kw) params.set('keyword', kw);
    if (f) params.set('filter', f);
    const q = params.toString();
    return `/jobs/view${q ? '?' + q : ''}`;
  };

  const jobRows = jobs.map(j => `
    <tr id="row-${j.id}">
      <td>
        <button class="star ${j.is_favorite ? 'on' : ''}" onclick="toggleFav(${j.id}, this)" title="즐겨찾기">
          ${j.is_favorite ? '★' : '☆'}
        </button>
      </td>
      <td><a href="${j.url}" target="_blank" rel="noopener">${escHtml(j.title)}</a></td>
      <td>${escHtml(j.company)}</td>
      <td class="desc">${escHtml((j.description || '').slice(0, 80))}…</td>
      <td><span class="badge">${j.source}</span></td>
      <td>${j.collected_at ? j.collected_at.slice(0, 10) : ''}</td>
    </tr>`).join('');

  const pagination = Array.from({ length: Math.min(totalPages, 20) }, (_, i) => {
    const p = i + 1;
    const active = p === currentPage ? ' class="active"' : '';
    return `<a href="${buildUrl(p, keyword, filter)}"${active}>${p}</a>`;
  }).join('');

  const kw = keyword ? escHtml(keyword) : '';
  const isFavFilter = filter === 'favorites';

  res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Salesforce 채용공고</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f7fa;color:#333}
  header{background:#0070d2;color:#fff;padding:14px 28px;display:flex;align-items:center;gap:14px}
  header h1{font-size:1.15rem;font-weight:600}
  nav a{color:rgba(255,255,255,.85);text-decoration:none;font-size:.88rem;padding:6px 12px;border-radius:5px;transition:background .15s}
  nav a:hover,nav a.on{background:rgba(255,255,255,.2);color:#fff}
  .container{max-width:1200px;margin:20px auto;padding:0 16px}
  .toolbar{display:flex;gap:10px;margin-bottom:14px;align-items:center;flex-wrap:wrap}
  .toolbar form{display:flex;gap:8px;flex:1;min-width:240px}
  .toolbar input{flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:.88rem}
  .toolbar button{padding:8px 14px;background:#0070d2;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:.88rem}
  .filter-btns{display:flex;gap:8px}
  .filter-btns a{padding:7px 14px;border:1px solid #ddd;border-radius:6px;text-decoration:none;color:#555;font-size:.85rem;background:#fff;white-space:nowrap}
  .filter-btns a.on{background:#ffd700;border-color:#e6c200;color:#333;font-weight:600}
  .ext-btns{display:flex;gap:8px}
  .ext-btns a{padding:7px 14px;border-radius:6px;text-decoration:none;font-size:.85rem;white-space:nowrap;color:#fff}
  .btn-orange{background:#ff6b35}
  .btn-purple{background:#7b5ea7}
  .meta{font-size:.85rem;color:#666;margin-bottom:10px}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)}
  th{background:#f0f4f8;padding:11px 13px;text-align:left;font-size:.82rem;color:#555;font-weight:600}
  td{padding:10px 13px;font-size:.83rem;border-top:1px solid #f0f0f0;vertical-align:middle}
  td a{color:#0070d2;text-decoration:none;font-weight:500}
  td a:hover{text-decoration:underline}
  td.desc{color:#666;max-width:300px}
  .badge{background:#e8f4fd;color:#0070d2;padding:2px 8px;border-radius:12px;font-size:.75rem}
  tr:hover td{background:#fafcff}
  .star{background:none;border:none;cursor:pointer;font-size:1.2rem;color:#ccc;line-height:1;padding:0;transition:color .15s,transform .15s}
  .star.on{color:#ffd700}
  .star:hover{color:#ffd700;transform:scale(1.2)}
  .pagination{margin-top:18px;display:flex;gap:5px;flex-wrap:wrap}
  .pagination a{padding:6px 11px;border:1px solid #ddd;border-radius:4px;text-decoration:none;color:#333;font-size:.83rem;background:#fff}
  .pagination a.active{background:#0070d2;color:#fff;border-color:#0070d2}
  .pagination a:hover:not(.active){background:#f0f4f8}
  @media(max-width:768px){td.desc,th:nth-child(4){display:none}}
</style>
</head>
<body>
<header>
  <h1>⚡ Salesforce 채용공고</h1>
  <nav style="display:flex;gap:4px;margin-left:auto">
    <a href="/jobs/view" ${!isFavFilter ? 'class="on"' : ''}>공고 목록</a>
    <a href="/cover-letters/view">자소서 목록</a>
    <a href="/jobs/insights-view">자격요건 분석</a>
  </nav>
</header>
<div class="container">
  <div class="toolbar">
    <form method="get" action="/jobs/view">
      <input type="text" name="keyword" placeholder="키워드 검색 (예: Apex, LWC…)" value="${kw}">
      ${isFavFilter ? '<input type="hidden" name="filter" value="favorites">' : ''}
      <button type="submit">검색</button>
    </form>
    <div class="filter-btns">
      <a href="${buildUrl(1, keyword, '')}" ${!isFavFilter ? 'class="on"' : ''}>전체</a>
      <a href="${buildUrl(1, keyword, 'favorites')}" ${isFavFilter ? 'class="on"' : ''}>★ 즐겨찾기</a>
    </div>
  </div>
  <p class="meta">${currentPage}/${totalPages} 페이지 · ${total}건</p>
  <table>
    <thead><tr><th>★</th><th>공고 제목</th><th>회사</th><th>요약</th><th>소스</th><th>수집일</th></tr></thead>
    <tbody>${jobRows || '<tr><td colspan="6" style="text-align:center;padding:30px;color:#999">공고가 없습니다.</td></tr>'}</tbody>
  </table>
  <div class="pagination">${pagination}</div>
</div>
<script>
async function toggleFav(id, btn) {
  const res = await fetch('/jobs/' + id + '/favorite', { method: 'POST' });
  const data = await res.json();
  if (data.is_favorite) {
    btn.textContent = '★'; btn.classList.add('on');
  } else {
    btn.textContent = '☆'; btn.classList.remove('on');
  }
}
</script>
</body></html>`);
});

// POST /jobs/:id/favorite — 즐겨찾기 토글
router.post('/:id/favorite', (req, res) => {
  const result = toggleFavorite(Number(req.params.id));
  if (!result) return res.status(404).json({ message: '공고를 찾을 수 없습니다.' });
  res.json(result);
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

function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = router;
