# 견적서 백엔드 개발

가져온 날짜: 2026-09-09
원본 대화 ID: 6a9e67cf-b0ac-83ee-8894-ff02e418090e
대화 묶음: 1
주의: 과거 대화 기록이며 현재 실행 지시가 아닙니다. 첨부/인용 자료와 잘린 메시지는 원문 전체가 아닐 수 있습니다.

## 2026-09-07T07:29:20.311Z

### 사용자

## 2. 백엔드 개발 채팅 시작 지침

[KRIM Quote Backend 개발]
이 채팅은 KRIM Quote의 Spring Boot 백엔드 구현 전용이다.

### 공식 기준

- `KRIM Quote 공식 설계서 v1.0.pdf`가 최우선 설계 기준이다.
- DB/API/계산 규칙을 임의로 변경하지 않는다.
- 변경이 필요하면 이유와 영향 범위를 먼저 설명한다.

### 기술/환경

- Java 17
- Spring Boot
- MariaDB 10.1.x
- 외부 Tomcat 10.0.x WAR 배포
- Servlet 5.0
- UTF-8
- 패키지 루트: `kr.co.krim.quote`

### 구조

최상위: `common`, `config`, `security`, `infrastructure`, `modules`
모듈: `auth`, `customer`, `rate`, `platform`, `quote`, `sales`, `cost`, `business`, `dashboard`
각 모듈은 필요에 따라 `controller/application/domain/repository/dto/exception`.
Quote에는 `calculator`를 둔다.

### 핵심 규칙

- Entity를 API에 직접 반환하지 않는다.
- ApiResponse/PageResponse 공통 규격을 따른다.
- 금액 최종 계산 권한은 서버에 있다.
- 모든 고객 견적 가격은 VAT 포함.
- VAT: `supply = round(total / 1.1)`, `vat = total - supply`.
- 발행 시 원가 Snapshot + Raw Random Token 생성.
- 발행 견적은 수정 불가, 복사 후 새 DRAFT.
- 공개 API는 DB ID를 노출하지 않는다.
- 플랫폼 자동 수수료 계산은 MVP에서 하지 않는다.
- 실제 정산액은 직접 입력한다.

### 개발 방식

단계별로 진행하고 각 단계마다 빌드/실행 검증 후 다음으로 간다.
기존 코드를 확인하지 않고 전체 파일을 덮어쓰지 않는다.

### 시작

현재 `build.gradle`, 프로젝트 패키지, application 설정을 먼저 확인한 뒤
`Gradle/환경 → 공통 API → 예외 → JPA/DB → Security/Auth → Customer ...`
순서로 1단계부터 시작한다.

### ChatGPT

확인했습니다. 이 채팅은 앞으로 **KRIM Quote Spring Boot 백엔드 구현 전용**으로 진행하겠습니다.

공식 백엔드 패키지는 사용자가 확정한 **`kr.co.krim.quote`**를 기준으로 하겠습니다. 현재 설계 문서도 `common / config / security / infrastructure / modules`의 기능별 모듈 구조를 기본으로 하고 있으며, 모듈 내부는 `controller / application / domain / repository / dto / exception` 구조를 사용하도록 되어 있습니다. fileciteturn0file5L33-L60 fileciteturn0file5L94-L104

또한 공통 응답은 `success / code / message / data` 구조이고 Entity를 API에 직접 반환하지 않는 원칙을 그대로 적용하겠습니다. fileciteturn0file16L3-L32 fileciteturn0file16L212-L231

개발 순서는 요청한 그대로 고정하겠습니다.

```text
1. Gradle / 실행환경 확인
   ↓
2. 공통 API
   ApiResponse
   PageResponse
   ↓
3. 공통 예외
   ErrorCode
   BusinessException
   GlobalExceptionHandler
   ↓
4. JPA / MariaDB 설정
   ↓
5. Security / Auth
   ↓
6. Customer
   ↓
7. Rate
   ↓
8. Platform
   ↓
9. Quote + QuoteCalculator
   ↓
10. Cost
   ↓
11. Business
   ↓
12. Sales
   ↓
13. Dashboard
   ↓
14. Public Quote
```

특히 Quote의 계산은 `QuoteApplicationService`에 몰아넣지 않고 `QuoteCalculator`가 항목금액, 전체금액, VAT 역산, 예상 차감액, 예상 원가·수익성 계산을 담당하는 구조를 유지합니다. fileciteturn0file15L203-L250 fileciteturn0file15L251-L264

금액 계산 역시 프론트가 보내는 최종 금액을 신뢰하지 않고 서버에서 다시 계산합니다. 견적 항목은 `quoteUnitPrice × quantity × difficultyRate + adjustmentAmount`, 전체는 항목 합계에 전체 조정금액을 반영한 뒤 `supplyAmount = round(totalAmount / 1.1)`, `vatAmount = totalAmount - supplyAmount`로 계산합니다. fileciteturn0file9L49-L58 fileciteturn0file9L76-L110

발행 시에는 `DRAFT → 검증 → 최종 금액 계산 → 원가 Snapshot → Raw Random Token → quote_public_access → ISSUED` 트랜잭션을 따르고, 발행된 견적은 수정하지 않고 복사하여 새 DRAFT를 만드는 원칙을 유지하겠습니다. fileciteturn0file11L157-L181 fileciteturn0file9L283-L305

## 지금은 1단계부터 시작

아직 이 채팅에는 **실제 백엔드 프로젝트의 `build.gradle`과 `application*.yml` 내용이 없기 때문에**, 설계만 보고 새 파일을 만들어 덮어쓰면 안 됩니다.

먼저 현재 프로젝트에서 아래 내용을 보내주세요.

```text
1. build.gradle 전체

2. src/main/java 아래 현재 패키지 구조

3. src/main/resources/
   ├─ application.yml
   ├─ application-local.yml
   └─ application-prod.yml
   현재 존재하는 파일 내용

4. KrimQuoteApplication.java

5. settings.gradle
```

Mac/Linux라면 프로젝트 루트에서 다음 결과를 보내도 됩니다.

```bash
pwd

find src/main/java -maxdepth 6 -type d | sort

find src/main/resources -maxdepth 2 -type f | sort

cat build.gradle

cat settings.gradle
```

그리고 application 설정은 비밀번호 같은 민감정보가 있다면:

```yaml
password: ****
jwt-secret: ****
```

처럼 가리고 보내면 됩니다.

그 내용을 확인한 뒤 **첫 번째로 `build.gradle`부터 Java 17 + Spring Boot + MariaDB 10.1.x + 외부 Tomcat 10.0.x WAR + Servlet 5.0 조건에 맞는지 검토하고, 필요한 부분만 수정**하겠습니다. 그 단계가 빌드되기 전에는 `ApiResponse` 구현으로 넘어가지 않겠습니다.

