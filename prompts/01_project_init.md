# 01. 프로젝트 초기화

## 목표
세일즈포스 채용공고 수집 API 프로젝트의 기본 구조와 의존성을 세팅한다.

---

## Node.js (실제 구현)

### 폴더 구조
```
sf-job-api/
├── src/
│   ├── crawlers/     # 크롤러 모듈 (네이버, 구글, 사이트별)
│   ├── routes/       # Express 라우터
│   ├── models/       # DB 모델
│   ├── services/     # 비즈니스 로직
│   └── config/       # 환경 설정
├── .env
├── package.json
└── index.js
```

### 명령어
```bash
mkdir sf-job-api && cd sf-job-api
npm init -y
npm install express axios cheerio puppeteer node-cron dotenv
```

### 주요 패키지 역할
| 패키지 | 역할 |
|--------|------|
| express | REST API 서버 |
| axios | HTTP 요청 (네이버/구글 API 호출) |
| cheerio | HTML 파싱 (BeautifulSoup 역할) |
| puppeteer | JS 렌더링 크롤링 (헤드리스 브라우저) |
| node-cron | 스케줄러 |
| dotenv | 환경변수 관리 |

---

## Python으로 재현하려면

### 프롬프트 (Claude에게 입력)
```
세일즈포스 채용공고 수집 REST API를 Python으로 만들어줘.

기술 스택:
- 웹 프레임워크: FastAPI
- 크롤링: Playwright + BeautifulSoup4
- HTTP 클라이언트: httpx
- 스케줄러: APScheduler
- 환경변수: python-dotenv

아래 폴더 구조로 프로젝트를 초기화하고 requirements.txt를 만들어줘:
sf-job-api/
├── app/
│   ├── crawlers/
│   ├── routers/
│   ├── models/
│   ├── services/
│   └── config/
├── .env
├── requirements.txt
└── main.py
```

### 명령어
```bash
mkdir sf-job-api && cd sf-job-api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn httpx playwright beautifulsoup4 apscheduler python-dotenv
playwright install chromium
```

---

## Java로 재현하려면

### 프롬프트 (Claude에게 입력)
```
세일즈포스 채용공고 수집 REST API를 Java Spring Boot로 만들어줘.

기술 스택:
- 프레임워크: Spring Boot 3.x
- 크롤링: Jsoup (정적), Selenium (동적 JS 렌더링)
- HTTP 클라이언트: RestTemplate or WebClient
- 스케줄러: @Scheduled
- 빌드 도구: Gradle

아래 패키지 구조로 프로젝트를 초기화하고 build.gradle을 만들어줘:
com.sfjobs/
├── crawler/
├── controller/
├── model/
├── service/
└── config/
```

### build.gradle 주요 의존성
```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.jsoup:jsoup:1.17.2'
    implementation 'org.seleniumhq.selenium:selenium-java:4.18.1'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
}
```
