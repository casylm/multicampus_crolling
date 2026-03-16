# 03. DB / 모델 설계

## 목표
수집한 채용공고를 저장할 DB 스키마와 ORM 모델을 구성한다.

---

## Node.js (실제 구현)

### 프롬프트 (Claude에게 입력)
```
Node.js + better-sqlite3로 아래 DB 모델을 만들어줘. (src/models/job.js)

테이블: job_postings
필드:
  - id: INTEGER PRIMARY KEY AUTOINCREMENT
  - title: TEXT NOT NULL
  - company: TEXT NOT NULL
  - url: TEXT UNIQUE NOT NULL
  - description: TEXT
  - source: TEXT          -- 수집 출처 (naver/google/wanted/saramin)
  - is_new: INTEGER DEFAULT 1   -- 신규 여부 (알림용)
  - collected_at: TEXT
  - created_at: TEXT DEFAULT CURRENT_TIMESTAMP

기능:
  - insertJob(job): 중복 URL이면 스킵 (INSERT OR IGNORE)
  - getAllJobs(filters): 필터링 + 페이지네이션
  - getJobById(id)
  - getStats(): source별 count, 최근 수집일
  - markAsNotified(): is_new = 0 업데이트
```

### 설치
```bash
npm install better-sqlite3
```

---

## Python으로 재현하려면

### 프롬프트 (Claude에게 입력)
```
Python + SQLAlchemy + Alembic으로 아래 DB 모델을 만들어줘.

파일: app/models/job.py

테이블: job_postings
필드:
  - id: Integer PK autoincrement
  - title: String NOT NULL
  - company: String NOT NULL
  - url: String UNIQUE NOT NULL
  - description: Text
  - source: String
  - is_new: Boolean default True
  - collected_at: DateTime
  - created_at: DateTime default now

CRUD 함수도 함께 만들어줘 (app/services/job_service.py):
  - create_job(db, job): 중복 URL 스킵
  - get_jobs(db, filters, skip, limit)
  - get_job_by_id(db, id)
  - get_stats(db)
  - mark_as_notified(db)
```

### 설치
```bash
pip install sqlalchemy alembic
alembic init alembic
```

---

## Java로 재현하려면

### 프롬프트 (Claude에게 입력)
```
Java Spring Boot + JPA + H2(개발) / PostgreSQL(운영)로 아래 엔티티를 만들어줘.

JobPosting.java (entity):
  - id: Long @GeneratedValue
  - title: String
  - company: String
  - url: String @Column(unique=true)
  - description: String
  - source: String
  - isNew: Boolean default true
  - collectedAt: LocalDateTime
  - createdAt: LocalDateTime @CreatedDate

JobPostingRepository.java (JpaRepository):
  - findByUrl(url)
  - findAllByFilters(Pageable pageable)
  - countBySource()
```
