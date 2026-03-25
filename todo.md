# NSN Search Project TODO

## 백엔드 (Node.js/Express + tRPC)
- [x] tRPC 서버 기본 구조 설정
- [x] BeautifulSoup4 크롤링 엔진 구현 (server/crawlers.ts)
  - [x] ISO Group NSN Lookup 크롤러
  - [x] NSN Center 크롤러
  - [x] PartTarget 크롤러
- [x] 데이터 정규화 모듈
- [x] 다중 사이트 폴백 로직
- [x] tRPC 엔드포인트 구현 (search, searchHistory)
- [x] 타임아웃 및 에러 핸들링 (3~5초 제한)
- [x] 검색 기록 데이터베이스 스키마 (drizzle/schema.ts)

## 프론트엔드 (React/TypeScript)n- [x] 검색 입력 UI 컴포넌트 (Home.tsx에 통합)n- [x] 결과 카드 컴포넌트 (client/src/components/ResultCard.tsx)n- [x] 메인 검색 페이지 (client/src/pages/Home.tsx)n- [x] 최근 검색 기록 UI (client/src/components/SearchHistory.tsx)n- [x] 복사 버튼 기능 (클립보드 API)n- [x] 로딩 상태 UI (스피너, 스켈레톤)n- [x] 에러 메시지 표시

## tRPC 절차 (server/routers.ts)n- [x] search.byQuery 절차 (NSN/Part Number 검색 - 폴백)n- [x] search.allSources 절차 (모든 사이트 검색)n- [x] searchHistory.getRecent 절차 (최근 검색 기록 조회)n- [x] searchHistory.clear 절차 (검색 기록 삭제)

## 데이터베이스 (Drizzle ORM)n- [x] searchHistory 테이블 스키마 정의n- [x] 마이그레이션 SQL 생성 및 적용

## 테스트 및 통합n- [x] 크롤러 단위 테스트 (server/search.test.ts) - 9개 테스트 통과n- [ ] API 통합 테스트n- [ ] 프론트엔드 컴포넌트 테스트n- [ ] 전체 E2E 테스트

## 배포
- [ ] 초기 체크포인트 생성
- [ ] GitHub 리포지토리 푸시
