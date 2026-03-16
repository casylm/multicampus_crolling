# 04. API 엔드포인트

## 목표
수집된 채용공고를 조회할 수 있는 REST API를 구현한다.

---

## Node.js (실제 구현)

### 프롬프트 (Claude에게 입력)
```
Node.js + Express로 채용공고 REST API를 만들어줘. (src/routes/jobs.js)

엔드포인트:
1. GET /jobs
   - 쿼리 파라미터: page(default 1), limit(default 20), source, keyword, isNew
   - 응답: { data: [...], total, page, limit }

2. GET /jobs/:id
   - 응답: 단건 JobPosting 객체
   - 없으면 404

3. POST /jobs/crawl
   - 모든 크롤러 실행 (naver, google, wanted 동시 실행 - Promise.all)
   - 응답: { added: number, skipped: number, duration: ms }

4. GET /jobs/stats
   - 응답: { total, bySource: {naver: n, google: n, ...}, lastCrawledAt }

에러 핸들링 미들웨어도 추가해줘.
```

### index.js 기본 구조
```javascript
require('dotenv').config();
const express = require('express');
const jobRoutes = require('./src/routes/jobs');

const app = express();
app.use(express.json());
app.use('/jobs', jobRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## Python으로 재현하려면

### 프롬프트 (Claude에게 입력)
```
FastAPI로 채용공고 REST API를 만들어줘. (app/routers/jobs.py)

엔드포인트:
1. GET /jobs — 목록 (page, limit, source, keyword, is_new 필터)
2. GET /jobs/{id} — 단건 (없으면 404)
3. POST /jobs/crawl — 전체 크롤러 asyncio.gather로 동시 실행
4. GET /jobs/stats — 통계

응답 스키마는 Pydantic으로 정의해줘.
main.py에 라우터 등록하고 CORS 설정도 추가해줘.
```

---

## Java로 재현하려면

### 프롬프트 (Claude에게 입력)
```
Spring Boot @RestController로 채용공고 API를 만들어줘. (JobController.java)

엔드포인트:
1. GET /jobs — Page<JobPostingDto> 반환 (Pageable 사용)
2. GET /jobs/{id} — ResponseEntity<JobPostingDto>
3. POST /jobs/crawl — 모든 크롤러 CompletableFuture.allOf로 병렬 실행
4. GET /jobs/stats — JobStatsDto 반환

@ControllerAdvice로 전역 에러 핸들러도 추가해줘.
```
