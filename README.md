# SF Job API

네이버/구글 검색 및 채용 사이트에서 Salesforce 개발자 채용공고를 자동 수집하여 REST API로 제공하는 서비스

---

## 목차

1. [프로젝트 소개](#1-프로젝트-소개)
2. [기술 스택](#2-기술-스택)
3. [설치 방법](#3-설치-방법)
4. [실행 방법](#4-실행-방법)
5. [API 엔드포인트 목록](#5-api-엔드포인트-목록)
6. [프로젝트 구조](#6-프로젝트-구조)
7. [언어별 재현 가이드](#7-언어별-재현-가이드)

---

## 1. 프로젝트 소개

네이버 채용정보 API, Google Custom Search API, 원티드 등 주요 채용 플랫폼에서 **Salesforce 개발자** 채용공고를 수집하고 정규화하여 REST API로 제공합니다.

- 매일 오전 9시 / 오후 6시 자동 수집
- 중복 공고 자동 제거
- 신규 공고 슬랙 알림

---

## 2. 기술 스택

| 역할 | 기술 |
|------|------|
| 서버 | Node.js, Express |
| 크롤링 | Puppeteer, Cheerio, Axios |
| 스케줄러 | node-cron |
| 환경변수 | dotenv |

---

## 3. 설치 방법

### 3-1. 사전 요구사항

- Node.js v18 이상
- 네이버 검색 API 키 ([발급](https://developers.naver.com/apps/#/register))
- Google Custom Search API 키 ([발급](https://console.cloud.google.com))

### 3-2. 패키지 설치

```bash
git clone <repository-url>
cd sf-job-api
npm install
```

### 3-3. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 입력합니다.

```env
PORT=3000

# 네이버 검색 API
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret

# Google Custom Search API
GOOGLE_API_KEY=your_api_key
GOOGLE_SEARCH_ENGINE_ID=your_cx

# 슬랙 웹훅 (선택)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

---

## 4. 실행 방법

### 4-1. 개발 서버 실행

```bash
node index.js
```

서버가 정상 실행되면 `http://localhost:3000` 에서 API를 사용할 수 있습니다.

### 4-2. API 수동 크롤링 트리거

서버 실행 중 아래 명령어로 즉시 크롤링을 실행할 수 있습니다.

```bash
curl -X POST http://localhost:3000/jobs/crawl
```

---

## 5. API 엔드포인트 목록

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/jobs` | 채용공고 목록 조회 (필터, 페이지네이션) |
| GET | `/jobs/:id` | 채용공고 단건 조회 |
| POST | `/jobs/crawl` | 수동 크롤링 트리거 |
| GET | `/jobs/stats` | 수집 통계 조회 |

### 쿼리 파라미터 (GET /jobs)

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| page | number | 페이지 번호 (default: 1) |
| limit | number | 페이지당 결과 수 (default: 20) |
| source | string | 출처 필터 (naver / google / wanted) |
| keyword | string | 키워드 검색 |
| isNew | boolean | 신규 공고만 조회 |

---

## 6. 프로젝트 구조

```
sf-job-api/
├── index.js              # 서버 진입점
├── .env                  # 환경변수 (git 제외)
├── package.json
└── src/
    ├── crawlers/         # 크롤러 모듈
    │   ├── naver.js      # 네이버 채용정보 API
    │   ├── google.js     # Google Custom Search API
    │   └── wanted.js     # 원티드 크롤러
    ├── routes/
    │   └── jobs.js       # /jobs 라우터
    ├── models/
    │   └── job.js        # DB 모델 (SQLite)
    ├── services/
    │   ├── scheduler.js  # 자동 수집 스케줄러
    │   └── notification.js # 슬랙 알림
    └── config/
        └── db.js         # DB 연결 설정
```

---

## 7. 언어별 재현 가이드

`prompts/` 폴더에 각 구현 단계별 프롬프트가 정리되어 있습니다.
Claude에 붙여넣으면 Python(FastAPI) 또는 Java(Spring Boot)로 동일한 프로젝트를 재현할 수 있습니다.

| 파일 | 내용 |
|------|------|
| `00_project_overview.md` | 전체 개요 |
| `01_project_init.md` | 프로젝트 초기화 |
| `02_crawler.md` | 크롤러 구현 |
| `03_database.md` | DB 모델 설계 |
| `04_api.md` | API 엔드포인트 |
| `05_scheduler.md` | 스케줄러 |
| `06_notification.md` | 슬랙 알림 |
