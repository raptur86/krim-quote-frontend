
import {
  ArrowDown,
  ArrowUp,
  ClipboardList,
  Pencil,
  Trash2,
} from "lucide-react";

import type { QuoteDraftItem } from "../types/quote.types";
import { calculateQuoteItemAmount } from "../utils/quoteCalculation";

import "./QuoteItemTable.css";

type Props = {
  items: QuoteDraftItem[];
  onEdit: (item: QuoteDraftItem) => void;
  onDelete: (clientId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
};

export function QuoteItemTable({
  items,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="quote-item-empty">
        <span className="quote-item-empty-icon">
          <ClipboardList
            size={28}
            aria-hidden="true"
          />
        </span>

        <strong>아직 추가된 견적항목이 없습니다.</strong>

        <p>
          표준단가에서 기능을 선택하거나
          직접 항목을 추가한다.
        </p>
      </div>
    );
  }

  return (
    <div className="quote-item-table-wrapper">
      <table className="quote-item-table">
        <thead>
          <tr>
            <th scope="col">순서</th>
            <th scope="col">구분</th>
            <th scope="col">기능정보</th>
            <th scope="col" className="quote-item-align-right">
              단가
            </th>
            <th scope="col" className="quote-item-align-right">
              수량
            </th>
            <th scope="col" className="quote-item-align-center">
              난이도
            </th>
            <th scope="col" className="quote-item-align-right">
              조정금액
            </th>
            <th scope="col" className="quote-item-align-right">
              항목금액
            </th>
            <th scope="col" className="quote-item-align-center">
              관리
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => {
            const amount = calculateQuoteItemAmount(item);

            return (
              <tr key={item.clientId}>
                <td>
                  <div className="quote-item-order">
                    <button
                      type="button"
                      className="quote-item-order-button"
                      disabled={index === 0}
                      onClick={() => onMoveUp(index)}
                      aria-label={`${item.featureName} 위로 이동`}
                      title="위로 이동"
                    >
                      <ArrowUp
                        size={14}
                        aria-hidden="true"
                      />
                    </button>

                    <span className="quote-item-order-number">
                      {index + 1}
                    </span>

                    <button
                      type="button"
                      className="quote-item-order-button"
                      disabled={index === items.length - 1}
                      onClick={() => onMoveDown(index)}
                      aria-label={`${item.featureName} 아래로 이동`}
                      title="아래로 이동"
                    >
                      <ArrowDown
                        size={14}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </td>

                <td>
                  <span
                    className={[
                      "quote-item-type",
                      item.standardRateId !== null
                        ? "standard"
                        : "direct",
                    ].join(" ")}
                  >
                    {item.standardRateId !== null
                      ? "표준"
                      : "직접"}
                  </span>
                </td>

                <td>
                  <div className="quote-item-feature">
                    <strong>{item.featureName}</strong>

                    {item.categoryName && (
                      <span className="quote-item-category">
                        {item.categoryName}
                      </span>
                    )}

                    {item.description && (
                      <p
                        className="quote-item-description"
                        title={item.description}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </td>

                <td className="quote-item-align-right quote-item-number">
                  {formatMoney(item.quoteUnitPrice)}
                </td>

                <td className="quote-item-align-right quote-item-number">
                  {item.quantity}
                  <span className="quote-item-unit">
                    {" "}{item.unitName}
                  </span>
                </td>

                <td className="quote-item-align-center">
                  <span className="quote-item-difficulty">
                    ×{item.difficultyRate}
                  </span>
                </td>

                <td
                  className={[
                    "quote-item-align-right",
                    "quote-item-number",
                    "quote-item-adjustment",
                    item.adjustmentAmount > 0
                      ? "positive"
                      : item.adjustmentAmount < 0
                        ? "negative"
                        : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {formatSignedMoney(
                    item.adjustmentAmount
                  )}
                </td>

                <td className="quote-item-align-right quote-item-total">
                  {formatMoney(amount)}
                </td>

                <td>
                  <div className="quote-item-actions">
                    <button
                      type="button"
                      className="quote-item-action-button edit"
                      onClick={() => onEdit(item)}
                      aria-label={`${item.featureName} 수정`}
                      title="수정"
                    >
                      <Pencil
                        size={15}
                        aria-hidden="true"
                      />
                    </button>

                    <button
                      type="button"
                      className="quote-item-action-button delete"
                      onClick={() =>
                        onDelete(item.clientId)
                      }
                      aria-label={`${item.featureName} 삭제`}
                      title="삭제"
                    >
                      <Trash2
                        size={15}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatMoney(value: number): string {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
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
