
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Info,
  LoaderCircle,
  Package,
  ReceiptText,
  Save,
  SlidersHorizontal,
} from "lucide-react";

import type {
  CustomerListItem,
} from "../../customer/types/customer.types";

import type {
  PlatformListItem,
} from "../../platform/types/platform.types";

import type {
  QuoteBasicFormValues,
} from "../schemas/quoteBasicSchema";

import type {
  QuoteDraftItem,
} from "../types/quote.types";

import {
  calculateQuoteItemAmount,
  calculateQuoteItemsAmount,
} from "../utils/quoteCalculation";

import { Button } from "../../../components/ui/Button";

import "./QuoteReviewStep.css";

type Props = {
  basic: QuoteBasicFormValues;
  items: QuoteDraftItem[];
  customers: CustomerListItem[];
  platforms: PlatformListItem[];
  adjustmentAmount: number;
  onAdjustmentAmountChange: (value: number) => void;
  onPrevious: () => void;
  onSave: () => void;
  saving: boolean;
  saveError: string;
};

export function QuoteReviewStep({
  basic,
  items,
  customers,
  platforms,
  adjustmentAmount,
  onAdjustmentAmountChange,
  onPrevious,
  onSave,
  saving,
  saveError,
}: Props) {
  const customer = customers.find(
    (entry) => entry.id === basic.customerId
  );

  const platform =
    basic.inquiryPlatformId != null
      ? platforms.find(
          (entry) =>
            entry.id === basic.inquiryPlatformId
        )
      : null;

  const packageIds = new Set(
    items
      .filter((item) => item.itemType === "PACKAGE")
      .map((item) => item.clientId)
  );

  const hasInvalidPackageRelation = items.some(
    (item) =>
      item.itemType === "INCLUDED_FEATURE" &&
      (!item.parentPackageClientId ||
        !packageIds.has(item.parentPackageClientId))
  );

  const orderedItems = buildReviewItems(items);

  const itemsAmount = calculateQuoteItemsAmount(items);

  // KRIM Quote 정책 : 최종 견적금액은 VAT 포함이다.
  const totalAmount = Math.round(
    itemsAmount + adjustmentAmount
  );

  const supplyAmount = Math.round(totalAmount / 1.1);
  const vatAmount = totalAmount - supplyAmount;

  const packageCount = items.filter(
    (item) => item.itemType === "PACKAGE"
  ).length;

  const includedCount = items.filter(
    (item) => item.itemType === "INCLUDED_FEATURE"
  ).length;

  return (
    <section className="quote-review">
      <div className="quote-review-topbar">
        <div className="quote-review-topbar-title">
          <span className="quote-review-topbar-icon">
            <FileText size={19} aria-hidden="true" />
          </span>

          <div>
            <h3>견적서 최종 검토</h3>
            <p>
              저장하기 전에 견적 내용과 금액을
              최종 확인한다.
            </p>
          </div>
        </div>

        <span className="quote-review-draft-badge">
          <ClipboardList size={14} aria-hidden="true" />
          DRAFT
        </span>
      </div>

      {hasInvalidPackageRelation && (
        <div
          className="quote-review-save-error"
          role="alert"
        >
          <AlertCircle size={17} aria-hidden="true" />
          부모 패키지가 없는 포함 기능이 있다.
          이전 단계에서 패키지 구성을 확인해야 한다.
        </div>
      )}

      <div className="quote-review-document">
        <header className="quote-review-header">
          <div className="quote-review-document-heading">
            <strong className="quote-review-brand">
              KRIM
            </strong>
            <h2>견 적 서</h2>
            <p>PROJECT QUOTATION</p>
          </div>

          <div className="quote-review-number">
            <span>견적번호</span>
            <strong>저장 시 자동 생성</strong>
            <small>저장 전 검토용 문서</small>
          </div>
        </header>

        <section className="quote-review-basic">
          <div className="quote-review-section-heading">
            <ClipboardList
              size={17}
              aria-hidden="true"
            />
            <h3>견적 기본정보</h3>
          </div>

          <dl>
            <div>
              <dt>고객</dt>
              <dd>
                {customer
                  ? formatCustomer(customer)
                  : "-"}
              </dd>
            </div>

            <div>
              <dt>프로젝트</dt>
              <dd>{basic.title || "-"}</dd>
            </div>

            <div>
              <dt>작성일</dt>
              <dd>{basic.writtenDate || "-"}</dd>
            </div>

            <div>
              <dt>유효기간</dt>
              <dd>{basic.validUntil || "-"}</dd>
            </div>

            <div>
              <dt>개발기간</dt>
              <dd>{basic.expectedDuration || "-"}</dd>
            </div>

            <div>
              <dt>의뢰 플랫폼</dt>
              <dd>{platform?.name ?? "-"}</dd>
            </div>
          </dl>
        </section>

        <section className="quote-review-items">
          <div className="quote-review-section-heading">
            <ReceiptText
              size={17}
              aria-hidden="true"
            />
            <h3>견적 세부내역</h3>

            <span className="quote-review-items-count">
              {items.length}개 항목
              {packageCount > 0 &&
                ` · 패키지 ${packageCount}개`}
              {includedCount > 0 &&
                ` · 포함 기능 ${includedCount}개`}
            </span>
          </div>

          <div className="quote-review-table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">구분</th>
                  <th scope="col">기능</th>
                  <th
                    scope="col"
                    className="quote-review-align-right"
                  >
                    단가
                  </th>
                  <th
                    scope="col"
                    className="quote-review-align-right"
                  >
                    수량
                  </th>
                  <th
                    scope="col"
                    className="quote-review-align-center"
                  >
                    난이도
                  </th>
                  <th
                    scope="col"
                    className="quote-review-align-right"
                  >
                    금액
                  </th>
                </tr>
              </thead>

              <tbody>
                {orderedItems.map((item) => {
                  const itemType =
                    item.itemType ?? "FEATURE";

                  const isPackage =
                    itemType === "PACKAGE";

                  const isIncluded =
                    itemType === "INCLUDED_FEATURE";

                  const isAdditional =
                    itemType === "ADDITIONAL_FEATURE";

                  return (
                    <tr
                      key={item.clientId}
                      className={
                        isPackage
                          ? "quote-review-package-row"
                          : isIncluded
                            ? "quote-review-included-row"
                            : ""
                      }
                    >
                      <td className="quote-review-category">
                        {isPackage
                          ? "패키지"
                          : isIncluded
                            ? "포함 기능"
                            : isAdditional
                              ? "추가 기능"
                              : item.categoryName || "-"}
                      </td>

                      <td>
                        <div
                          className="quote-review-feature"
                          style={{
                            paddingLeft: isIncluded
                              ? 22
                              : 0,
                          }}
                        >
                          <strong>
                            {isPackage && (
                              <Package
                                size={15}
                                aria-hidden="true"
                                style={{
                                  display: "inline-block",
                                  verticalAlign: "middle",
                                  marginRight: 6,
                                }}
                              />
                            )}

                            {isIncluded && (
                              <span
                                aria-hidden="true"
                                style={{
                                  marginRight: 7,
                                  color: "#7a8b80",
                                }}
                              >
                                └
                              </span>
                            )}

                            {item.featureName}
                          </strong>

                          {item.description && (
                            <p>{item.description}</p>
                          )}

                          {isPackage &&
                            item.categoryName && (
                              <p>
                                {item.categoryName}
                              </p>
                            )}

                          {isIncluded &&
                            !packageIds.has(
                              item.parentPackageClientId ??
                                ""
                            ) && (
                              <p
                                style={{
                                  color: "#b42318",
                                }}
                              >
                                부모 패키지 연결 오류
                              </p>
                            )}

                          {isIncluded &&
                            item.packageScopeSnapshot && (
                              <p>
                                {
                                  item.packageScopeSnapshot
                                }
                              </p>
                            )}
                        </div>
                      </td>

                      <td className="quote-review-align-right quote-review-number-cell">
                        {isIncluded
                          ? "-"
                          : formatMoney(
                              item.quoteUnitPrice
                            )}
                      </td>

                      <td className="quote-review-align-right quote-review-number-cell">
                        {item.quantity}{" "}
                        {item.unitName ?? "건"}
                      </td>

                      <td className="quote-review-align-center">
                        {isIncluded ? (
                          "-"
                        ) : (
                          <span className="quote-review-difficulty">
                            ×{item.difficultyRate}
                          </span>
                        )}
                      </td>

                      <td className="quote-review-align-right quote-review-item-amount">
                        {isIncluded
                          ? "포함"
                          : formatMoney(
                              calculateQuoteItemAmount(item)
                            )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {includedCount > 0 && (
            <p
              style={{
                margin: "12px 0 0",
                fontSize: 12,
                color: "#64748b",
              }}
            >
              패키지 포함 기능은 패키지 금액에
              포함되어 별도 금액이 합산되지 않는다.
            </p>
          )}
        </section>

        <section className="quote-review-calculation">
          <div className="quote-review-adjustment">
            <div className="quote-review-section-heading">
              <SlidersHorizontal
                size={17}
                aria-hidden="true"
              />
              <h3>견적 전체 조정</h3>
            </div>

            <label htmlFor="quote-adjustment-amount">
              전체 조정금액
            </label>

            <div className="quote-review-adjustment-input">
              <input
                id="quote-adjustment-amount"
                type="number"
                step={1000}
                value={adjustmentAmount}
                disabled={saving}
                onChange={(event) =>
                  onAdjustmentAmountChange(
                    Number(event.target.value)
                  )
                }
              />
              <span>원</span>
            </div>

            <p>
              음수는 할인, 양수는 추가금액으로 반영한다.
            </p>

            <div className="quote-review-adjustment-preview">
              <span>현재 적용 조정금액</span>

              <strong
                className={
                  adjustmentAmount < 0
                    ? "quote-review-negative"
                    : adjustmentAmount > 0
                      ? "quote-review-positive"
                      : ""
                }
              >
                {formatSignedMoney(adjustmentAmount)}
              </strong>
            </div>
          </div>

          <div className="quote-review-summary">
            <div className="quote-review-summary-heading">
              <h3>견적 금액 요약</h3>
              <span>VAT 포함 기준</span>
            </div>

            <div className="quote-review-summary-row">
              <span>항목 합계</span>
              <strong>{formatMoney(itemsAmount)}</strong>
            </div>

            <div className="quote-review-summary-row">
              <span>전체 조정</span>

              <strong
                className={
                  adjustmentAmount < 0
                    ? "quote-review-negative"
                    : adjustmentAmount > 0
                      ? "quote-review-positive"
                      : ""
                }
              >
                {formatSignedMoney(adjustmentAmount)}
              </strong>
            </div>

            <div className="quote-review-summary-divider" />

            <div className="quote-review-summary-row">
              <span>공급가액</span>
              <strong>
                {formatMoney(supplyAmount)}
              </strong>
            </div>

            <div className="quote-review-summary-row">
              <span>VAT (10%)</span>
              <strong>{formatMoney(vatAmount)}</strong>
            </div>

            <div className="quote-review-total">
              <div>
                <span>총 견적금액</span>
                <small>
                  부가세 포함 최종 금액
                </small>
              </div>

              <strong>
                {formatMoney(totalAmount)}
              </strong>
            </div>

            <div className="quote-review-vat-note">
              <CheckCircle2
                size={15}
                aria-hidden="true"
              />
              최종 견적금액에는 부가세 10%가
              포함되어 있다.
            </div>
          </div>
        </section>

        {basic.customerNote && (
          <section className="quote-review-note">
            <div className="quote-review-section-heading">
              <Info
                size={17}
                aria-hidden="true"
              />
              <h3>비고</h3>
            </div>

            <p>{basic.customerNote}</p>
          </section>
        )}

        <div className="quote-review-document-bottom">
          <CalendarDays
            size={15}
            aria-hidden="true"
          />
          본 견적서는 저장 전 검토용 초안이다.
        </div>
      </div>

      <footer className="quote-review-actions">
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={onPrevious}
        >
          <ArrowLeft
            size={16}
            aria-hidden="true"
          />
          이전 단계
        </Button>

        <div className="quote-review-save">
          {saveError && (
            <p
              className="quote-review-save-error"
              role="alert"
            >
              <AlertCircle
                size={16}
                aria-hidden="true"
              />
              {saveError}
            </p>
          )}

          <Button
            type="button"
            variant="primary"
            disabled={
              saving ||
              hasInvalidPackageRelation ||
              !Number.isFinite(totalAmount) ||
              totalAmount < 0
            }
            onClick={onSave}
          >
            {saving ? (
              <>
                <LoaderCircle
                  size={16}
                  className="quote-review-saving-icon"
                  aria-hidden="true"
                />
                저장 중...
              </>
            ) : (
              <>
                <Save
                  size={16}
                  aria-hidden="true"
                />
                DRAFT 저장
              </>
            )}
          </Button>
        </div>
      </footer>
    </section>
  );
}

/**
 * 검토 화면에서는 부모 패키지 바로 아래에
 * 포함 기능을 배치한다.
 *
 * 실제 저장 요청 배열의 순서는 변경하지 않는다.
 */
function buildReviewItems(
  items: QuoteDraftItem[]
): QuoteDraftItem[] {
  const includedByParent = new Map<
    string,
    QuoteDraftItem[]
  >();

  const result: QuoteDraftItem[] = [];

  for (const item of items) {
    if (
      item.itemType === "INCLUDED_FEATURE" &&
      item.parentPackageClientId
    ) {
      const siblings =
        includedByParent.get(
          item.parentPackageClientId
        ) ?? [];

      siblings.push(item);

      includedByParent.set(
        item.parentPackageClientId,
        siblings
      );
    }
  }

  for (const item of items) {
    if (item.itemType === "INCLUDED_FEATURE") {
      continue;
    }

    result.push(item);

    if (item.itemType === "PACKAGE") {
      result.push(
        ...(includedByParent.get(item.clientId) ?? [])
      );
    }
  }

  // 연결되지 않은 포함 기능도 숨기지 않고 표시한다.
  const displayedIds = new Set(
    result.map((item) => item.clientId)
  );

  for (const item of items) {
    if (!displayedIds.has(item.clientId)) {
      result.push(item);
    }
  }

  return result;
}

function formatCustomer(
  customer: CustomerListItem
): string {
  if (customer.companyName) {
    return `${customer.companyName} / ${customer.customerName}`;
  }

  return customer.customerName;
}

function formatMoney(value: number): string {
  return `${Math.round(value).toLocaleString(
    "ko-KR"
  )}원`;
}

function formatSignedMoney(value: number): string {
  if (value === 0) {
    return "0원";
  }

  const sign = value > 0 ? "+" : "-";

  return `${sign}${Math.abs(value).toLocaleString(
    "ko-KR"
  )}원`;
}
