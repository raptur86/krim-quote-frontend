import { useParams } from "react-router-dom";

import { usePublicQuote } from "../../features/quote/hooks/usePublicQuote";

import "./PublicQuotePage.css";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function PublicQuotePage() {
  const { token } = useParams<{
    token: string;
  }>();

  const quoteQuery = usePublicQuote(token);

  if (!token) {
    return (
      <main className="public-quote-state-page">
        <div className="public-quote-state-card">
          <h1>잘못된 견적 링크입니다.</h1>

          <p>
            전달받은 견적 링크를 다시 확인해주세요.
          </p>
        </div>
      </main>
    );
  }

  if (quoteQuery.isLoading) {
    return (
      <main className="public-quote-state-page">
        <div className="public-quote-state-card">
          견적을 불러오고 있습니다.
        </div>
      </main>
    );
  }

  if (quoteQuery.isError || !quoteQuery.data) {
    return (
      <main className="public-quote-state-page">
        <div className="public-quote-state-card">
          <h1>견적을 확인할 수 없습니다.</h1>

          <p>
            견적 링크가 만료되었거나
            사용할 수 없는 링크입니다.
          </p>
        </div>
      </main>
    );
  }

  const quote = quoteQuery.data;

const handlePdfDownload = () => {
  if (!token) {
    return;
  }

  const pdfUrl =
    `/api/v1/public/quotes/${encodeURIComponent(token)}/pdf`;

  window.location.href = pdfUrl;
};

  return (
    <main className="public-quote-page">

      <div className="public-quote-actions">
        <button
          type="button"
          className="public-quote-print-button"
          onClick={handlePdfDownload}
        >
          PDF 다운로드
        </button>
      </div>

      <div className="public-quote-document">

        <header className="public-quote-header">
          <div className="public-quote-brand">
            {quote.business.logoUrl && (
              <img
                src={quote.business.logoUrl}
                alt=""
                className="public-quote-logo"
              />
            )}

            <div>
              <strong>
                {quote.business.brandName ||
                  quote.business.businessName}
              </strong>

              {quote.business.brandName &&
                quote.business.businessName && (
                  <span>
                    {quote.business.businessName}
                  </span>
                )}
            </div>
          </div>

          <div className="public-quote-title">
            <span>QUOTATION</span>
            <h1>견적서</h1>
          </div>
        </header>


        <section className="public-quote-summary">
          <div>
            <span>견적번호</span>
            <strong>{quote.quoteNumber}</strong>
          </div>

          <div>
            <span>작성일</span>
            <strong>
              {formatDate(quote.writtenDate)}
            </strong>
          </div>

          <div>
            <span>유효기간</span>
            <strong>
              {formatDate(quote.validUntil)}
            </strong>
          </div>

          <div>
            <span>예상기간</span>
            <strong>
              {quote.expectedDuration || "-"}
            </strong>
          </div>
        </section>


        <section className="public-quote-project">
          <span className="public-quote-label">
            PROJECT
          </span>

          <h2>{quote.title}</h2>
        </section>


        <section className="public-quote-parties">
          <div>
            <h3>고객 정보</h3>

            <dl>
              <div>
                <dt>고객명</dt>
                <dd>
                  {quote.customer.customerName}
                </dd>
              </div>

              {quote.customer.companyName && (
                <div>
                  <dt>회사명</dt>
                  <dd>
                    {quote.customer.companyName}
                  </dd>
                </div>
              )}

              {quote.customer.contactName && (
                <div>
                  <dt>담당자</dt>
                  <dd>
                    {quote.customer.contactName}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h3>공급자 정보</h3>

            <dl>
              <div>
                <dt>상호</dt>
                <dd>
                  {quote.business.businessName}
                </dd>
              </div>

              {quote.business.representativeName && (
                <div>
                  <dt>대표자</dt>
                  <dd>
                    {quote.business.representativeName}
                  </dd>
                </div>
              )}

              {quote.business.businessNumber && (
                <div>
                  <dt>사업자번호</dt>
                  <dd>
                    {quote.business.businessNumber}
                  </dd>
                </div>
              )}

              {quote.business.phone && (
                <div>
                  <dt>연락처</dt>
                  <dd>
                    {quote.business.phone}
                  </dd>
                </div>
              )}

              {quote.business.email && (
                <div>
                  <dt>이메일</dt>
                  <dd>
                    {quote.business.email}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </section>


        <section className="public-quote-items">
          <h3>견적 내역</h3>

          <div className="public-quote-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>구분</th>
                  <th>기능</th>
                  <th>내용</th>
                  <th>수량</th>
                  <th>금액</th>
                </tr>
              </thead>

              <tbody>
                {quote.items.map((item, index) => (
                  <tr
                    key={`${item.featureName}-${index}`}
                  >
                    <td>
                      {item.categoryName || "-"}
                    </td>

                    <td>
                      <strong>
                        {item.featureName}
                      </strong>
                    </td>

                    <td>
                      {item.description || "-"}
                    </td>

                    <td>
                      {item.quantity}
                      {item.unitName}
                    </td>

                    <td className="public-quote-money">
                      {formatMoney(item.amount)}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>


        <section className="public-quote-total-section">
          <div className="public-quote-total-box">
            <div>
              <span>공급가액</span>

              <strong>
                {formatMoney(
                  quote.supplyAmount,
                )}
                원
              </strong>
            </div>

            <div>
              <span>
                부가세 ({quote.vatRate}%)
              </span>

              <strong>
                {formatMoney(
                  quote.vatAmount,
                )}
                원
              </strong>
            </div>

            <div className="public-quote-grand-total">
              <span>총 견적금액</span>

              <strong>
                {formatMoney(
                  quote.totalAmount,
                )}
                원
              </strong>
            </div>

            <p>VAT 포함 금액입니다.</p>
          </div>
        </section>


        {quote.customerNote && (
          <section className="public-quote-note">
            <h3>안내사항</h3>

            <p>{quote.customerNote}</p>
          </section>
        )}


        <footer className="public-quote-footer">
          <div>
            <strong>
              {quote.business.brandName ||
                quote.business.businessName}
            </strong>

            {quote.business.address && (
              <span>
                {quote.business.address}
              </span>
            )}

            {quote.business.website && (
              <span>
                {quote.business.website}
              </span>
            )}
          </div>

          <p>
            본 견적서는 명시된 유효기간까지
            유효합니다.
          </p>
        </footer>

      </div>
    </main>
  );
}