
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Info,
  LockKeyhole,
  MessageSquareText,
  UserRound,
} from "lucide-react";

import type { CustomerListItem } from "../../customer/types/customer.types";
import type { PlatformListItem } from "../../platform/types/platform.types";
import type { QuoteBasicFormValues } from "../schemas/quoteBasicSchema";

import { Button } from "../../../components/ui/Button";

import "./QuoteBasicForm.css";

type Props = {
  values: QuoteBasicFormValues;
  customers: CustomerListItem[];
  platforms: PlatformListItem[];
  disabled?: boolean;
  onChange: <K extends keyof QuoteBasicFormValues>(
    field: K,
    value: QuoteBasicFormValues[K]
  ) => void;
  onNext: () => void;
  onCancel: () => void;
};

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
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
        <div className="quote-basic-form-heading">
          <span className="quote-basic-form-heading-icon">
            <FileText size={19} aria-hidden="true" />
          </span>

          <div>
            <h2>기본정보</h2>
            <p>견적서에 표시할 기본 정보를 입력한다.</p>
          </div>
        </div>

        <span className="quote-basic-required-guide">
          <span>*</span> 필수 입력
        </span>
      </div>

      <div className="quote-basic-form-body">
        <div className="quote-basic-section-title">
          <UserRound size={17} aria-hidden="true" />
          <h3>고객 및 견적 정보</h3>
        </div>

        <div className="quote-basic-grid">
          <div className="quote-basic-field">
            <label htmlFor="quote-number">
              견적번호
            </label>

            <input
              id="quote-number"
              type="text"
              value="발행 시 자동 생성"
              disabled
            />

            <small>
              견적번호는 시스템에서 자동으로 생성한다.
            </small>
          </div>

          <div className="quote-basic-field">
            <label htmlFor="quote-customer">
              고객 <em>*</em>
            </label>

            <select
              id="quote-customer"
              value={values.customerId || ""}
              disabled={disabled}
              required
              onChange={(event) =>
                onChange(
                  "customerId",
                  Number(event.target.value)
                )
              }
            >
              <option value="">고객을 선택해주세요</option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.companyName
                    ? `${customer.companyName} / ${customer.customerName}`
                    : customer.customerName}
                </option>
              ))}
            </select>
          </div>

          <div className="quote-basic-field">
            <label htmlFor="quote-platform">
              의뢰 플랫폼
            </label>

            <select
              id="quote-platform"
              value={values.inquiryPlatformId ?? ""}
              disabled={disabled}
              onChange={(event) => {
                const value = event.target.value;

                onChange(
                  "inquiryPlatformId",
                  value ? Number(value) : null
                );
              }}
            >
              <option value="">선택 안 함</option>

              {platforms.map((platform) => (
                <option
                  key={platform.id}
                  value={platform.id}
                >
                  {platform.name}
                </option>
              ))}
            </select>
          </div>

          <div className="quote-basic-field quote-basic-field-full">
            <label htmlFor="quote-title">
              견적명 <em>*</em>
            </label>

            <input
              id="quote-title"
              type="text"
              value={values.title}
              disabled={disabled}
              required
              placeholder="예 : 쇼핑몰 관리자 시스템 개발"
              onChange={(event) =>
                onChange("title", event.target.value)
              }
            />
          </div>
        </div>

        <div className="quote-basic-divider" />

        <div className="quote-basic-section-title">
          <CalendarDays size={17} aria-hidden="true" />
          <h3>일정 정보</h3>
        </div>

        <div className="quote-basic-grid">
          <div className="quote-basic-field">
            <label htmlFor="quote-written-date">
              작성일 <em>*</em>
            </label>

            <input
              id="quote-written-date"
              type="date"
              value={values.writtenDate}
              disabled={disabled}
              required
              onChange={(event) =>
                onChange(
                  "writtenDate",
                  event.target.value
                )
              }
            />
          </div>

          <div className="quote-basic-field">
            <label htmlFor="quote-valid-until">
              유효기간
            </label>

            <input
              id="quote-valid-until"
              type="date"
              value={values.validUntil ?? ""}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  "validUntil",
                  nullableText(event.target.value)
                )
              }
            />
          </div>

          <div className="quote-basic-field quote-basic-field-full">
            <label htmlFor="quote-duration">
              예상 개발기간
            </label>

            <input
              id="quote-duration"
              type="text"
              value={values.expectedDuration ?? ""}
              disabled={disabled}
              placeholder="예 : 약 4주"
              onChange={(event) =>
                onChange(
                  "expectedDuration",
                  nullableText(event.target.value)
                )
              }
            />

            <small>
              개발기간은 자유롭게 입력할 수 있다.
            </small>
          </div>
        </div>

        <div className="quote-basic-divider" />

        <div className="quote-basic-section-title">
          <MessageSquareText
            size={17}
            aria-hidden="true"
          />
          <h3>비고 및 메모</h3>
        </div>

        <div className="quote-basic-grid">
          <div className="quote-basic-field quote-basic-field-full">
            <label htmlFor="quote-customer-note">
              고객 공개 비고
            </label>

            <textarea
              id="quote-customer-note"
              value={values.customerNote ?? ""}
              disabled={disabled}
              rows={4}
              placeholder="고객에게 전달할 안내사항이나 견적 조건을 입력한다."
              onChange={(event) =>
                onChange(
                  "customerNote",
                  nullableText(event.target.value)
                )
              }
            />

            <small>
              <Info size={13} aria-hidden="true" />
              고객에게 공개되는 내용이다.
            </small>
          </div>

          <div className="quote-basic-field quote-basic-field-full">
            <label htmlFor="quote-internal-memo">
              내부 메모
            </label>

            <textarea
              id="quote-internal-memo"
              value={values.internalMemo ?? ""}
              disabled={disabled}
              rows={4}
              placeholder="견적 검토나 내부 업무 관리에 필요한 내용을 입력한다."
              onChange={(event) =>
                onChange(
                  "internalMemo",
                  nullableText(event.target.value)
                )
              }
            />

            <small>
              <LockKeyhole
                size={13}
                aria-hidden="true"
              />
              내부 관리용으로 사용하는 내용이다.
            </small>
          </div>
        </div>
      </div>

      <footer className="quote-basic-actions">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={onCancel}
        >
          취소
        </Button>

        <Button
          type="button"
          variant="primary"
          disabled={disabled}
          onClick={onNext}
        >
          다음 단계
          <ArrowRight size={17} aria-hidden="true" />
        </Button>
      </footer>
    </section>
  );
}
