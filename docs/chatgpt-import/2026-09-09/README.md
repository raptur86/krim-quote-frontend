# KRIM Quote 대화 인수인계

가져온 날짜: 2026-09-09. 연결된 ChatGPT 목록에서 KRIM Quote 프로젝트에 속한 대화 6개의 모든 페이지를 조회했다. 총 108개 대화 묶음(사용자 메시지와 답변)을 날짜순 Markdown 및 JSON으로 보관했다. 원래 ChatGPT 대화는 그대로 남아 있다.

## 대화 기록

- [견적서 프론트엔드개발](frontend.md): 44개 대화 묶음. 구조화 기록: [JSON](frontend.json).
- [견적서 백엔드 개발](backend.md): 1개 대화 묶음. 구조화 기록: [JSON](backend.json).
- [견적서및 사업진행관리 제작](planning.md): 52개 대화 묶음. 구조화 기록: [JSON](planning.json).
- [DB DDL 검토](database.md): 1개 대화 묶음. 구조화 기록: [JSON](database.json).
- [오류 해결 지침](troubleshooting.md): 8개 대화 묶음. 구조화 기록: [JSON](troubleshooting.json).
- [사업 세무회계 처리](accounting.md): 2개 대화 묶음. 구조화 기록: [JSON](accounting.json).

## 보관 범위와 누락

- 제공된 이미지 첨부 7개를 attachments 폴더에 복사했다. JSON 안의 원래 임시 파일 경로 대신 이 폴더를 사용한다.
- DB DDL 검토의 ChatGPT 답변 1개는 조회 도구의 메시지당 20,000자 제한으로 잘렸다. JSON의 truncatedItemIds에 기록했다. 전체 DDL을 복원했다고 간주하면 안 된다.
- 대화에서 인용한 KRIM Quote 공식 설계서 v1.0.pdf 및 기타 프로젝트 PDF 원본은 조회 결과에 포함되지 않았다.
- 과거 답변의 filecite, 검색 인용, sandbox 다운로드 링크는 보존된 문자열이다. 해당 자료가 로컬에 존재하거나 링크가 작동함을 보장하지 않는다.
- 기록에는 과거 제안, 수정 전 코드, 폐기된 정책이 함께 있다. 최신 사용자 결정과 공식 설계 원본을 대조해야 한다. 세무 대화는 과거 기록이며 새로 검증한 세무 안내가 아니다.
- 연결된 목록에서 확인한 관련 6개 대화가 대상이며 계정 전체 내보내기나 숨겨진 모든 대화의 완전성을 보장하는 백업은 아니다.

## 작업 방식에 관한 사용자 선호

프론트 대화에서 사용자는 “이제 내가 코드를 치고 싶은데 하다가 막히면 너가 설명하고 도와주고 그러다가 그냥 코드 달라고하면주고”라고 요청했다. 단계별 설명과 코드 검토를 선호하며, 이후 이곳에서 직접 구현을 요청하면 그 요청 범위에 맞춘다.
기존 파일을 읽고 필요한 부분을 수정한다. 페이지 이름 규칙을 도중에 불필요하게 바꾸지 않는다. 공통 CSS와 페이지/컴포넌트 전용 CSS를 나눈다.

## 제품과 최신 설계 결정

- 개인사업자 계림, 개발 브랜드 KRIM의 실제 외주 견적·매출 관리 시스템.
- 저장소: krim-quote-frontend / krim-quote-backend를 별도 관리.
- 프론트: React + TypeScript + Vite, React Router, Axios, TanStack Query, React Hook Form + Zod.
- 백엔드: Java 17 + Spring Boot, 패키지 kr.co.krim.quote, 외부 Tomcat 10.0.x / Servlet 5.0 / WAR라는 기존 환경 조건. 실제 호환성은 구현 시 확인 필요.
- DB: 초기 MySQL 언급보다 이후 확정된 MariaDB 10.1.x를 기준으로 함. JSON 의존 금지, 금액 DECIMAL(15,0), 수량·비율은 DECIMAL.
- 관리자 경로 /manage, 고객 공개 견적 /q/:token.
- 고객 견적 가격은 VAT 포함. 공급가액 round(total / 1.1), VAT = total - supply. 서버가 최종 계산 권한을 가진다.
- 견적 항목: quoteUnitPrice × quantity × difficultyRate + adjustmentAmount. 표준단가와 실제 견적 단가 및 과거 스냅샷을 분리한다.
- 발행 시 원가 Snapshot과 Raw Random Token 생성. token UNIQUE. 공개 API는 DB ID와 내부 원가 등 관리자 정보를 노출하지 않는다.
- 발행 견적은 직접 수정하지 않고 복사하여 새 DRAFT 작성.
- MVP에서 플랫폼 자동 수수료 계산은 제외. 실제 정산액은 직접 입력.
- quotes.inquiry_platform_id와 sales_records.payment_platform_id를 분리. quotes.tax_type 없음. business_profile.brand_name 추가.
- 대시보드 실제 매출은 견적 총액이 아니라 sales_records 기준.
- 공통 API 응답 success / code / message / data. Entity 직접 반환 금지.
- 핵심 테이블 14개: admin_users, business_profile, customers, rate_categories, standard_rates, platforms, cost_settings, fixed_cost_items, quotes, quote_items, quote_direct_costs, quote_cost_snapshot, quote_public_access, sales_records.
- 향후 확장: 견적 승인, 계약·전자서명, 프로젝트/납품/유지보수 관리. 기존 아이디어가 모두 MVP 확정 기능인 것은 아니다.

## 이어갈 위치 (대화 기준, 현재 코드 검증 전)

- 프론트: 기본 라우팅, 관리자 레이아웃, Sidebar/Header, 로그인 화면과 React Hook Form + Zod 연결을 진행했다.
- 사용자 UI 결정: 관리자 정보와 로그아웃은 사이드바 하단. 헤더에는 검색·새 견적·알림 방향을 논의했다. 알림은 실제 기능 완성 여부와 분리해서 확인.
- 마지막 프론트 답변은 auth.types.ts의 LoginRequest, Admin, LoginResponse와 공통 ApiResponse<T> 타입 작성, 이어서 authApi.ts 구현을 안내했다.
- 로그인 요청 email/password, 응답 accessToken/tokenType/expiresIn/admin, Admin id/email/name. POST /api/v1/auth/login.
- 마지막 제출 코드에는 LOGIN 버튼의 상시 disabled가 남아 있었고 제거 안내를 받았다. 로컬 코드에서 반영 여부 확인 필요.
- 백엔드: 시작 지침과 개발 순서만 있으며 실제 구현 완료 증거 없음. build.gradle, 설정, 패키지 확인부터.
- DB: 초기 DDL 제안이 있으나 실제 DB 실행/검증 완료 증거 없음. 잘린 답변과 공식 PDF를 확보해 대조해야 함.
- 오류 대화: Windows VS Code의 GitHub 두 계정과 HTTPS/SSH remote 인증 문제, JSX 파일 확장자 문제. 과거 진단이 현재도 유효하다고 단정하지 않는다.

이번 가져오기에서는 애플리케이션 코드를 변경하거나 빌드·실행하지 않았다.

