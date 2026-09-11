import type {
  CustomerListItem,
} from "../../customer/types/customer.types";

import type {
  PlatformListItem,
} from "../../platform/types/platform.types";

import type {
  QuoteBasicFormValues,
} from "../schemas/quoteBasicSchema";

type Props = {
  values: QuoteBasicFormValues;

  customers: CustomerListItem[];

  platforms: PlatformListItem[];

  disabled?: boolean;

  onChange:
    <K extends keyof QuoteBasicFormValues>(
      field: K,
      value: QuoteBasicFormValues[K],
    ) => void;

  onNext: () => void;

  onCancel: () => void;
};

function nullableText(
  value: string,
): string | null {
  const trimmed = value.trim();

  return trimmed === ""
    ? null
    : trimmed;
}

export function QuoteBasicForm({
  values,
  customers,
  platforms,
  disabled = false,
  onChange,
  onNext,
  onCancel,
}: Props) {
  return (
    <section className="quote-basic-form">
      <div className="quote-basic-form-header">
        <div>
          <h2>기본정보</h2>

          <p>
            견적 작성에 필요한 기본 정보를
            입력합니다.
          </p>
        </div>
      </div>

      <div className="quote-basic-grid">

        {/* 견적번호 */}

        <div className="quote-basic-field">
          <label>견적번호</label>

          <input
            type="text"
            value="발행 시 자동 생성"
            disabled
          />
        </div>

        {/* 고객 */}

        <div className="quote-basic-field">
          <label htmlFor="quote-customer">
            고객 *
          </label>

          <select
            id="quote-customer"
            value={
              values.customerId || ""
            }
            disabled={disabled}
            onChange={(event) =>
              onChange(
                "customerId",
                Number(
                  event.target.value,
                ),
              )
            }
          >
            <option value="">
              고객을 선택해주세요
            </option>

            {customers.map(
              (customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.companyName
                    ? `${customer.companyName} / ${customer.customerName}`
                    : customer.customerName}
                </option>
              ),
            )}
          </select>
        </div>

        {/* 의뢰 플랫폼 */}

        <div className="quote-basic-field">
          <label htmlFor="quote-platform">
            의뢰 플랫폼
          </label>

          <select
            id="quote-platform"
            value={
              values.inquiryPlatformId ??
              ""
            }
            disabled={disabled}
            onChange={(event) => {
              const value =
                event.target.value;

              onChange(
                "inquiryPlatformId",
                value
                  ? Number(value)
                  : null,
              );
            }}
          >
            <option value="">
              선택 안 함
            </option>

            {platforms.map(
              (platform) => (
                <option
                  key={platform.id}
                  value={platform.id}
                >
                  {platform.name}
                </option>
              ),
            )}
          </select>
        </div>

        {/* 견적명 */}

        <div className="quote-basic-field quote-basic-field-full">
          <label htmlFor="quote-title">
            견적명 *
          </label>

          <input
            id="quote-title"
            type="text"
            value={values.title}
            disabled={disabled}
            placeholder="예: 쇼핑몰 관리자 시스템 개발"
            onChange={(event) =>
              onChange(
                "title",
                event.target.value,
              )
            }
          />
        </div>

        {/* 작성일 */}

        <div className="quote-basic-field">
          <label htmlFor="quote-written-date">
            작성일 *
          </label>

          <input
            id="quote-written-date"
            type="date"
            value={values.writtenDate}
            disabled={disabled}
            onChange={(event) =>
              onChange(
                "writtenDate",
                event.target.value,
              )
            }
          />
        </div>

        {/* 유효기간 */}

        <div className="quote-basic-field">
          <label htmlFor="quote-valid-until">
            유효기간
          </label>

          <input
            id="quote-valid-until"
            type="date"
            value={
              values.validUntil ?? ""
            }
            disabled={disabled}
            onChange={(event) =>
              onChange(
                "validUntil",
                nullableText(
                  event.target.value,
                ),
              )
            }
          />
        </div>

        {/* 예상 개발기간 */}

        <div className="quote-basic-field quote-basic-field-full">
          <label htmlFor="quote-duration">
            예상 개발기간
          </label>

          <input
            id="quote-duration"
            type="text"
            value={
              values.expectedDuration ??
              ""
            }
            disabled={disabled}
            placeholder="예: 약 4주"
            onChange={(event) =>
              onChange(
                "expectedDuration",
                nullableText(
                  event.target.value,
                ),
              )
            }
          />
        </div>

        {/* 고객 공개 비고 */}

        <div className="quote-basic-field quote-basic-field-full">
          <label htmlFor="quote-customer-note">
            고객 공개 비고
          </label>

          <textarea
            id="quote-customer-note"
            value={
              values.customerNote ??
              ""
            }
            disabled={disabled}
            rows={4}
            onChange={(event) =>
              onChange(
                "customerNote",
                nullableText(
                  event.target.value,
                ),
              )
            }
          />
        </div>

        {/* 내부 메모 */}

        <div className="quote-basic-field quote-basic-field-full">
          <label htmlFor="quote-internal-memo">
            내부 메모
          </label>

          <textarea
            id="quote-internal-memo"
            value={
              values.internalMemo ??
              ""
            }
            disabled={disabled}
            rows={4}
            onChange={(event) =>
              onChange(
                "internalMemo",
                nullableText(
                  event.target.value,
                ),
              )
            }
          />
        </div>
      </div>

      <div className="quote-basic-actions">
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
        >
          취소
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={disabled}
        >
          다음 →
        </button>
      </div>
    </section>
  );
}