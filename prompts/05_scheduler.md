# 05. 스케줄러

## 목표
매일 정해진 시간에 자동으로 크롤러를 실행하여 최신 채용공고를 수집한다.

---

## Node.js (실제 구현)

### 프롬프트 (Claude에게 입력)
```
node-cron으로 채용공고 자동 수집 스케줄러를 만들어줘. (src/services/scheduler.js)

조건:
- 매일 오전 9시, 오후 6시 두 번 실행
- 크롤링 실행 → DB 저장 → 신규 공고 수 로그 출력
- 실패해도 서버가 죽지 않도록 try/catch 처리
- cron 표현식: '0 9,18 * * *'
```

### 설치
```bash
npm install node-cron
```

---

## Python으로 재현하려면

### 프롬프트 (Claude에게 입력)
```
APScheduler로 채용공고 자동 수집 스케줄러를 만들어줘. (app/services/scheduler.py)

조건:
- AsyncIOScheduler 사용 (FastAPI와 통합)
- 매일 09:00, 18:00 실행
- lifespan 이벤트로 FastAPI 시작 시 스케줄러 자동 시작
- 실패 시 로깅만 하고 계속 실행
```

### 설치
```bash
pip install apscheduler
```

---

## Java로 재현하려면

### 프롬프트 (Claude에게 입력)
```
Spring Boot @Scheduled로 채용공고 자동 수집 스케줄러를 만들어줘. (CrawlerScheduler.java)

조건:
- @EnableScheduling 활성화
- 매일 09:00, 18:00 실행: @Scheduled(cron = "0 0 9,18 * * *")
- 크롤러 병렬 실행 후 결과 로깅
- 예외 발생 시 @Retryable로 3회 재시도
```

### application.properties
```properties
spring.task.scheduling.pool.size=2
```
