# DB DDL 검토

가져온 날짜: 2026-09-09
원본 대화 ID: 6a9e6808-8d70-83ee-b5e6-e7d55ae2a889
대화 묶음: 1
주의: 과거 대화 기록이며 현재 실행 지시가 아닙니다. 첨부/인용 자료와 잘린 메시지는 원문 전체가 아닐 수 있습니다.

## 2026-09-07T07:30:16.666Z

### 사용자

## 3. DB 개발 채팅 시작 지침

[KRIM Quote Database 개발]
이 채팅은 KRIM Quote MariaDB 스키마/DDL/인덱스 관리 전용이다.

### 공식 기준

- `KRIM Quote 공식 설계서 v1.0.pdf`의 최종 DB 정책을 따른다.
- 이전 ERD의 폐기된 VAT/tax\_type/자동 수수료 정책을 되살리지 않는다.

### DB

- MariaDB 10.1.x
- UTF-8
- JSON 의존 금지
- 금액: DECIMAL(15,0)
- 비율/난이도/수량은 필요한 정밀도의 DECIMAL
- 금액에 FLOAT/DOUBLE 금지

### MVP 14개 테이블

`admin_users`
`business_profile`
`customers`
`rate_categories`
`standard_rates`
`platforms`
`cost_settings`
`fixed_cost_items`
`quotes`
`quote_items`
`quote_direct_costs`
`quote_cost_snapshot`
`quote_public_access`
`sales_records`

### 최종 보완

- `business_profile.brand_name` 추가
- `quotes.tax_type` 없음
- 가격 필드는 VAT 포함 기준
- `quotes.inquiry_platform_id`와 `sales_records.payment_platform_id` 분리
- 공개 token은 raw token 저장, UNIQUE
- 발행/매출 데이터는 물리 삭제보다 상태 관리
- 표준단가/원가 변경이 과거 Snapshot을 변경하지 않게 한다.

### 시작

먼저 공식 설계서의 14개 테이블을 기준으로 최종 ERD/DDL을 검토하고,
MariaDB 10.1에서 실제 실행 가능한 CREATE TABLE 순서부터 작성한다.
FK, UNIQUE, INDEX, NULL 정책도 함께 검토한다.

### ChatGPT (도구에서 내용 잘림)

좋습니다. **이 채팅은 이제 `KRIM Quote Database 개발` 전용**으로 잡고, 앞으로 MariaDB 스키마·DDL·FK·INDEX·데이터 마이그레이션 관련 작업만 이 기준으로 진행하겠습니다.

공식 DB 설계에는 MVP가 정확히 **14개 테이블**로 정리되어 있고, 플랫폼 자동 수수료 정책 테이블은 후속 확장으로 제외되어 있습니다. fileciteturn3file0L149-L180 또한 금액은 `DECIMAL(15,0)`, 비율은 `DECIMAL`, 금액 계산에 `FLOAT/DOUBLE`은 사용하지 않는 원칙이 명시되어 있습니다. fileciteturn3file0L89-L115

다만 공식 DB 설계 PDF의 `quotes.platform_id`, `sales_records.platform_id` 표기는 이후 확정된 최종 정책에 따라 각각 **`inquiry_platform_id` / `payment_platform_id`로 교체**해서 구현하겠습니다. 실제 API 설계에서도 두 값은 서로 다른 의미이며 nullable을 허용하는 것으로 확정되어 있습니다. fileciteturn0file6L121-L147

## 1. 실제 CREATE TABLE 순서

FK 의존관계를 고려하면 MariaDB에서 가장 안전한 생성 순서는 다음입니다.

```text
01. admin_users
02. business_profile
03. customers
04. rate_categories
05. standard_rates
06. platforms
07. cost_settings
08. fixed_cost_items
09. quotes
10. quote_items
11. quote_direct_costs
12. quote_cost_snapshot
13. quote_public_access
14. sales_records
```

ERD 관계는 크게 다음 구조입니다.

```text
rate_categories
      │ 1:N
      ▼
standard_rates
      │
      │
customers ────────┐
                  │
platforms ────────┤
                  ▼
               quotes
                  │
       ┌──────────┼──────────────┬──────────────────┐
       │          │              │                  │
       ▼          ▼              ▼                  ▼
 quote_items  quote_direct_  quote_cost_       quote_public_
                 costs        snapshot            access
       │
       └── standard_rates


quotes
   │ 1:N
   ▼
sales_records
   │
   ▼
platforms


cost_settings
   │ 1:N
   ▼
fixed_cost_items
```

공식 문서도 `quote_cost_snapshot`을 견적당 1개인 `1:1`, `quote_public_access`와 매출 등을 견적 하위 데이터로 두는 구조입니다. fileciteturn2file0L150-L171 fileciteturn3file0L116-L141

---

# 2. MariaDB 10.1 기준 초기 DDL

우선 DB 자체부터 이렇게 시작하는 것을 권장합니다.

```sql
CREATE DATABASE IF NOT EXISTS krim_quote
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE krim_quote;
```

여기서 단순 `utf8`보다 **`utf8mb4`**를 쓰겠습니다. MariaDB 10.1에서도 사용 가능하고, 향후 고객명·메모 등에 4-byte Unicode가 들어가도 안전합니다.

모든 테이블은:

```text
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
```

로 통일합니다.

---

## 01. `admin_users`

공식 필드는 `email`, `password_hash`, `name`, `status`, `last_login_at`, 생성/수정일입니다. 비밀번호는 평문이 아니라 BCrypt hash 저장이 전제입니다. fileciteturn2file1L399-L410

```sql
CREATE TABLE admin_users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    last_login_at DATETIME NULL,

    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_admin_users_email (email),
    KEY idx_admin_users_status (status)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

### 정책

```text
email          NOT NULL + UNIQUE
password_hash  NOT NULL
name           NOT NULL
status         NOT NULL
last_login_at  NULL
```

`status`는 애플리케이션에서:

```text
ACTIVE
INACTIVE
```

만 허용합니다.

MariaDB `ENUM`으로 강제하지 않고 `VARCHAR`로 두겠습니다. Java Enum과 DB 변경 독립성을 유지하기 좋습니다.

---

# 02. `business_profile`

기존 설계에 없었던 `brand_name`은 최종 보완사항이므로 반드시 넣습니다. API 설계에서도 `business_name=계림`, `brand_name=KRIM`을 별개로 사용하도록 확정됐습니다. fileciteturn0file14L221-L243

```sql
CREATE TABLE business_profile (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    business_name VARCHAR(150) NOT NULL,
    brand_name VARCHAR(150) NULL,

    representative_name VARCHAR(100) NOT NULL,
    business_number VARCHAR(30) NULL,

    address VARCHAR(500) NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(150) NULL,
    website VARCHAR(255) NULL,

    logo_path VARCHAR(500) NULL,

    bank_name VARCHAR(100) NULL,
    account_number VARCHAR(100) NULL,
    account_holder VARCHAR(100) NULL,

    default_quote_message TEXT NULL,

    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

MVP에서는 사실상 **1 row만 사용하는 설정 테이블**입니다. 공식 설계도 동일한 방향입니다. fileciteturn2file1L411-L432

다만 DB에서 억지로 `id = 1`을 강제하지는 않겠습니다.

---

# 03. `customers`

```sql
CREATE TABLE customers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    customer_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150) NULL,
    contact_name VARCHAR(100) NULL,

    phone VARCHAR(50) NULL,
    email VARCHAR(150) NULL,
    business_number VARCHAR(30) NULL,
    address VARCHAR(500) NULL,

    acquisition_channel VARCHAR(100) NULL,
    memo TEXT NULL,

    active TINYINT(1) NOT NULL DEFAULT 1,

    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    KEY idx_customers_active (active),
    KEY idx_customers_customer_name (customer_name),
    KEY idx_customers_company_name (company_name),
    KEY idx_customers_email (email)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

고객은 `customer_name`만 필수이고 회사명·담당자·전화번호·이메일 등은 선택이라는 API 정책과 맞춥니다. fileciteturn0file4L17-L26

### 이메일 UNIQUE는 두지 않습니다.

동일 이메일 고객이 있을 수도 있기 때문에 공식 API에서도 이메일 중복을 강제로 금지하지 않습니다. fileciteturn0file4L226-L234

또 고객 삭제 대신:

```text
active = 0
```

으로 관리합니다.

과거 견적 FK는 그대로 유지합니다. fileciteturn0file4L187-L209

---

# 04. `rate_categories`

```sql
CREATE TABLE rate_categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    active TINYINT(1) NOT NULL DEFAULT 1,

    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    KEY idx_rate_categories_active_sort (
        active,
        sort_order
    )

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

카테고리명 자체는 현재 **UNIQUE로 강제하지 않겠습니다.**

애플리케이션에서는 중복 등록을 방지할 수 있지만 DB 레벨 UNIQUE까지 필요한 비즈니스 키는 아닙니다.

---

# 05. `standard_rates`

```sql
CREATE TABLE standard_rates (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    category_id BIGINT UNSIGNED NOT NULL,

    feature_name VARCHAR(200) NOT NULL,
    description TEXT NULL,

    standard_price DECIMAL(15, 0) NOT NULL,

    default_unit VARCHAR(50) NULL,
    default_hours DECIMAL(10, 2) NULL,

    active TINYINT(1) NOT NULL DEFAULT 1,

    internal_memo TEXT NULL,

    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    KEY idx_standard_rates_category (
        category_id
    ),

    KEY idx_standard_rates_category_active (
        category_id,
        active
    ),

    KEY idx_standard_rates_feature_name (
        feature_name
    ),

    CONSTRAINT fk_standard_rates_category
        FOREIGN KEY (category_id)
        REFERENCES rate_categories (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

`standard_price`는 **VAT 포함 금액**입니다. 표준단가 API에서도 이 정책이 최종 확정되어 있습니다. fileciteturn0file7L83-L97

그리고 표준단가를 수정해도 과거 견적의 Snapshot을 다시 계산해서는 안 됩니다. fileciteturn0file7L200-L210

---

# 06. `platforms`

```sql
CREATE TABLE platforms (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    platform_type VARCHAR(30) NOT NULL,

    automatic_fee_supported TINYINT(1) NOT NULL DEFAULT 0,
    active TINYINT(1) NOT NULL DEFAULT 1,

    memo TEXT NULL,

    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uk_platforms_code (code),

    KEY idx_platforms_active (
        active
    ),

    KEY idx_platforms_type_active (
        platform_type,
        active
    )

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

여기에는 **수수료율이나 수수료 계산 정책을 넣지 않습니다.** 공식 DB 설계에서도 플랫폼 자체와 수수료 정책을 분리하고, 자동 수수료 테이블은 MVP에서 제외합니다. fileciteturn3file1L271-L302

---

# 07. `cost_settings`

```sql
CREATE TABLE cost_settings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    setting_name VARCHAR(150) NOT NULL,

    internal_hourly_cost DECIMAL(15, 0) NOT NULL,
    monthly_standard_hours DECIMAL(10, 2) NOT NULL,

    effective_from DATE NOT NULL,
    effective_to DATE NULL,

    active TINYINT(1) NOT NULL DEFAULT 1,

    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    KEY idx_cost_settings_active (
        active
    ),

    KEY idx_cost_settings_effective (
        effective_from,
        effective_to
    )

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

원가설정은 기존 값을 덮어쓰기보다 **기간별 이력**을 남기는 방식입니다. fileciteturn0file14L55-L87

---

# 08. `fixed_cost_items`

```sql
CREATE TABLE fixed_cost_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    cost_setting_id BIGINT UNSIGNED NOT NULL,

    cost_name VARCHAR(150) NOT NULL,
    monthly_amount DECIMAL(15, 0) NOT NULL,

    sort_order INT NOT NULL DEFAULT 0,
    active TINYINT(1) NOT NULL DEFAULT 1,

    memo TEXT NULL,

    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    KEY idx_fixed_cost_items_setting (
        cost_setting_id
    ),

    KEY idx_fixed_cost_items_setting_active (
        cost_setting_id,
        active
    ),

    CONSTRAINT fk_fixed_cost_items_setting
        FOREIGN KEY (cost_setting_id)
        REFERENCES cost_settings (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

공식 구조상 `cost_settings 1:N fixed_cost_items`입니다. fileciteturn3file1L324-L354

---

# 09. `quotes`

여기서 기존 DB 문서의 `platform_id`를 최종 정책대로 **`inquiry_platform_id`**로 교체합니다.

그리고 **`tax_type`은 절대 만들지 않습니다.**

```sql
CREATE TABLE quotes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    quote_number VARCHAR(50) NOT NULL,

    customer_id BIGINT UNSIGNED NOT NULL,
    inquiry_platform_id BIGINT UNSIGNED NULL,

    title VARCHAR(255) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

    written_date DATE NOT NULL,
    valid_until DATE NULL,
    expected_duration VARCHAR(100) NULL,

    customer_note TEXT NULL,
    internal_memo TEXT NULL,

    items_amount DECIMAL(15, 0) NOT NULL DEFAULT 0,
    adjustment_amount DECIMAL(15, 0) NOT NULL DEFAULT 0,

    supply_amount DECIMAL(15, 0) NOT NULL DEFAULT 0,
    vat_rate DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    vat_amount DECIMAL(15, 0) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15, 0) NOT NULL DEFAULT 0,

    expected_settlement_amount DECIMAL(15, 0) NULL,
    expected_deduction_amount DECIMAL(15, 0) NULL,
    expected_settlement_memo TEXT NULL,

    estimated_hours DECIMAL(10, 2) NULL,

    issued_at DATETIME NULL,
    cancelled_at DATETIME NULL,

    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uk_quotes_quote_number (
        quote_number
    ),

    KEY idx_quotes_customer (
        customer_id
    ),

    KEY idx_quotes_inquiry_platform (
        inquiry_platform_id
    ),

    KEY idx_quotes_status (
        status
    ),

    KEY idx_quotes_written_date (
        written_date
    ),

    KEY idx_quotes_status_written_date (
        status,
        written_date
    ),

    KEY idx_quotes_customer_created (
        customer_id,
        created_at
    ),

    CONSTRAINT fk_quotes_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CONSTRAINT fk_quotes_inquiry_platform
        FOREIGN KEY (inquiry_platform_id)
        REFERENCES platforms (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

공식 견적 구조에는 기능합계, 전체 조정, 공급가액, VAT, 총액, 예상 정산액과 예상 작업시간이 포함됩니다. fileciteturn2file0L49-L84

가격은 모두 VAT 포함 기준이며, 최종 총액에서 공급가액과 VAT를 역산합니다. `tax_type`은 최종 API 정책에서 폐기되었습니다. fileciteturn0file16L136-L155

---

# 10. `quote_items`

이 테이블이 **표준단가 Snapshot 정책의 핵심**입니다.

```sql
CREATE TABLE quote_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    quote_id BIGINT UNSIGNED NOT NULL,
    standard_rate_id BIGINT UNSIGNED NULL,

    category_name_snapshot VARCHAR(100) NULL,

    feature_name VARCHAR(200) NOT NULL,
    description TEXT NULL,

    standard_price_snapshot DECIMAL(15, 0) NULL,
    quote_unit_price DECIMAL(15, 0) NOT NULL,

    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    unit_name VARCHAR(50) NULL,

    difficulty_code VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    difficulty_rate DECIMAL(5, 2) NOT NULL DEFAULT 1.00,

    adjustment_amount DECIMAL(15, 0) NOT NULL DEFAULT 0,
    adjustment_reason VARCHAR(500) NULL,

    calculated_amount DECIMAL(15, 0) NOT NULL,
    final_amount DECIMAL(15, 0) NOT NULL,

    estimated_hours DECIMAL(10, 2) NULL,
    internal_memo TEXT NULL,

    sort_order INT NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    KEY idx_quote_items_quote (
        quote_id
    ),

    KEY idx_quote_items_quote_sort (
        quote_id,
        sort_order
    ),

    KEY idx_quote_items_standard_rate (
        standard_rate_id
    ),

    CONSTRAINT fk_quote_items_quote
        FOREIGN KEY (quote_id)
        REFERENCES quotes (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CONSTRAINT fk_quote_items_standard_rate
        FOREIGN KEY (standard_rate_id)
        REFERENCES standard_rates (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

직접 견적 항목에서는:

```text
standard_rate_id         NULL
standard_price_snapshot  NULL
```

이 정상입니다.

반대로 표준단가를 가져온 경우 현재 표준단가와 카테고리명을 견적 항목에 Snapshot으로 복사합니다. fileciteturn0file7L221-L243

계산값은:

```text
calculated_amount
= quote_unit_price × quantity × difficulty_rate

final_amount
= calculated_amount + adjustment_amount
```

입니다. fileciteturn2file0L117-L127

---

# 11. `quote_direct_costs`

```sql
CREATE TABLE quote_direct_costs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    quote_id BIGINT UNSIGNED NOT NULL,

    cost_name VARCHAR(150) NOT NULL,
    amount DECIMAL(15, 0) NOT NULL,

    memo TEXT NULL,
    sort_order INT NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    KEY idx_quote_direct_costs_quote (
        quote_id
    ),

    KEY idx_quote_direct_costs_quote_sort (
        quote_id,
        sort_order
    ),

    CONSTRAINT fk_quote_direct_costs_quote
        FOREIGN KEY (quote_id)
        REFERENCES quotes (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

이 직접비는 고객 견적 항목이 아니라 **KRIM 내부 예상 원가 계산용**이므로 고객 공개 대상이 아닙니다. fileciteturn2file0L128-L149

---

# 12. `quote_cost_snapshot`

```sql
CREATE TABLE quote_cost_snapshot (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    quote_id BIGINT UNSIGNED NOT NULL,

    internal_hourly_cost DECIMAL(15, 0) NOT NULL,
    monthly_fixed_cost DECIMAL(15, 0) NOT NULL,
    monthly_standard_hours DECIMAL(10, 2) NOT NULL,
    hourly_overhead_cost DECIMAL(15, 0) NOT NULL,

    estimated_hours DECIMAL(10, 2) NOT NULL,

    estimated_labor_cost DECIMAL(15, 0) NOT NULL,
    estimated_overhead_cost DECIMAL(15, 0) NOT NULL,
    estimated_direct_cost DECIMAL(15, 0) NOT NULL,

    estimated_settlement_amount DECIMAL(15, 0) NULL,

    estimated_total_cost DECIMAL(15, 0) NOT NULL,
    estimated_profit DECIMAL(15, 0) NULL,
    estimated_profit_rate DECIMAL(7, 4) NULL,

    created_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uk_quote_cost_snapshot_quote (
        quote_id
    ),

    CONSTRAINT fk_quote_cost_snapshot_quote
        FOREIGN KEY (quote_id)
        REFERENCES quotes (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

여기서:

```text
UNIQUE(quote_id)
```

가 매우 중요합니다.

즉:

```text
Quote 1
:
QuoteCostSnapshot 1
```

입니다. 공식 ERD에서도 `quote_id = FK + UNIQUE`입니다. fileciteturn2file0L150-L171

발행 이후 원가 설정이 변경되더라도 이 Snapshot은 다시 계산하지 않습니다. fileciteturn0file14L157-L180

---

# 13. `quote_public_access`

공개 토큰은 최종 결정대로 **raw token 그대로 저장**합니다.

```sql
CREATE TABLE quote_public_access (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    quote_id BIGINT UNSIGNED NOT NULL,

    access_token VARCHAR(128) NOT NULL,

    active TINYINT(1) NOT NULL DEFAULT 1,

    issued_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    expires_at DATETIME NULL,

    view_count BIGINT UNSIGNED NOT NULL DEFAULT 0,

    first_viewed_at DATETIME NULL,
    last_viewed_at DATETIME NULL,

    created_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uk_quote_public_access_token (
        access_token
    ),

    KEY idx_quote_public_access_quote (
        quote_id
    ),

    KEY idx_quote_public_access_quote_active (
        quote_id,
        active
    ),

    CONSTRAINT fk_quote_public_access_quote
        FOREIGN KEY (quote_id)
        REFERENCES quotes (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

### 여기서는 `quote_id`에 UNIQUE를 두면 안 됩니다.

링크 재발급 시:

```text
Quote 1
 ├ old token active=0
 └ new token active=1
```

처럼 하나의 견적에 과거 토큰 여러 개가 존재할 수 있기 때문입니다.

대신:

```sql
UNIQUE(access_token)
```

만 둡니다.

문서도 공개 URL은 `/q/{randomToken}`이고 DB PK를 공개하지 않는다고 정의합니다. fileciteturn2file0L202-L221

---

# 14. `sales_records`

기존 DB 문서의 `platform_id`는 최종 정책에 따라 **`payment_platform_id`**로 변경합니다.

```sql
CREATE TABLE sales_records (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    quote_id BIGINT UNSIGNED NOT NULL,
    payment_platform_id BIGINT UNSIGNED NULL,

    sales_type VARCHAR(20) NOT NULL,

    description VARCHAR(255) NULL,

    sales_date DATE NOT NULL,
    settlement_date DATE NULL,

    supply_amount DECIMAL(15, 0) NOT NULL DEFAULT 0,
    sales_vat_amount DECIMAL(15, 0) NOT NULL DEFAULT 0,
    total_sales_amount DECIMAL(15, 0) NOT NULL,

    actual_settlement_amount DECIMAL(15, 0) NULL,
    actual_deduction_amount DECIMAL(15, 0) NULL,

    service_fee_amount DECIMAL(15, 0) NULL,
    payment_fee_amount DECIMAL(15, 0) NULL,
    fee_vat_amount DECIMAL(15, 0) NULL,
    withholding_tax_amount DECIMAL(15, 0) NULL,
    other_deduction_amount DECIMAL(15, 0) NULL,
    settlement_vat_amount DECIMAL(15, 0) NULL,

    settlement_status VARCHAR(20) NOT NULL DEFAULT 'EXPECTED',

    memo TEXT NULL,

    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    KEY idx_sales_records_quote (
        quote_id
    ),

    KEY idx_sales_records_payment_platform (
        payment_platform_id
    ),

    KEY idx_sales_records_sales_date (
        sales_date
    ),

    KEY idx_sales_records_status (
        settlement_status
    ),

    KEY idx_sales_records_sales_date_status (
        sales_date,
        settlement_status
    ),

    KEY idx_sales_records_quote_sales_date (
        quote_id,
        sales_date
    ),

    CONSTRAINT fk_sales_records_quote
        FOREIGN KEY (quote_id)
        REFERENCES quotes (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CONSTRAINT fk_sales_records_payment_platform
        FOREIGN KEY (payment_platform_id)
        REFERENCES platforms (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

견적 하나에 계약금·중도금·잔금이 여러 번 발생할 수 있으므로:

```text
quotes 1:N sales_records
```

입니다. fileciteturn2file0L222-L257

상세 정산 항목인 서비스 수수료, 결제 수수료, 수수료 VAT, 원천징수, 기타 차감 등은 **전부 NULL 허용**이 맞습니다. 실제 입금액만 아는 경우에도 저장할 수 있어야 하기 때문입니다. fileciteturn2file0L273-L289

---

# 3. FK 삭제 정책

여기서 전체적으로 의도적으로:

```sql
ON DELETE RESTRICT
```

를 사용했습니다.

이게 KRIM Quote에는 가장 맞습니다.

예를 들어:

```text
Customer
  ↓
Quote
  ↓
Sales
```

가 존재하는데 고객을 삭제하면서 과거 견적이나 매출이 같이 삭제되면 안 됩니다.

따라서:

```text
customers          → active
standard_rates     → active
platforms          → ac

