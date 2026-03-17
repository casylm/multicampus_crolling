const TABS = [
  { id: 'search',       href: '/jobs/search',                      label: '🔍 채용 검색' },
  { id: 'fav-cover',   href: '/cover-letters/view?filter=favorites', label: '★ 즐겨찾기 자소서' },
  { id: 'coverletters', href: '/cover-letters/view',               label: '📝 자소서 목록' },
  { id: 'insights',    href: '/jobs/insights-view',                label: '📊 자격요건 분석' },
];

function layout({ title, activeTab, content }) {
  const navLinks = TABS.map(t =>
    `<a href="${t.href}" class="tab${activeTab === t.id ? ' active' : ''}">${t.label}</a>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escHtml(title)} — SF 채용 대시보드</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Nunito:wght@500;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary: #5B8DEF;
    --primary-dark: #3D6FD4;
    --accent: #FF8C69;
    --bg: #F2F5FB;
    --card: #FFFFFF;
    --text: #2D3748;
    --muted: #718096;
    --border: #E2E8F0;
    --radius: 14px;
    --radius-sm: 8px;
    --shadow: 0 2px 12px rgba(0,0,0,0.07);
  }

  body {
    font-family: 'Noto Sans KR', 'Nunito', -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    font-size: 14px;
    line-height: 1.6;
  }

  /* 헤더 */
  .header {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    padding: 20px 32px 0;
    box-shadow: 0 4px 20px rgba(91,141,239,0.25);
  }
  .header-top {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }
  .logo {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.3px;
  }
  .logo span { opacity: 0.75; font-weight: 400; font-size: 0.9rem; margin-left: 10px; }

  /* 탭 */
  .tabs {
    display: flex;
    gap: 4px;
  }
  .tab {
    padding: 10px 20px;
    color: rgba(255,255,255,0.75);
    text-decoration: none;
    font-size: 0.88rem;
    font-weight: 500;
    border-radius: 10px 10px 0 0;
    transition: all 0.18s;
    white-space: nowrap;
  }
  .tab:hover { color: #fff; background: rgba(255,255,255,0.12); }
  .tab.active {
    background: var(--bg);
    color: var(--primary);
    font-weight: 700;
  }

  /* 컨텐츠 */
  .container { max-width: 1100px; margin: 28px auto; padding: 0 20px; }

  /* 카드 */
  .card {
    background: var(--card);
    border-radius: var(--radius);
    padding: 24px 28px;
    box-shadow: var(--shadow);
    margin-bottom: 20px;
  }

  /* 검색창 */
  .search-wrap { display: flex; gap: 10px; }
  .search-input {
    flex: 1;
    padding: 13px 20px;
    border: 2px solid var(--border);
    border-radius: 50px;
    font-size: 0.95rem;
    font-family: inherit;
    outline: none;
    transition: border 0.18s, box-shadow 0.18s;
    color: var(--text);
  }
  .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(91,141,239,0.12); }
  .btn {
    padding: 12px 26px;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 700;
    font-family: inherit;
    transition: all 0.18s;
    white-space: nowrap;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .btn-primary { background: var(--primary); color: #fff; }
  .btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }
  .hint { font-size: 0.78rem; color: var(--muted); margin-top: 10px; }

  /* 필터 칩 */
  .chip-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .chip {
    padding: 6px 16px;
    border-radius: 50px;
    font-size: 0.82rem;
    font-weight: 500;
    text-decoration: none;
    border: 1.5px solid var(--border);
    color: var(--muted);
    background: var(--card);
    transition: all 0.15s;
  }
  .chip:hover { border-color: var(--primary); color: var(--primary); }
  .chip.on { background: var(--primary); color: #fff; border-color: var(--primary); }

  /* 메타 */
  .meta { font-size: 0.82rem; color: var(--muted); margin-bottom: 12px; }

  /* 결과 헤더 */
  .result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .result-header h3 { font-size: 0.95rem; font-weight: 700; }
  .badge { padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; }
  .badge-new { background: #E6F4EA; color: #1A7F37; }
  .badge-skip { background: #F0F4F8; color: var(--muted); }
  .badge-src { background: #EEF2FF; color: var(--primary); }

  /* 테이블 */
  .table-wrap { overflow-x: auto; border-radius: var(--radius); box-shadow: var(--shadow); }
  table { width: 100%; border-collapse: collapse; background: var(--card); }
  th {
    background: #F7FAFF;
    padding: 12px 14px;
    text-align: left;
    font-size: 0.8rem;
    color: var(--muted);
    font-weight: 600;
    border-bottom: 1.5px solid var(--border);
  }
  td {
    padding: 12px 14px;
    font-size: 0.84rem;
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #F7FAFF; }
  td a { color: var(--primary); text-decoration: none; font-weight: 500; }
  td a:hover { text-decoration: underline; }
  .td-desc { color: var(--muted); max-width: 320px; font-size: 0.8rem; }

  /* 즐겨찾기 별 */
  .star {
    background: none; border: none; cursor: pointer;
    font-size: 1.15rem; line-height: 1; padding: 0;
    color: #D1D5DB; transition: color 0.15s, transform 0.15s;
  }
  .star.on { color: #F6C90E; }
  .star:hover { color: #F6C90E; transform: scale(1.25); }

  /* 페이지네이션 */
  .pagination { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 20px; justify-content: center; }
  .page-btn {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%;
    text-decoration: none;
    font-size: 0.84rem;
    font-weight: 500;
    color: var(--muted);
    background: var(--card);
    border: 1.5px solid var(--border);
    transition: all 0.15s;
  }
  .page-btn:hover { border-color: var(--primary); color: var(--primary); }
  .page-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); font-weight: 700; }

  /* 빈 상태 */
  .empty { text-align: center; padding: 50px 20px; color: var(--muted); }
  .empty-icon { font-size: 2.5rem; margin-bottom: 12px; }
  .empty p { font-size: 0.9rem; }

  /* 에러 */
  .error-box { background: #FFF5F5; border-left: 4px solid #FC8181; border-radius: var(--radius-sm); padding: 14px 18px; color: #C53030; font-size: 0.88rem; margin-bottom: 16px; }

  /* 알림 배너 */
  .notice { background: #F0EBFF; border-left: 4px solid #9F7AEA; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 0.83rem; color: #553C9A; margin-bottom: 16px; }

  /* 막대그래프 */
  .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 11px; }
  .bar-label { width: 170px; font-size: 0.83rem; flex-shrink: 0; }
  .bar-track { flex: 1; background: #EEF2FF; border-radius: 50px; height: 14px; overflow: hidden; }
  .bar-fill { height: 100%; background: linear-gradient(90deg, var(--primary), #8BB8FF); border-radius: 50px; }
  .bar-meta { width: 80px; font-size: 0.76rem; color: var(--muted); text-align: right; flex-shrink: 0; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .col-full { grid-column: 1 / -1; }

  @media (max-width: 760px) {
    .header { padding: 16px 16px 0; }
    .tab { padding: 9px 13px; font-size: 0.8rem; }
    .container { padding: 0 12px; }
    .grid-2 { grid-template-columns: 1fr; }
    .td-desc { display: none; }
  }
</style>
</head>
<body>
<header class="header">
  <div class="header-top">
    <div class="logo">⚡ SF 채용 대시보드 <span>Salesforce 취업 도우미</span></div>
  </div>
  <nav class="tabs">${navLinks}</nav>
</header>
<div class="container">${content}</div>
<script>
(function() {
  var params = new URLSearchParams(location.search);
  var q = params.get('q');
  if (q) sessionStorage.setItem('lastSearchQ', q);
  var savedQ = sessionStorage.getItem('lastSearchQ');
  if (savedQ) {
    var tab = document.querySelector('.tab[href="/jobs/search"]');
    if (tab) tab.href = '/jobs/search?q=' + encodeURIComponent(savedQ);
  }
})();
</script>
</body>
</html>`;
}

function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pagination(currentPage, totalPages, buildUrl) {
  if (totalPages <= 1) return '';
  const pages = Array.from({ length: Math.min(totalPages, 20) }, (_, i) => {
    const p = i + 1;
    return `<a href="${buildUrl(p)}" class="page-btn${p === currentPage ? ' active' : ''}">${p}</a>`;
  }).join('');
  return `<div class="pagination">${pages}</div>`;
}

module.exports = { layout, escHtml, pagination };
