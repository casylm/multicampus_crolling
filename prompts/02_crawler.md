# 02. 크롤러 구현

## 목표
네이버 검색 API, Google Custom Search API, 사람인/원티드 크롤링으로 Salesforce 채용공고를 수집한다.

---

## Node.js (실제 구현)

### 프롬프트 (Claude에게 입력)
```
Node.js + axios + cheerio로 아래 크롤러를 만들어줘.

1. 네이버 검색 API 크롤러 (src/crawlers/naver.js)
   - 네이버 검색 API v1 사용
   - 검색어: "세일즈포스 개발자 채용", "Salesforce Developer"
   - 반환 필드: title, company, url, description, pubDate

2. Google Custom Search API 크롤러 (src/crawlers/google.js)
   - Google Custom Search JSON API 사용
   - 검색어: "Salesforce Developer 채용 site:saramin.co.kr OR site:wanted.co.kr"
   - 반환 필드: title, link, snippet

3. 원티드 크롤러 (src/crawlers/wanted.js)
   - axios로 원티드 API (https://www.wanted.co.kr/api/v4/jobs) 호출
   - 검색어: salesforce
   - 반환 필드: title, company_name, reward, due_time, detail_url

각 크롤러는 동일한 형태의 객체 배열을 반환해야 해:
{
  title: string,
  company: string,
  url: string,
  description: string,
  source: string,  // "naver" | "google" | "wanted"
  collectedAt: Date
}
```

### 환경변수 (.env)
```
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
GOOGLE_API_KEY=your_api_key
GOOGLE_SEARCH_ENGINE_ID=your_cx
```

---

## Python으로 재현하려면

### 프롬프트 (Claude에게 입력)
```
Python + httpx + BeautifulSoup4로 아래 크롤러를 만들어줘.

1. 네이버 검색 API 크롤러 (app/crawlers/naver.py)
   - httpx로 네이버 검색 API v1 호출
   - 검색어: "세일즈포스 개발자 채용"
   - async/await 방식으로 구현

2. Google Custom Search API 크롤러 (app/crawlers/google.py)
   - httpx AsyncClient 사용

3. 원티드 크롤러 (app/crawlers/wanted.py)
   - httpx로 원티드 API 호출

모든 크롤러는 아래 Pydantic 모델을 반환해야 해:
class JobPosting(BaseModel):
    title: str
    company: str
    url: str
    description: str
    source: str
    collected_at: datetime
```

---

## Java로 재현하려면

### 프롬프트 (Claude에게 입력)
```
Java Spring Boot + RestTemplate + Jsoup으로 아래 크롤러를 만들어줘.

1. NaverCrawler.java — 네이버 검색 API 호출
2. GoogleCrawler.java — Google Custom Search API 호출
3. WantedCrawler.java — 원티드 API 호출

모든 크롤러는 List<JobPostingDto>를 반환해야 해.
JobPostingDto 필드: title, company, url, description, source, collectedAt
```

---

## API 키 발급 방법

### 네이버 검색 API
1. https://developers.naver.com 접속
2. 애플리케이션 등록 → 검색 API 선택
3. Client ID, Client Secret 발급

### Google Custom Search API
1. https://console.cloud.google.com 접속
2. Custom Search API 활성화 → API 키 발급
3. https://cse.google.com 에서 검색엔진 생성 → cx 값 복사
