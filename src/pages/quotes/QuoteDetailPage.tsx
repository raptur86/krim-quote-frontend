
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Copy,
  ExternalLink,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Pencil,
  ReceiptText,
  Send,
  Wallet,
} from "lucide-react";

import { ROUTES } from "../../app/router/routes";
import { useQuote } from "../../features/quote/hooks/useQuote";

import { useCopyQuote } from "../../features/quote/hooks/useCopyQuote";

import { useIssueQuote } from "../../features/quote/hooks/useIssueQuote";
import { Button } from "../../components/ui/Button";
import { QuoteSalesSection } from "./QuoteSalesSection";

import "./QuoteDetailPage.css";

export function QuoteDetailPage() {
  const navigate = useNavigate();
  const { quoteId } = useParams<{ quoteId: string }>();

  const id = Number(quoteId);
  const quoteQuery = useQuote(id);
  const issueQuote = useIssueQuote();

  const copyQuote = useCopyQuote();

  const [quoteCopyError, setQuoteCopyError] =
    useState<string | null>(null);

  const [issueError, setIssueError] =
    useState<string | null>(null);

  const [copyMessage, setCopyMessage] =
    useState<string | null>(null);

  async function handleIssue() {
    const quote = quoteQuery.data;

    if (!quote || quote.status !== "DRAFT") {
      return;
    }

    const confirmed = window.confirm(
      "이 견적을 발행하시겠습니까?\n\n발행 후에는 견적 내용을 수정할 수 없습니다."
    );

    if (!confirmed) {
      return;
    }

    setIssueError(null);

    try {
      const result = await issueQuote.mutateAsync(quote.id);

      await quoteQuery.refetch();

      window.alert(
        `견적이 발행되었습니다.\n\n견적번호: ${result.quoteNumber}`
      );
    } catch (error) {
      setIssueError(
        error instanceof Error
          ? error.message
          : "견적 발행에 실패했습니다."
      );
    }
  }

  async function handleCopyQuote() {
    const quote = quoteQuery.data;

    if (!quote || quote.status !== "ISSUED") {
      return;
    }

    if (copyQuote.isPending) {
      return;
    }

    const confirmed = window.confirm(
      "발행된 견적을 복사하시겠습니까?\n\n" +
      "기존 견적은 유지되고 새로운 임시 견적이 생성됩니다.\n" +
      "복사 후 새 견적 수정 화면으로 이동합니다."
    );

    if (!confirmed) {
      return;
    }

    setQuoteCopyError(null);

    try {
      const result = await copyQuote.mutateAsync(quote.id);

      if (
        !Number.isSafeInteger(result.id) ||
        result.id <= 0
      ) {
        throw new Error(
          "복사된 견적의 ID가 올바르지 않습니다."
        );
      }
      if (result.status !== "DRAFT") {
        throw new Error("복사된 견적이 작성 중 상태가 아닙니다.");
      }
      navigate(
        `${ROUTES.quotes}/${result.id}/edit`
      );
    } catch (error) {
      setQuoteCopyError(
        error instanceof Error
          ? error.message
          : "견적 복사에 실패했습니다."
      );
    }
  }

  function handleOpenPublicQuote() {
    const publicUrl = quoteQuery.data?.publicUrl;

    if (!publicUrl) {
      return;
    }

    window.open(
      publicUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function handleCopyPublicQuote() {
    const publicUrl = quoteQuery.data?.publicUrl;

    if (!publicUrl) {
      setCopyMessage("고객용 견적 링크가 없습니다.");
      return;
    }

    try {
      const absoluteUrl = new URL(
        publicUrl,
        window.location.origin
      ).toString();

      await navigator.clipboard.writeText(absoluteUrl);
      setCopyMessage("고객용 견적 링크를 복사했습니다.");
    } catch {
      setCopyMessage("링크 복사에 실패했습니다.");
    }
  }

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <main className="quote-detail-page">
        <div className="quote-detail-feedback">
          <AlertCircle size={28} aria-hidden="true" />
          <h2>잘못된 견적 번호입니다.</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.quotes)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            견적 목록으로
          </Button>
        </div>
      </main>
    );
  }

  if (quoteQuery.isLoading) {
    return (
      <main className="quote-detail-page">
        <div
          className="quote-detail-feedback"
          role="status"
        >
          <LoaderCircle
            size={28}
            className="quote-detail-spin"
            aria-hidden="true"
          />
          <h2>견적 정보를 불러오는 중</h2>
          <p>잠시만 기다려 주세요.</p>
        </div>
      </main>
    );
  }

  if (quoteQuery.isError || !quoteQuery.data) {
    return (
      <main className="quote-detail-page">
        <div
          className="quote-detail-feedback quote-detail-feedback-error"
          role="alert"
        >
          <AlertCircle size={28} aria-hidden="true" />
          <h2>견적 정보를 불러오지 못했습니다.</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.quotes)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            견적 목록으로
          </Button>
        </div>
      </main>
    );
  }

  const quote = quoteQuery.data;
  const isDraft = quote.status === "DRAFT";
  const isIssued = quote.status === "ISSUED";

  return (
    <main className="quote-detail-page">
      <header className="quote-detail-header">
        <div className="quote-detail-header-info">
          <div className="quote-detail-header-meta">
            <span className="quote-detail-number">
              {quote.quoteNumber || "견적번호 미발행"}
            </span>

            <span
              className={[
                "quote-detail-status",
                isDraft
                  ? "draft"
                  : isIssued
                    ? "issued"
                    : "other",
              ].join(" ")}
            >
              {isDraft
                ? "작성 중"
                : isIssued
                  ? "발행 완료"
                  : quote.status}
            </span>
          </div>

          <h1>{quote.title}</h1>

          <p className="quote-detail-subtitle">
            견적 기본정보, 세부내역 및 금액을 확인한다.
          </p>
        </div>

        <div className="quote-detail-header-actions">
          {isDraft && (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={issueQuote.isPending}
                onClick={() =>
                  navigate(
                    `${ROUTES.quotes}/${quote.id}/edit`
                  )
                }
              >
                <Pencil size={16} aria-hidden="true" />
                수정
              </Button>

              <Button
                type="button"
                variant="primary"
                disabled={issueQuote.isPending}
                onClick={handleIssue}
              >
                {issueQuote.isPending ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="quote-detail-spin"
                      aria-hidden="true"
                    />
                    발행 중...
                  </>
                ) : (
                  <>
                    <Send size={16} aria-hidden="true" />
                    견적 발행
                  </>
                )}
              </Button>
            </>
          )}

          {isIssued && (
            <Button
              type="button"
              variant="primary"
              disabled={copyQuote.isPending}
              onClick={handleCopyQuote}
            >
              {copyQuote.isPending ? (
                <>
                  <LoaderCircle
                    size={16}
                    className="quote-detail-spin"
                    aria-hidden="true"
                  />
                  복사 중...
                </>
              ) : (
                <>
                  <Copy size={16} aria-hidden="true" />
                  견적 복사 후 수정
                </>
              )}
            </Button>
          )}

          {isIssued && quote.publicUrl && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenPublicQuote}
              >
                <ExternalLink
                  size={16}
                  aria-hidden="true"
                />
                고객용 견적 보기
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCopyPublicQuote}
              >
                <Copy size={16} aria-hidden="true" />
                링크 복사
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="outline"
            disabled={issueQuote.isPending}
            onClick={() => navigate(ROUTES.quotes)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            목록
          </Button>
        </div>
      </header>

      {issueError && (
        <div className="quote-detail-alert error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{issueError}</span>
        </div>
      )}

      {quoteCopyError && (
        <div
          className="quote-detail-alert error"
          role="alert"
        >
          <AlertCircle size={18} aria-hidden="true" />
          <span>{quoteCopyError}</span>
          <button
            type="button"
            aria-label="오류 알림 닫기"
            onClick={() => setQuoteCopyError(null)}
          >
            ×
          </button>
        </div>
      )}

      {copyMessage && (
        <div
          className="quote-detail-alert"
          role="status"
        >
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{copyMessage}</span>
          <button
            type="button"
            aria-label="알림 닫기"
            onClick={() => setCopyMessage(null)}
          >
            ×
          </button>
        </div>
      )}

      <section className="quote-detail-section">
        <div className="quote-detail-section-heading">
          <span className="quote-detail-section-icon">
            <ClipboardList size={19} aria-hidden="true" />
          </span>
          <div>
            <h2>기본정보</h2>
            <p>견적과 고객의 기본 정보를 확인한다.</p>
          </div>
        </div>

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
            <dd>{quote.inquiryPlatform?.name ?? "-"}</dd>
          </div>

          <div>
            <dt>작성일</dt>
            <dd>{quote.writtenDate}</dd>
          </div>

          <div>
            <dt>유효기간</dt>
            <dd>{quote.validUntil ?? "-"}</dd>
          </div>

          <div>
            <dt>예상 기간</dt>
            <dd>{quote.expectedDuration ?? "-"}</dd>
          </div>
        </dl>
      </section>

      <section className="quote-detail-section">
        <div className="quote-detail-section-heading">
          <span className="quote-detail-section-icon">
            <FileText size={19} aria-hidden="true" />
          </span>
          <div>
            <h2>견적항목</h2>
            <p>기능별 단가와 산정된 금액을 확인한다.</p>
          </div>

          <span className="quote-detail-count">
            {quote.items.length}개 항목
          </span>
        </div>

        <div className="quote-detail-table-wrap">
          <table className="quote-detail-table">
            <thead>
              <tr>
                <th scope="col">카테고리</th>
                <th scope="col">기능명</th>
                <th scope="col" className="align-right">
                  단가
                </th>
                <th scope="col" className="align-right">
                  수량
                </th>
                <th scope="col" className="align-center">
                  난이도
                </th>
                <th scope="col" className="align-right">
                  조정금액
                </th>
                <th scope="col" className="align-right">
                  항목금액
                </th>
              </tr>
            </thead>

            <tbody>
              {quote.items.map((item) => (
                <tr key={item.id}>
                  <td className="quote-detail-category">
                    {item.categoryName ?? "-"}
                  </td>

                  <td>
                    <strong className="quote-detail-feature">
                      {item.featureName}
                    </strong>
                  </td>

                  <td className="align-right quote-detail-numeric">
                    {formatMoney(item.quoteUnitPrice)}
                  </td>

                  <td className="align-right quote-detail-numeric">
                    {item.quantity} {item.unitName}
                  </td>

                  <td className="align-center">
                    <span className="quote-detail-difficulty">
                      ×{item.difficultyRate}
                    </span>
                  </td>

                  <td
                    className={[
                      "align-right",
                      "quote-detail-numeric",
                      item.adjustmentAmount < 0
                        ? "quote-detail-negative"
                        : item.adjustmentAmount > 0
                          ? "quote-detail-positive"
                          : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {formatSignedMoney(
                      item.adjustmentAmount
                    )}
                  </td>

                  <td className="align-right quote-detail-item-total">
                    {formatMoney(item.finalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="quote-detail-section">
        <div className="quote-detail-section-heading">
          <span className="quote-detail-section-icon">
            <Wallet size={19} aria-hidden="true" />
          </span>
          <div>
            <h2>견적 금액</h2>
            <p>최종 견적금액에는 VAT가 포함되어 있다.</p>
          </div>
        </div>

        <div className="quote-detail-summary-layout">
          <div className="quote-detail-summary-info">
            <ReceiptText size={25} aria-hidden="true" />
            <h3>견적금액 산정 내역</h3>
            <p>
              항목별 금액과 전체 조정금액을 반영한
              결과이다. 공급가액과 VAT는 최종
              견적금액을 기준으로 구분한다.
            </p>

            <div className="quote-detail-summary-note">
              <CheckCircle2
                size={16}
                aria-hidden="true"
              />
              VAT 10% 포함 금액 기준
            </div>
          </div>

          <dl className="quote-detail-summary">
            <div>
              <dt>항목 합계</dt>
              <dd>{formatMoney(quote.itemsAmount)}</dd>
            </div>

            <div>
              <dt>전체 조정</dt>
              <dd
                className={
                  quote.adjustmentAmount < 0
                    ? "quote-detail-negative"
                    : quote.adjustmentAmount > 0
                      ? "quote-detail-positive"
                      : ""
                }
              >
                {formatSignedMoney(
                  quote.adjustmentAmount
                )}
              </dd>
            </div>

            <div className="quote-detail-summary-divider">
              <dt>공급가액</dt>
              <dd>{formatMoney(quote.supplyAmount)}</dd>
            </div>

            <div>
              <dt>부가세 (10%)</dt>
              <dd>{formatMoney(quote.vatAmount)}</dd>
            </div>

            <div className="quote-detail-total">
              <dt>
                총 견적금액
                <small>VAT 포함</small>
              </dt>
              <dd>{formatMoney(quote.totalAmount)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="quote-detail-sales-section">
        <QuoteSalesSection
          quoteId={quote.id}
          canCreate={quote.status === "ISSUED"}
        />
      </div>

      {quote.customerNote && (
        <section className="quote-detail-section">
          <div className="quote-detail-section-heading">
            <span className="quote-detail-section-icon">
              <FileText size={19} aria-hidden="true" />
            </span>
            <div>
              <h2>고객 전달 메모</h2>
              <p>고객에게 전달할 견적 관련 내용이다.</p>
            </div>
          </div>

          <p className="quote-detail-memo">
            {quote.customerNote}
          </p>
        </section>
      )}

      {quote.internalMemo && (
        <section className="quote-detail-section">
          <div className="quote-detail-section-heading">
            <span className="quote-detail-section-icon">
              <LockKeyhole size={19} aria-hidden="true" />
            </span>
            <div>
              <h2>내부 메모</h2>
              <p>관리자 내부 확인용 정보이다.</p>
            </div>
          </div>

          <p className="quote-detail-memo">
            {quote.internalMemo}
          </p>
        </section>
      )}

      <div className="quote-detail-bottom">
        <CalendarDays size={15} aria-hidden="true" />
        견적 상태와 금액은 서버에 저장된 정보를 기준으로 표시한다.
      </div>
    </main>
  );
}

function formatMoney(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatSignedMoney(value: number): string {
  if (value === 0) {
    return "0원";
  }

  const sign = value > 0 ? "+" : "";

  return `${sign}${value.toLocaleString("ko-KR")}원`;
}
