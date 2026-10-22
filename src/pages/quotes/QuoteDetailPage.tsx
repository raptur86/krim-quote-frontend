
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
  GitBranch,
  History,
} from "lucide-react";

import { ROUTES } from "../../app/router/routes";
import { useQuote } from "../../features/quote/hooks/useQuote";

import { useCopyQuote } from "../../features/quote/hooks/useCopyQuote";

import { useIssueQuote } from "../../features/quote/hooks/useIssueQuote";
import { Button } from "../../components/ui/Button";
import { QuoteSalesSection } from "./QuoteSalesSection";
import { useQuoteRevisions } from "../../features/quote/hooks/useQuoteRevisions";
import "./QuoteDetailPage.css";

export function QuoteDetailPage() {
  const navigate = useNavigate();
  const { quoteId } = useParams<{ quoteId: string }>();

  const id = Number(quoteId);
  const quoteQuery = useQuote(id);
  const revisionsQuery = useQuoteRevisions(id);
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
      "발행된 견적의 개정본을 생성하시겠습니까?\n\n" +
      "기존 발행 견적은 변경되지 않습니다.\n" +
      "새로운 개정 견적이 작성 중(DRAFT) 상태로 생성됩니다.\n\n" +
      "생성 후 견적 수정 화면으로 이동합니다."
    );

    if (!confirmed) {
      return;
    }

    setQuoteCopyError(null);

    try {
      const result = await copyQuote.mutateAsync({
        quoteId: quote.id,
        copyType: "REVISION",
      });

      if (
        !Number.isSafeInteger(result.quoteId) ||
        result.quoteId <= 0
      ) {
        throw new Error(
          "생성된 개정 견적의 ID가 올바르지 않습니다."
        );
      }

      navigate(
        `${ROUTES.quotes}/${result.quoteId}/edit`
      );
    } catch (error) {
      setQuoteCopyError(
        error instanceof Error
          ? error.message
          : "견적 개정본 생성에 실패했습니다."
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
                "quote-detail-revision-badge",
                quote.revisionNo > 0 ? "revised" : "original",
              ].join(" ")}
            >
              <GitBranch size={13} aria-hidden="true" />

              {quote.revisionNo > 0
                ? `${quote.revisionNo}차 개정`
                : "원본"}
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

      {/* =========================================
    v1.2 - 견적 개정 이력
========================================= */}

      <section className="quote-detail-section">
        <div className="quote-detail-section-heading">
          <span className="quote-detail-section-icon">
            <History size={19} aria-hidden="true" />
          </span>

          <div>
            <h2>견적 개정 이력</h2>
            <p>
              최초 견적부터 현재 견적까지의 개정 내역을 확인한다.
            </p>
          </div>

          {!revisionsQuery.isLoading &&
            !revisionsQuery.isError &&
            revisionsQuery.data && (
              <span className="quote-detail-count">
                총 {revisionsQuery.data.length}건
              </span>
            )}
        </div>

        {/* 현재 견적 개정 정보 */}

        <div className="quote-detail-revision-overview">
          <div>
            <span>현재 견적</span>
            <strong>{quote.quoteNumber}</strong>
          </div>

          <div>
            <span>개정 차수</span>
            <strong>
              {quote.revisionNo === 0
                ? "최초 견적"
                : `${quote.revisionNo}차 개정`}
            </strong>
          </div>

          <div>
            <span>최초 견적</span>
            {quote.originalQuoteId != null ? (
              <button
                type="button"
                className="quote-detail-revision-link"
                onClick={() =>
                  navigate(
                    `${ROUTES.quotes}/${quote.originalQuoteId}`
                  )
                }
              >
                상세 보기
                <ExternalLink size={13} aria-hidden="true" />
              </button>
            ) : (
              <strong>현재 견적이 원본</strong>
            )}
          </div>

          <div>
            <span>직전 견적</span>
            {quote.sourceQuoteId != null ? (
              <button
                type="button"
                className="quote-detail-revision-link"
                onClick={() =>
                  navigate(
                    `${ROUTES.quotes}/${quote.sourceQuoteId}`
                  )
                }
              >
                상세 보기
                <ExternalLink size={13} aria-hidden="true" />
              </button>
            ) : (
              <strong>없음</strong>
            )}
          </div>
        </div>

        {/* 개정 이력 조회 중 */}

        {revisionsQuery.isLoading && (
          <div
            className="quote-detail-revision-feedback"
            role="status"
          >
            <LoaderCircle
              size={20}
              className="quote-detail-spin"
              aria-hidden="true"
            />
            개정 이력을 불러오는 중입니다.
          </div>
        )}

        {/* 개정 이력 조회 실패 */}

        {revisionsQuery.isError && (
          <div
            className="quote-detail-revision-feedback error"
            role="alert"
          >
            <AlertCircle size={18} aria-hidden="true" />

            <span>
              {revisionsQuery.error instanceof Error
                ? revisionsQuery.error.message
                : "개정 이력을 불러오지 못했습니다."}
            </span>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void revisionsQuery.refetch();
              }}
            >
              다시 시도
            </Button>
          </div>
        )}

        {/* 개정 이력 없음 */}

        {revisionsQuery.isSuccess &&
          revisionsQuery.data.length === 0 && (
            <div className="quote-detail-revision-feedback">
              등록된 개정 이력이 없습니다.
            </div>
          )}


        {/* =========================================
    개정 이력 목록 - Compact Layout
========================================= */}

        {revisionsQuery.isSuccess &&
          revisionsQuery.data.length > 0 && (
            <div className="quote-detail-revision-list">
              {[...revisionsQuery.data]
                .sort((a, b) => a.revisionNo - b.revisionNo)
                .map((revision) => {
                  const isCurrent =
                    revision.quoteId === quote.id;

                  const revisionLabel =
                    revision.revisionNo === 0
                      ? "최초 견적"
                      : `${revision.revisionNo}차 개정`;

                  const statusLabel =
                    revision.status === "DRAFT"
                      ? "작성 중"
                      : revision.status === "ISSUED"
                        ? "발행 완료"
                        : revision.status === "EXPIRED"
                          ? "만료"
                          : revision.status === "CANCELLED"
                            ? "취소"
                            : revision.status;

                  const statusClass =
                    revision.status === "DRAFT"
                      ? "draft"
                      : revision.status === "ISSUED"
                        ? "issued"
                        : "other";

                  const content = (
                    <>
                      <span className="quote-detail-revision-step">
                        <GitBranch
                          size={15}
                          aria-hidden="true"
                        />
                      </span>

                      <strong className="quote-detail-revision-name">
                        {revisionLabel}
                      </strong>

                      <span
                        className={[
                          "quote-detail-status",
                          statusClass,
                        ].join(" ")}
                      >
                        {statusLabel}
                      </span>

                      {isCurrent && (
                        <span className="quote-detail-revision-current">
                          현재 견적
                        </span>
                      )}

                      <span
                        className="quote-detail-revision-number"
                        title={revision.quoteNumber}
                      >
                        {revision.quoteNumber}
                      </span>

                      <span className="quote-detail-revision-amount">
                        {formatMoney(revision.totalAmount)}
                      </span>

                      {!isCurrent && (
                        <span className="quote-detail-revision-open">
                          <ExternalLink
                            size={14}
                            aria-hidden="true"
                          />
                          <span>상세 보기</span>
                        </span>
                      )}
                    </>
                  );

                  if (isCurrent) {
                    return (
                      <div
                        key={revision.quoteId}
                        className="quote-detail-revision-item current"
                        aria-current="true"
                      >
                        {content}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={revision.quoteId}
                      type="button"
                      className="quote-detail-revision-item quote-detail-revision-clickable"
                      onClick={() =>
                        navigate(
                          `${ROUTES.quotes}/${revision.quoteId}`
                        )
                      }
                      aria-label={`${revisionLabel}, ${revision.quoteNumber}, ${formatMoney(revision.totalAmount)} 상세 보기`}
                    >
                      {content}
                    </button>
                  );
                })}
            </div>
          )}

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
