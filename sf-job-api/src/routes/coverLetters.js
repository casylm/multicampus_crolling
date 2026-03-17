const express = require('express');
const router = express.Router();
const { getAllCoverLetters } = require('../models/coverLetter');

// GET /cover-letters
router.get('/', (req, res) => {
  const { page, limit, keyword } = req.query;
  res.json(getAllCoverLetters({ page: Number(page) || 1, limit: Number(limit) || 20, keyword }));
});

// GET /cover-letters/view — HTML 목록
router.get('/view', (req, res) => {
  const { page, keyword } = req.query;
  const currentPage = Number(page) || 1;
  const { data: items, total } = getAllCoverLetters({ page: currentPage, limit: 50, keyword });
  const totalPages = Math.ceil(total / 50);

  const rows = items.map(item => `
    <tr>
      <td>${item.id}</td>
      <td><a href="${item.url}" target="_blank" rel="noopener">${escHtml(item.title)}</a></td>
      <td class="desc">${escHtml((item.description || '').slice(0, 100))}…</td>
      <td>${item.collected_at ? item.collected_at.slice(0, 10) : ''}</td>
    </tr>`).join('');

  const pagination = Array.from({ length: Math.min(totalPages, 20) }, (_, i) => {
    const p = i + 1;
    const active = p === currentPage ? ' class="active"' : '';
    const kw = keyword ? `&keyword=${encodeURIComponent(keyword)}` : '';
    return `<a href="/cover-letters/view?page=${p}${kw}"${active}>${p}</a>`;
  }).join('');

  const kw = keyword ? escHtml(keyword) : '';

  res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Salesforce 자소서 모음</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f7fa;color:#333}
  header{background:#7b5ea7;color:#fff;padding:14px 28px;display:flex;align-items:center;gap:14px}
  header h1{font-size:1.15rem;font-weight:600}
  nav a{color:rgba(255,255,255,.85);text-decoration:none;font-size:.88rem;padding:6px 12px;border-radius:5px;transition:background .15s}
  nav a:hover,nav a.on{background:rgba(255,255,255,.2);color:#fff}
  .container{max-width:1100px;margin:20px auto;padding:0 16px}
  .toolbar{display:flex;gap:10px;margin-bottom:14px;align-items:center}
  .toolbar form{display:flex;gap:8px;flex:1}
  .toolbar input{flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:.88rem}
  .toolbar button{padding:8px 14px;background:#7b5ea7;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:.88rem}
  .notice{background:#f0ebff;border-left:4px solid #7b5ea7;padding:12px 16px;border-radius:6px;font-size:.85rem;color:#555;margin-bottom:14px;line-height:1.6}
  .meta{font-size:.85rem;color:#666;margin-bottom:10px}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)}
  th{background:#f0ebff;padding:11px 13px;text-align:left;font-size:.82rem;color:#555;font-weight:600}
  td{padding:10px 13px;font-size:.83rem;border-top:1px solid #f0f0f0;vertical-align:middle}
  td a{color:#7b5ea7;text-decoration:none;font-weight:500}
  td a:hover{text-decoration:underline}
  td.desc{color:#666;max-width:400px}
  tr:hover td{background:#faf7ff}
  .pagination{margin-top:18px;display:flex;gap:5px;flex-wrap:wrap}
  .pagination a{padding:6px 11px;border:1px solid #ddd;border-radius:4px;text-decoration:none;color:#333;font-size:.83rem;background:#fff}
  .pagination a.active{background:#7b5ea7;color:#fff;border-color:#7b5ea7}
  .pagination a:hover:not(.active){background:#f0ebff}
  @media(max-width:768px){td.desc,th:nth-child(3){display:none}}
</style>
</head>
<body>
<header>
  <h1>📝 Salesforce 자소서 모음</h1>
  <nav style="display:flex;gap:4px;margin-left:auto">
    <a href="/jobs/view">공고 목록</a>
    <a href="/cover-letters/view" class="on">자소서 목록</a>
    <a href="/jobs/insights-view">자격요건 분석</a>
  </nav>
</header>
<div class="container">
  <div class="notice">
    💡 네이버 검색 결과 기반으로 수집된 자소서 관련 페이지입니다. 제목 링크를 클릭하면 원문으로 이동합니다.
  </div>
  <div class="toolbar">
    <form method="get" action="/cover-letters/view">
      <input type="text" name="keyword" placeholder="키워드 검색…" value="${kw}">
      <button type="submit">검색</button>
    </form>
  </div>
  <p class="meta">${currentPage}/${totalPages || 1} 페이지 · ${total}건 (크롤링 후 표시됩니다)</p>
  <table>
    <thead><tr><th>#</th><th>제목</th><th>내용 요약</th><th>수집일</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="4" style="text-align:center;padding:30px;color:#999">자소서 데이터가 없습니다. 먼저 크롤링을 실행해주세요.<br><br><a href="/jobs/view" style="color:#7b5ea7">→ POST /jobs/crawl 로 크롤링 실행</a></td></tr>'}</tbody>
  </table>
  <div class="pagination">${pagination}</div>
</div>
</body></html>`);
});

function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = router;
