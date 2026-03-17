const express = require('express');
const router = express.Router();
const { getAllJobs, getJobById, getStats, toggleFavorite } = require('../models/job');
const { runAllCrawlers } = require('../services/crawlerService');
const { analyzeInsights } = require('../services/insightService');
const { layout, escHtml, pagination } = require('../utils/layout');

const PAGE_SIZE = 10;

// GET /jobs
router.get('/', (req, res) => {
  const { page, limit, source, keyword, isNew, isFavorite } = req.query;
  const result = getAllJobs({
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    source, keyword,
    isNew: isNew !== undefined ? isNew === 'true' : undefined,
    isFavorite: isFavorite !== undefined ? isFavorite === 'true' : undefined,
  });
  res.json(result);
});

// GET /jobs/stats
router.get('/stats', (req, res) => res.json(getStats()));

// GET /jobs/insights — JSON
router.get('/insights', (req, res) => res.json(analyzeInsights()));

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
    return `<div class="card"><h3 style="font-size:.95rem;font-weight:700;margin-bottom:16px;color:var(--primary)">${escHtml(category)}</h3>${bars}</div>`;
  }).join('');

  res.send(layout({
    title: '자격요건 분석',
    activeTab: 'insights',
    content: `
      <div class="card col-full" style="border-left:4px solid var(--accent)">
        <h3 style="color:var(--accent);margin-bottom:6px">분석 대상: 총 ${totalJobs}건의 Salesforce 채용공고</h3>
        <p style="font-size:.85rem;color:var(--muted)">각 키워드가 등장한 공고 수와 전체 대비 비율입니다. 비율이 높을수록 해당 기술/자격이 많이 요구됩니다.</p>
      </div>
      <div class="grid-2">${sections}</div>
    `,
  }));
});

// GET /jobs/search — 키워드 실시간 크롤링 (메인)
router.get('/search', async (req, res) => {
  const { q, page } = req.query;
  const currentPage = Number(page) || 1;
  let crawlResult = null;
  let error = null;

  // 첫 페이지에서만 크롤링 실행
  if (q && q.trim() && currentPage === 1) {
    try {
      const { crawlNaver } = require('../crawlers/naver');
      const { insertJobs } = require('../models/job');
      const results = await crawlNaver([q.trim()]);
      crawlResult = insertJobs(results);
      crawlResult.total = results.length;
    } catch (err) {
      error = err.message;
    }
  }

  // DB에서 키워드 필터로 페이지 조회
  const { data: jobs, total } = q
    ? getAllJobs({ page: currentPage, limit: PAGE_SIZE, keyword: q.trim() })
    : { data: [], total: 0 };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const buildUrl = (p) => `/jobs/search?q=${encodeURIComponent(q || '')}&page=${p}`;

  const rows = jobs.map(j => `
    <tr>
      <td>
        <button class="star ${j.is_favorite ? 'on' : ''}" onclick="toggleFav(${j.id},this)">
          ${j.is_favorite ? '★' : '☆'}
        </button>
      </td>
      <td><a href="${j.url}" target="_blank" rel="noopener">${escHtml(j.title)}</a></td>
      <td>${escHtml(j.company)}</td>
      <td class="td-desc">${escHtml((j.description || '').slice(0, 90))}…</td>
      <td>${j.collected_at ? j.collected_at.slice(0, 10) : ''}</td>
    </tr>`).join('');

  const resultSection = q ? `
    <div class="result-header">
      <h3>"${escHtml(q)}" 검색결과 ${total}건</h3>
      ${crawlResult ? `<span class="badge ${crawlResult.added > 0 ? 'badge-new' : 'badge-skip'}">
        ${crawlResult.added > 0 ? `신규 ${crawlResult.added}건 저장` : '모두 기존 데이터'}
      </span>` : ''}
    </div>
    <p class="meta">${currentPage} / ${totalPages || 1} 페이지</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>★</th><th>공고 제목</th><th>출처</th><th>내용 요약</th><th>수집일</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5"><div class="empty"><div class="empty-icon">🔍</div><p>검색 결과가 없습니다.</p></div></td></tr>'}</tbody>
      </table>
    </div>
    ${pagination(currentPage, totalPages, buildUrl)}
  ` : `
    <div class="empty">
      <div class="empty-icon">🔍</div>
      <p>키워드를 입력하고 검색해보세요.<br><span style="font-size:.8rem;color:#A0AEC0">예: Apex 개발자, LWC, Marketing Cloud, CPQ…</span></p>
    </div>
  `;

  res.send(layout({
    title: '채용 검색',
    activeTab: 'search',
    content: `
      <div class="card">
        <form method="get" action="/jobs/search" onsubmit="this.querySelector('button').textContent='검색 중…'">
          <div class="search-wrap">
            <input class="search-input" type="text" name="q" placeholder="예: Apex 개발자, LWC, Marketing Cloud…" value="${escHtml(q || '')}" autofocus>
            <button type="submit" class="btn btn-primary">🔍 검색</button>
          </div>
        </form>
        <p class="hint">입력한 키워드로 네이버를 실시간 검색합니다. 신규 결과는 DB에 자동 저장되며, 별표(★)로 즐겨찾기할 수 있습니다.</p>
      </div>
      ${error ? `<div class="error-box">오류 발생: ${escHtml(error)}</div>` : ''}
      ${resultSection}
      <script>
      async function toggleFav(id, btn) {
        const r = await fetch('/jobs/'+id+'/favorite', {method:'POST'});
        const d = await r.json();
        btn.textContent = d.is_favorite ? '★' : '☆';
        d.is_favorite ? btn.classList.add('on') : btn.classList.remove('on');
      }
      </script>
    `,
  }));
});

// GET /jobs/view — 전체 공고 목록 (즐겨찾기 필터 포함)
router.get('/view', (req, res) => {
  const { page, keyword, filter } = req.query;
  const currentPage = Number(page) || 1;
  const isFavorite = filter === 'favorites' ? true : undefined;
  const { data: jobs, total } = getAllJobs({ page: currentPage, limit: PAGE_SIZE, keyword, isFavorite });
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const buildUrl = (p) => {
    const params = new URLSearchParams();
    if (p > 1) params.set('page', p);
    if (keyword) params.set('keyword', keyword);
    if (filter) params.set('filter', filter);
    const q = params.toString();
    return `/jobs/view${q ? '?' + q : ''}`;
  };

  const rows = jobs.map(j => `
    <tr>
      <td>
        <button class="star ${j.is_favorite ? 'on' : ''}" onclick="toggleFav(${j.id},this)">
          ${j.is_favorite ? '★' : '☆'}
        </button>
      </td>
      <td><a href="${j.url}" target="_blank" rel="noopener">${escHtml(j.title)}</a></td>
      <td>${escHtml(j.company)}</td>
      <td class="td-desc">${escHtml((j.description || '').slice(0, 90))}…</td>
      <td><span class="badge badge-src">${j.source}</span></td>
      <td>${j.collected_at ? j.collected_at.slice(0, 10) : ''}</td>
    </tr>`).join('');

  res.send(layout({
    title: '공고 목록',
    activeTab: filter === 'favorites' ? 'fav-jobs' : 'jobs',
    content: `
      <div class="card" style="padding:16px 20px">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <form method="get" action="/jobs/view" style="display:flex;gap:8px;flex:1;min-width:220px">
            <input class="search-input" style="border-radius:50px;padding:9px 16px;font-size:.88rem" type="text" name="keyword" placeholder="키워드 필터…" value="${escHtml(keyword || '')}">
            ${filter ? `<input type="hidden" name="filter" value="${escHtml(filter)}">` : ''}
            <button type="submit" class="btn btn-primary" style="padding:9px 18px;font-size:.85rem">검색</button>
          </form>
          <div class="chip-row" style="margin:0">
            <a href="/jobs/view${keyword ? '?keyword=' + encodeURIComponent(keyword) : ''}" class="chip${!filter ? ' on' : ''}">전체</a>
            <a href="/jobs/view?filter=favorites${keyword ? '&keyword=' + encodeURIComponent(keyword) : ''}" class="chip${filter === 'favorites' ? ' on' : ''}">★ 즐겨찾기</a>
          </div>
        </div>
      </div>
      <p class="meta">${currentPage} / ${totalPages || 1} 페이지 · 총 ${total}건</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>★</th><th>공고 제목</th><th>출처</th><th>내용 요약</th><th>소스</th><th>수집일</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="6"><div class="empty"><div class="empty-icon">📭</div><p>공고가 없습니다.</p></div></td></tr>'}</tbody>
        </table>
      </div>
      ${pagination(currentPage, totalPages, buildUrl)}
      <script>
      async function toggleFav(id, btn) {
        const r = await fetch('/jobs/'+id+'/favorite', {method:'POST'});
        const d = await r.json();
        btn.textContent = d.is_favorite ? '★' : '☆';
        d.is_favorite ? btn.classList.add('on') : btn.classList.remove('on');
      }
      </script>
    `,
  }));
});

// POST /jobs/:id/favorite
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

module.exports = router;
