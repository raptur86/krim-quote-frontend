import type {
  QuoteDraftItem,
} from "../types/quote.types";

import {
  calculateQuoteItemAmount,
} from "../utils/quoteCalculation";

import "./QuoteItemTable.css";


type Props = {
  items: QuoteDraftItem[];

  onEdit: (
    item: QuoteDraftItem,
  ) => void;

  onDelete: (
    clientId: string,
  ) => void;

  onMoveUp: (
    index: number,
  ) => void;

  onMoveDown: (
    index: number,
  ) => void;
};


export function QuoteItemTable({
  items,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Props) {
  if (
    items.length === 0
  ) {
    return (
      <div className="quote-item-empty">
        아직 추가된 견적항목이
        없습니다.
      </div>
    );
  }


  return (
    <div className="quote-item-table-wrapper">

      <table className="quote-item-table">

        <thead>
          <tr>
            <th>순서</th>
            <th>구분</th>
            <th>기능</th>
            <th>단가</th>
            <th>수량</th>
            <th>난이도</th>
            <th>조정</th>
            <th>금액</th>
            <th>관리</th>
          </tr>
        </thead>


        <tbody>

          {items.map(
            (item, index) => {
              const amount =
                calculateQuoteItemAmount(
                  item,
                );

              return (
                <tr key={item.clientId}>

                  <td>
                    <div className="quote-item-order">

                      <button
                        type="button"
                        disabled={
                          index === 0
                        }
                        onClick={() =>
                          onMoveUp(
                            index,
                          )
                        }
                        aria-label="위로 이동"
                      >
                        ↑
                      </button>

                      <span>
                        {index + 1}
                      </span>

                      <button
                        type="button"
                        disabled={
                          index ===
                          items.length - 1
                        }
                        onClick={() =>
                          onMoveDown(
                            index,
                          )
                        }
                        aria-label="아래로 이동"
                      >
                        ↓
                      </button>

                    </div>
                  </td>


                  <td>
                    {item.standardRateId
                      ? "표준"
                      : "직접"}
                  </td>


                  <td>
                    <strong>
                      {item.featureName}
                    </strong>

                    {item.categoryName && (
                      <div className="quote-item-category">
                        {
                          item.categoryName
                        }
                      </div>
                    )}
                  </td>


                  <td>
                    {formatMoney(
                      item.quoteUnitPrice,
                    )}
                  </td>


                  <td>
                    {item.quantity}
                    {" "}
                    {item.unitName}
                  </td>


                  <td>
                    {
                      item.difficultyRate
                    }
                  </td>


                  <td>
                    {formatSignedMoney(
                      item.adjustmentAmount,
                    )}
                  </td>


                  <td className="quote-item-total">
                    {formatMoney(
                      amount,
                    )}
                  </td>


                  <td>
                    <div className="quote-item-actions">

                      <button
                        type="button"
                        onClick={() =>
                          onEdit(item)
                        }
                      >
                        수정
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onDelete(
                            item.clientId,
                          )
                        }
                      >
                        삭제
                      </button>

                    </div>
                  </td>

                </tr>
              );
            },
          )}

        </tbody>

      </table>

    </div>
  );
}


function formatMoney(
  value: number,
): string {
  return `${Math.round(
    value,
  ).toLocaleString("ko-KR")}원`;
}


function formatSignedMoney(
  value: number,
): string {
  if (value === 0) {
    return "0원";
  }

  const sign =
    value > 0
      ? "+"
      : "-";

  return `${sign}${Math.abs(
    value,
  ).toLocaleString("ko-KR")}원`;
}