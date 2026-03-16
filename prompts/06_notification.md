# 06. 알림 기능

## 목표
신규 채용공고 수집 시 슬랙 웹훅 또는 이메일로 알림을 발송한다.

---

## Node.js (실제 구현)

### 프롬프트 (Claude에게 입력)
```
Node.js + axios로 슬랙 웹훅 알림 기능을 만들어줘. (src/services/notification.js)

기능:
1. sendSlackNotification(jobs): 신규 채용공고 목록을 슬랙으로 전송
   - 메시지 포맷: 공고 제목, 회사명, URL 포함
   - 한 번에 최대 5개까지만 표시, 초과 시 "외 N건" 표시
2. 크롤링 완료 후 is_new = true인 공고만 필터링해서 전송
3. 전송 완료 후 is_new = false로 업데이트

환경변수:
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### 슬랙 웹훅 설정 방법
1. https://api.slack.com/apps 에서 앱 생성
2. Incoming Webhooks 활성화
3. 원하는 채널에 웹훅 URL 발급

---

## Python으로 재현하려면

### 프롬프트 (Claude에게 입력)
```
Python + httpx로 슬랙 웹훅 알림을 만들어줘. (app/services/notification.py)

async def send_slack_notification(jobs: List[JobPosting]) -> None:
  - httpx.AsyncClient로 POST 요청
  - Block Kit 포맷으로 메시지 구성
  - 최대 5개 표시, 초과 시 "외 N건"
```

---

## Java로 재현하려면

### 프롬프트 (Claude에게 입력)
```
Java + RestTemplate으로 슬랙 웹훅 알림을 만들어줘. (NotificationService.java)

void sendSlackNotification(List<JobPostingDto> jobs):
  - RestTemplate.postForEntity로 슬랙 웹훅 호출
  - 메시지 포맷: 공고 제목, 회사명, URL
  - @Async로 비동기 처리
```
