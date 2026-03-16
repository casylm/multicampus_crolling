# 세일즈포스 채용공고 수집 API — 프로젝트 개요

## 목적
네이버/구글 검색 및 주요 채용 사이트에서 Salesforce 개발자 채용공고를 수집하여 REST API로 제공한다.

## 기능 목록
- 채용공고 크롤링 (네이버 검색 API, Google Custom Search API, 사람인/원티드 등)
- 중복 제거 및 데이터 정규화
- REST API 제공 (목록 조회, 상세 조회, 수동 트리거, 통계)
- 스케줄러 (매일 자동 수집)
- 신규 공고 알림 (슬랙 웹훅 또는 이메일)

## API 엔드포인트
| Method | Path | 설명 |
|--------|------|------|
| GET | /jobs | 전체 목록 (필터, 페이지네이션) |
| GET | /jobs/:id | 상세 조회 |
| POST | /jobs/crawl | 수동 크롤링 트리거 |
| GET | /jobs/stats | 통계 |

## 언어별 구현 프롬프트 파일
| 단계 | 파일 |
|------|------|
| 01. 프로젝트 초기화 | `01_project_init.md` |
| 02. 크롤러 구현 | `02_crawler.md` |
| 03. DB / 모델 설계 | `03_database.md` |
| 04. API 엔드포인트 | `04_api.md` |
| 05. 스케줄러 | `05_scheduler.md` |
| 06. 알림 기능 | `06_notification.md` |
