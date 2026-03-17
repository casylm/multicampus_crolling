const express = require('express');
const router = express.Router();
const { getAllCoverLetters, toggleCoverLetterFavorite } = require('../models/coverLetter');
const { layout, escHtml, pagination } = require('../utils/layout');

const PAGE_SIZE = 10;

// GET /cover-letters (JSON)
router.get('/', (req, res) => {
  const { page, limit, keyword, isFavorite } = req.query;
  res.json(getAllCoverLetters({
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    keyword,
    isFavorite: isFavorite !== undefined ? isFavorite === 'true' : undefined,
  }));
});

// GET /cover-letters/view
router.get('/view', (req, res) => {
  const { page, keyword, filter } = req.query;
  const currentPage = Number(page) || 1;
  const isFavorite = filter === 'favorites' ? true : undefined;
  const { data: items, total } = getAllCoverLetters({ page: currentPage, limit: PAGE_SIZE, keyword, isFavorite });
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const buildUrl = (p) => {
    const params = new URLSearchParams();
    if (p > 1) params.set('page', p);
    if (keyword) params.set('keyword', keyword);
    if (filter) params.set('filter', filter);
    const q = params.toString();
    return `/cover-letters/view${q ? '?' + q : ''}`;
  };

  const activeTab = filter === 'favorites' ? 'fav-cover' : 'coverletters';

  const rows = items.map(item => `
    <tr>
      <td>
        <button class="star ${item.is_favorite ? 'on' : ''}" onclick="toggleFav(${item.id},this)">
          ${item.is_favorite ? '★' : '☆'}
        </button>
      </td>
      <td><a href="${item.url}" target="_blank" rel="noopener">${escHtml(item.title)}</a></td>
      <td class="td-desc">${escHtml((item.description || '').slice(0, 100))}…</td>
      <td>${item.collected_at ? item.collected_at.slice(0, 10) : ''}</td>
    </tr>`).join('');

  res.send(layout({
    title: filter === 'favorites' ? '즐겨찾기 자소서' : '자소서 목록',
    activeTab,
    content: `
      <div class="notice">
        💡 네이버 검색 기반으로 수집된 자소서 관련 페이지입니다. 제목 클릭 시 원문으로 이동하며, ★로 즐겨찾기할 수 있습니다.
      </div>
      <div class="card" style="padding:16px 20px">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <form method="get" action="/cover-letters/view" style="display:flex;gap:8px;flex:1;min-width:220px">
            <input class="search-input" style="border-radius:50px;padding:9px 16px;font-size:.88rem" type="text" name="keyword" placeholder="키워드 필터…" value="${escHtml(keyword || '')}">
            ${filter ? `<input type="hidden" name="filter" value="${escHtml(filter)}">` : ''}
            <button type="submit" class="btn btn-primary" style="padding:9px 18px;font-size:.85rem">검색</button>
          </form>
          <div class="chip-row" style="margin:0">
            <a href="/cover-letters/view${keyword ? '?keyword=' + encodeURIComponent(keyword) : ''}" class="chip${filter !== 'favorites' ? ' on' : ''}">전체</a>
            <a href="/cover-letters/view?filter=favorites${keyword ? '&keyword=' + encodeURIComponent(keyword) : ''}" class="chip${filter === 'favorites' ? ' on' : ''}">★ 즐겨찾기만</a>
          </div>
        </div>
      </div>
      <p class="meta">${currentPage} / ${totalPages || 1} 페이지 · 총 ${total}건</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>★</th><th>제목</th><th>내용 요약</th><th>수집일</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="4"><div class="empty">
            <div class="empty-icon">📝</div>
            <p>${filter === 'favorites' ? '즐겨찾기한 자소서가 없습니다.' : '자소서 데이터가 없습니다. 크롤링을 먼저 실행해주세요.'}</p>
          </div></td></tr>`}</tbody>
        </table>
      </div>
      ${pagination(currentPage, totalPages, buildUrl)}
      <script>
      async function toggleFav(id, btn) {
        const r = await fetch('/cover-letters/'+id+'/favorite', {method:'POST'});
        const d = await r.json();
        btn.textContent = d.is_favorite ? '★' : '☆';
        d.is_favorite ? btn.classList.add('on') : btn.classList.remove('on');
      }
      </script>
    `,
  }));
});

// POST /cover-letters/:id/favorite
router.post('/:id/favorite', (req, res) => {
  const result = toggleCoverLetterFavorite(Number(req.params.id));
  if (!result) return res.status(404).json({ message: '항목을 찾을 수 없습니다.' });
  res.json(result);
});

module.exports = router;
