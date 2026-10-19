
import { useParams } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Info,
  LoaderCircle,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";

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

type StateProps = {
  type: "loading" | "error";
  title: string;
  description: string;
};

function PublicQuoteState({
  type,
  title,
  description,
}: StateProps) {
  return (
    <main className="public-quote-state-page">
      <section
        className="public-quote-state-card"
        role={type === "error" ? "alert" : "status"}
      >
        <span
          className={[
            "public-quote-state-icon",
            type === "error" ? "is-error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {type === "loading" ? (
            <LoaderCircle
              size={28}
              className="public-quote-spin"
              aria-hidden="true"
            />
          ) : (
            <AlertCircle size={28} aria-hidden="true" />
          )}
        </span>

        <span className="public-quote-state-brand">
          KRIM QUOTE
        </span>

        <h1>{title}</h1>
        <p>{description}</p>
      </section>
    </main>
  );
}

export function PublicQuotePage() {
  const { token } = useParams<{ token: string }>();

  const quoteQuery = usePublicQuote(token);

  if (!token) {
    return (
      <PublicQuoteState
        type="error"
        title="잘못된 견적 링크입니다."
        description="전달받은 견적 링크를 다시 확인해주세요."
      />
    );
  }

  if (quoteQuery.isLoading) {
    return (
      <PublicQuoteState
        type="loading"
        title="견적서를 불러오는 중"
        description="견적 정보를 확인하고 있습니다. 잠시만 기다려주세요."
      />
    );
  }

  if (quoteQuery.isError || !quoteQuery.data) {
    return (
      <PublicQuoteState
        type="error"
        title="견적서를 확인할 수 없습니다."
        description="견적 링크가 만료되었거나 사용할 수 없는 링크입니다."
      />
    );
  }

  const quote = quoteQuery.data;

  const businessName =
    quote.business.brandName ||
    quote.business.businessName;

  function handlePdfDownload() {
    if (!token) {
      return;
    }

    const pdfUrl =
      `/api/v1/public/quotes/${encodeURIComponent(token)}/pdf`;

    window.location.href = pdfUrl;
  }

  return (
    <main className="public-quote-page">
      <div className="public-quote-container">
        <div className="public-quote-actions">
          <div className="public-quote-actions-label">
            <span className="public-quote-actions-icon">
              <FileText size={18} aria-hidden="true" />
            </span>

            <div>
              <strong>견적서 확인</strong>
              <span>고객용 견적서</span>
            </div>
          </div>

          <button
            type="button"
            className="public-quote-print-button"
            onClick={handlePdfDownload}
          >
            <Download size={17} aria-hidden="true" />
            PDF 다운로드
          </button>
        </div>

        <article className="public-quote-document">
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
                <strong>{businessName}</strong>

                {quote.business.brandName &&
                  quote.business.businessName && (
                    <span>
                      {quote.business.businessName}
                    </span>
                  )}
              </div>
            </div>

            <div className="public-quote-title">
              <span>PROJECT QUOTATION</span>
              <h1>견 적 서</h1>
              <small>QUOTATION</small>
            </div>
          </header>

          <section
            className="public-quote-summary"
            aria-label="견적서 주요 정보"
          >
            <div>
              <span>
                <FileText size={14} aria-hidden="true" />
                견적번호
              </span>
              <strong>{quote.quoteNumber}</strong>
            </div>

            <div>
              <span>
                <CalendarDays
                  size={14}
                  aria-hidden="true"
                />
                작성일
              </span>
              <strong>
                {formatDate(quote.writtenDate)}
              </strong>
            </div>

            <div>
              <span>
                <CalendarDays
                  size={14}
                  aria-hidden="true"
                />
                유효기간
              </span>
              <strong>
                {formatDate(quote.validUntil)}
              </strong>
            </div>

            <div>
              <span>
                <Clock3 size={14} aria-hidden="true" />
                예상기간
              </span>
              <strong>
                {quote.expectedDuration || "-"}
              </strong>
            </div>
          </section>

          <section className="public-quote-project">
            <span className="public-quote-label">
              PROJECT OVERVIEW
            </span>

            <h2>{quote.title}</h2>

            <p>
              아래와 같이 프로젝트 개발 견적을
              안내드립니다.
            </p>
          </section>

          <section className="public-quote-parties">
            <div className="public-quote-party-card">
              <div className="public-quote-party-heading">
                <span className="public-quote-party-icon">
                  <UserRound
                    size={18}
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <small>RECIPIENT</small>
                  <h3>고객 정보</h3>
                </div>
              </div>

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

            <div className="public-quote-party-card">
              <div className="public-quote-party-heading">
                <span className="public-quote-party-icon">
                  <Building2
                    size={18}
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <small>PROVIDER</small>
                  <h3>공급자 정보</h3>
                </div>
              </div>

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
                    <dd>{quote.business.phone}</dd>
                  </div>
                )}

                {quote.business.email && (
                  <div>
                    <dt>이메일</dt>
                    <dd>{quote.business.email}</dd>
                  </div>
                )}
              </dl>
            </div>
          </section>

          <section className="public-quote-items">
            <div className="public-quote-section-heading">
              <div>
                <span className="public-quote-section-icon">
                  <ReceiptText
                    size={18}
                    aria-hidden="true"
                  />
                </span>
                <h3>견적 세부내역</h3>
              </div>

              <span className="public-quote-item-count">
                총 {quote.items.length}개 항목
              </span>
            </div>

            <div className="public-quote-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th scope="col">구분</th>
                    <th scope="col">기능</th>
                    <th scope="col">내용</th>
                    <th
                      scope="col"
                      className="public-quote-align-center"
                    >
                      수량
                    </th>
                    <th
                      scope="col"
                      className="public-quote-money"
                    >
                      금액
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {quote.items.map((item, index) => (
                    <tr
                      key={`${item.featureName}-${index}`}
                    >
                      <td className="public-quote-category">
                        {item.categoryName || "-"}
                      </td>

                      <td className="public-quote-feature">
                        <strong>
                          {item.featureName}
                        </strong>
                      </td>

                      <td className="public-quote-description">
                        {item.description || "-"}
                      </td>

                      <td className="public-quote-align-center public-quote-quantity">
                        {item.quantity} {item.unitName}
                      </td>

                      <td className="public-quote-money public-quote-item-money">
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
              <div className="public-quote-total-heading">
                <h3>견적 금액 요약</h3>
                <span>VAT 포함</span>
              </div>

              <div className="public-quote-total-row">
                <span>공급가액</span>
                <strong>
                  {formatMoney(quote.supplyAmount)}원
                </strong>
              </div>

              <div className="public-quote-total-row">
                <span>
                  부가세 ({quote.vatRate}%)
                </span>
                <strong>
                  {formatMoney(quote.vatAmount)}원
                </strong>
              </div>

              <div className="public-quote-grand-total">
                <span>총 견적금액</span>
                <strong>
                  {formatMoney(quote.totalAmount)}원
                </strong>
              </div>

              <p className="public-quote-vat-note">
                <CheckCircle2
                  size={15}
                  aria-hidden="true"
                />
                최종 견적금액에는 부가세가 포함되어 있습니다.
              </p>
            </div>
          </section>

          {quote.customerNote && (
            <section className="public-quote-note">
              <div className="public-quote-section-heading">
                <div>
                  <span className="public-quote-section-icon">
                    <Info
                      size={18}
                      aria-hidden="true"
                    />
                  </span>
                  <h3>안내사항</h3>
                </div>
              </div>

              <p>{quote.customerNote}</p>
            </section>
          )}

          <footer className="public-quote-footer">
            <div className="public-quote-footer-business">
              <strong>{businessName}</strong>

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

            <div className="public-quote-footer-message">
              <ShieldCheck
                size={18}
                aria-hidden="true"
              />
              <p>
                본 견적서는 명시된 유효기간까지
                유효합니다.
              </p>
            </div>
          </footer>
        </article>

        <div className="public-quote-bottom">
          <ShieldCheck
            size={15}
            aria-hidden="true"
          />
          KRIM Quote · 견적서 조회
        </div>
      </div>
    </main>
  );
}
