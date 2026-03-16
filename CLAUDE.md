# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 명령어

```bash
# 서버 실행 (sf-job-api 디렉토리에서)
cd sf-job-api
node index.js

# 패키지 설치
npm install

# 수동 크롤링 트리거 (서버 실행 중)
curl -X POST http://localhost:3000/jobs/crawl
```

## 환경변수 설정

`sf-job-api/.env.example`을 복사해 `.env`를 만든 뒤 키를 입력한다.

```
NAVER_CLIENT_ID / NAVER_CLIENT_SECRET  — 네이버 검색 API
GOOGLE_API_KEY / GOOGLE_SEARCH_ENGINE_ID — Google Custom Search API
SLACK_WEBHOOK_URL — 슬랙 알림 (선택)
```

## 아키텍처

```
요청 흐름:
  POST /jobs/crawl
    → routes/jobs.js
    → services/crawlerService.js   (Promise.all로 3개 크롤러 병렬 실행)
    → crawlers/{naver,google,wanted}.js
    → models/job.js                (INSERT OR IGNORE — URL 기준 중복 제거)
    → services/notification.js     (is_new=1 인 공고만 슬랙 전송 후 is_new=0)

자동 수집 흐름:
  index.js 시작 → services/scheduler.js (node-cron)
    → 매일 09:00, 18:00 KST → runAllCrawlers() 동일 실행
```

**DB**: `better-sqlite3` 사용, `data/jobs.db`에 저장. `src/config/db.js` 로드 시 테이블 자동 생성.

**크롤러 반환 형태**: 모든 크롤러는 동일한 객체 배열을 반환해야 한다.
```js
{ title, company, url, description, source, collectedAt }
```

## prompts/ 폴더

`prompts/00~06_*.md` — 현재 Node.js 구현을 Python(FastAPI) 또는 Java(Spring Boot)로 재현할 수 있는 단계별 프롬프트 모음. 새 기능 추가 시 해당 단계 프롬프트도 함께 업데이트한다.
