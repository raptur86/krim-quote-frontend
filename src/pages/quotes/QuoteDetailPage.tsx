import { useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "../../app/router/routes";
import { useQuote } from "../../features/quote/hooks/useQuote"; 

import "./QuoteDetailPage.css";

export function QuoteDetailPage() {
  const navigate = useNavigate();

  const { quoteId } = useParams<{
    quoteId: string;
  }>();

  const id = Number(quoteId);

  const quoteQuery = useQuote(id);

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <main className="quote-detail-page">
        <div className="quote-detail-error">
          잘못된 견적 번호입니다.
        </div>
      </main>
    );
  }

  if (quoteQuery.isLoading) {
    return (
      <main className="quote-detail-page">
        <div className="quote-detail-state">
          견적 정보를 불러오고 있습니다.
        </div>
      </main>
    );
  }

  if (quoteQuery.isError || !quoteQuery.data) {
    return (
      <main className="quote-detail-page">
        <div
          className="quote-detail-error"
          role="alert"
        >
          견적 정보를 불러오지 못했습니다.
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(ROUTES.quotes)
          }
        >
          견적 목록으로
        </button>
      </main>
    );
  }

  const quote = quoteQuery.data;

  return (
    <main className="quote-detail-page">

      <header className="quote-detail-header">

        <div>
          <p className="quote-detail-number">
            {quote.quoteNumber}
          </p>

          <h1>
            {quote.title}
          </h1>

          <p>
            상태: {quote.status}
          </p>
        </div>

        <div className="quote-detail-header-actions">

          <button
            type="button"
            onClick={() =>
              navigate(ROUTES.quotes)
            }
          >
            목록
          </button>

        </div>

      </header>


      <section className="quote-detail-section">

        <h2>기본정보</h2>

        <dl className="quote-detail-info">

          <div>
            <dt>고객</dt>
            <dd>
              {quote.customer.customerName}
              {quote.customer.companyName
                ? ` / ${quote.customer.companyName}`
                : ""}
            </dd>
          </div>

          <div>
            <dt>의뢰 플랫폼</dt>
            <dd>
              {quote.inquiryPlatform?.name ??
                "-"}
            </dd>
          </div>

          <div>
            <dt>작성일</dt>
            <dd>
              {quote.writtenDate}
            </dd>
          </div>

          <div>
            <dt>유효기간</dt>
            <dd>
              {quote.validUntil ?? "-"}
            </dd>
          </div>

          <div>
            <dt>예상 기간</dt>
            <dd>
              {quote.expectedDuration ??
                "-"}
            </dd>
          </div>

        </dl>

      </section>


      <section className="quote-detail-section">

        <h2>견적항목</h2>

        <div className="quote-detail-table-wrap">

          <table className="quote-detail-table">

            <thead>
              <tr>
                <th>카테고리</th>
                <th>기능명</th>
                <th>단가</th>
                <th>수량</th>
                <th>난이도</th>
                <th>조정</th>
                <th>금액</th>
              </tr>
            </thead>

            <tbody>

              {quote.items.map(
                (item) => (
                  <tr key={item.id}>

                    <td>
                      {item.categoryName ??
                        "-"}
                    </td>

                    <td>
                      {item.featureName}
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
                      {item.difficultyRate}
                    </td>

                    <td>
                      {formatSignedMoney(
                        item.adjustmentAmount,
                      )}
                    </td>

                    <td>
                      {formatMoney(
                        item.finalAmount,
                      )}
                    </td>

                  </tr>
                ),
              )}

            </tbody>

          </table>

        </div>

      </section>


      <section className="quote-detail-section">

        <h2>금액</h2>

        <dl className="quote-detail-summary">

          <div>
            <dt>항목 합계</dt>
            <dd>
              {formatMoney(
                quote.itemsAmount,
              )}
            </dd>
          </div>

          <div>
            <dt>전체 조정</dt>
            <dd>
              {formatSignedMoney(
                quote.adjustmentAmount,
              )}
            </dd>
          </div>

          <div>
            <dt>공급가액</dt>
            <dd>
              {formatMoney(
                quote.supplyAmount,
              )}
            </dd>
          </div>

          <div>
            <dt>부가세</dt>
            <dd>
              {formatMoney(
                quote.vatAmount,
              )}
            </dd>
          </div>

          <div className="quote-detail-total">
            <dt>총 견적금액</dt>
            <dd>
              {formatMoney(
                quote.totalAmount,
              )}
            </dd>
          </div>

        </dl>

      </section>


      {quote.customerNote && (
        <section className="quote-detail-section">

          <h2>고객 전달 메모</h2>

          <p>
            {quote.customerNote}
          </p>

        </section>
      )}


      {quote.internalMemo && (
        <section className="quote-detail-section">

          <h2>내부 메모</h2>

          <p>
            {quote.internalMemo}
          </p>

        </section>
      )}

    </main>
  );
}


function formatMoney(
  value: number,
): string {
  return `${value.toLocaleString("ko-KR")}원`;
}


function formatSignedMoney(
  value: number,
): string {
  if (value === 0) {
    return "0원";
  }

  const sign =
    value > 0 ? "+" : "";

  return `${sign}${value.toLocaleString(
    "ko-KR",
  )}원`;
}