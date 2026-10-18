
import { useState } from "react";
import {
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Building2,
  ClipboardList,
  FilePlus2,
  LoaderCircle,
  Pencil,
  Power,
  PowerOff,
  UserRound,
} from "lucide-react";

import { useChangeCustomerActive } from "../../features/customer/hooks/useChangeCustomerActive";
import { useCustomer } from "../../features/customer/hooks/useCustomer";
import { useQuotes } from "../../features/quote/hooks/useQuotes";
import type { QuoteStatus } from "../../features/quote/types/quote.types";
import { apiErrorMessage } from "../../services/apiClient";
import { ROUTES } from "../../app/router/routes";

import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

import "./CustomerDetailPage.css";

export function CustomerDetailPage() {
  const navigate = useNavigate();
  const params = useParams();

  const customerId = Number(params.customerId);
  const invalidCustomerId =
    !Number.isInteger(customerId) || customerId <= 0;

  const customerQuery = useCustomer(
    invalidCustomerId ? 0 : customerId
  );

  const quoteQuery = useQuotes({
    customerId: invalidCustomerId
      ? undefined
      : customerId,
    page: 0,
    size: 20,
    sort: "createdAt,desc",
  });

  const [statusError, setStatusError] =
    useState<string | null>(null);

  const changeActive = useChangeCustomerActive();

  if (invalidCustomerId) {
    return <Navigate to={ROUTES.customers} replace />;
  }

  if (customerQuery.isLoading) {
    return (
      <main className="customer-detail-page">
        <div className="customer-detail-state" role="status">
          <LoaderCircle
            size={30}
            className="customer-detail-spin"
            aria-hidden="true"
          />
          <strong>고객 정보를 불러오는 중</strong>
          <p>잠시만 기다려 주세요.</p>
        </div>
      </main>
    );
  }

  if (customerQuery.isError || !customerQuery.data) {
    return (
      <main className="customer-detail-page">
        <div
          className="customer-detail-state customer-detail-error"
          role="alert"
        >
          <AlertCircle size={30} aria-hidden="true" />
          <strong>고객 정보를 불러오지 못했습니다.</strong>
          <p>
            {customerQuery.error instanceof Error
              ? customerQuery.error.message
              : "고객 정보를 확인한 후 다시 시도해 주세요."}
          </p>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.customers)}
          >
            고객 목록으로
          </Button>
        </div>
      </main>
    );
  }

  const customer = customerQuery.data;

  const quoteCreatePath =
    `${ROUTES.quoteCreate}?customerId=${customerId}`;

  async function handleChangeActive() {
    const nextActive = !customer.active;

    const message = nextActive
      ? "이 고객을 다시 사용 상태로 변경할까요?"
      : "이 고객을 미사용 상태로 변경할까요?\n기존 견적 내역은 삭제되지 않습니다.";

    if (!window.confirm(message)) {
      return;
    }

    setStatusError(null);

    try {
      await changeActive.mutateAsync({
        customerId,
        active: nextActive,
      });
    } catch (error) {
      setStatusError(apiErrorMessage(error));
    }
  }

  return (
    <main className="customer-detail-page">
      {/* Header */}
      <header className="customer-detail-header">
        <div className="customer-detail-heading">
          <button
            type="button"
            className="customer-detail-back"
            onClick={() => navigate(ROUTES.customers)}
            aria-label="고객 목록으로 이동"
          >
            <ArrowLeft size={19} aria-hidden="true" />
          </button>

          <div className="customer-detail-heading-icon">
            <UserRound size={22} aria-hidden="true" />
          </div>

          <div className="customer-detail-heading-text">
            <div className="customer-detail-title-row">
              <h1>{customer.customerName}</h1>
              <Badge
                variant={customer.active ? "success" : "neutral"}
              >
                {customer.active ? "사용" : "미사용"}
              </Badge>
            </div>
            <p>고객 기본정보와 견적 내역을 확인한다.</p>
          </div>
        </div>

        <div className="customer-detail-header-actions">
          <Button
            variant="outline"
            disabled={changeActive.isPending}
            onClick={handleChangeActive}
          >
            {customer.active ? (
              <PowerOff size={16} aria-hidden="true" />
            ) : (
              <Power size={16} aria-hidden="true" />
            )}
            {changeActive.isPending
              ? "변경 중..."
              : customer.active
                ? "미사용 처리"
                : "사용 처리"}
          </Button>

          <Button
            variant="outline"
            disabled={changeActive.isPending}
            onClick={() =>
              navigate(`${ROUTES.customers}/${customerId}/edit`)
            }
          >
            <Pencil size={16} aria-hidden="true" />
            정보 수정
          </Button>

          <Button
            variant="primary"
            disabled={!customer.active || changeActive.isPending}
            onClick={() => navigate(quoteCreatePath)}
          >
            <FilePlus2 size={17} aria-hidden="true" />
            새 견적 작성
          </Button>
        </div>
      </header>

      {statusError && (
        <div
          className="customer-detail-status-error"
          role="alert"
        >
          <AlertCircle size={18} aria-hidden="true" />
          <span>{statusError}</span>
        </div>
      )}

      {/* Customer Information */}
      <section
        className="customer-detail-card"
        aria-labelledby="customer-info-title"
      >
        <div className="customer-detail-card-header">
          <div className="customer-detail-section-title">
            <span className="customer-detail-section-icon">
              <Building2 size={19} aria-hidden="true" />
            </span>

            <div>
              <h2 id="customer-info-title">고객 기본정보</h2>
              <p>등록된 고객 및 사업자 정보</p>
            </div>
          </div>
        </div>

        <div className="customer-detail-info-grid">
          <InfoItem
            label="고객명"
            value={customer.customerName}
          />
          <InfoItem
            label="회사명"
            value={customer.companyName}
          />
          <InfoItem
            label="담당자명"
            value={customer.contactName}
          />
          <InfoItem
            label="연락처"
            value={customer.phone}
          />
          <InfoItem
            label="이메일"
            value={customer.email}
          />
          <InfoItem
            label="사업자등록번호"
            value={customer.businessNumber}
          />
          <InfoItem
            label="유입경로"
            value={customer.initialSource}
          />
          <InfoItem
            label="등록일"
            value={formatDateTime(customer.createdAt)}
          />

          <div className="customer-detail-info-full">
            <InfoItem
              label="주소"
              value={customer.address}
            />
          </div>

          <div className="customer-detail-info-full">
            <InfoItem
              label="메모"
              value={customer.memo}
              preserveWhitespace
            />
          </div>
        </div>
      </section>

      {/* Quote History */}
      <section
        className="customer-detail-card customer-detail-quotes"
        aria-labelledby="customer-quotes-title"
      >
        <div className="customer-detail-card-header">
          <div className="customer-detail-section-title">
            <span className="customer-detail-section-icon">
              <ClipboardList size={19} aria-hidden="true" />
            </span>

            <div>
              <h2 id="customer-quotes-title">견적 내역</h2>
              <p>
                {quoteQuery.data
                  ? `총 ${quoteQuery.data.totalElements.toLocaleString("ko-KR")}건 · 최근 20건까지 표시`
                  : "해당 고객의 견적 이력"}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            disabled={!customer.active || changeActive.isPending}
            onClick={() => navigate(quoteCreatePath)}
          >
            <FilePlus2 size={16} aria-hidden="true" />
            새 견적
          </Button>
        </div>

        {quoteQuery.isLoading && (
          <div
            className="customer-detail-quote-state"
            role="status"
          >
            <LoaderCircle
              size={26}
              className="customer-detail-spin"
              aria-hidden="true"
            />
            <strong>견적 내역을 불러오는 중</strong>
          </div>
        )}

        {quoteQuery.isError && (
          <div
            className="customer-detail-quote-state customer-detail-error"
            role="alert"
          >
            <AlertCircle size={26} aria-hidden="true" />
            <strong>견적 내역을 불러오지 못했습니다.</strong>
          </div>
        )}

        {!quoteQuery.isLoading &&
          !quoteQuery.isError &&
          quoteQuery.data &&
          quoteQuery.data.content.length === 0 && (
            <div className="customer-detail-quote-state">
              <ClipboardList size={30} aria-hidden="true" />
              <strong>아직 작성된 견적이 없습니다.</strong>
              <p>이 고객의 첫 견적을 작성할 수 있습니다.</p>

              <Button
                variant="primary"
                disabled={!customer.active || changeActive.isPending}
                onClick={() => navigate(quoteCreatePath)}
              >
                <FilePlus2 size={16} aria-hidden="true" />
                견적 작성
              </Button>
            </div>
          )}

        {!quoteQuery.isLoading &&
          !quoteQuery.isError &&
          quoteQuery.data &&
          quoteQuery.data.content.length > 0 && (
            <div className="customer-detail-table-wrapper">
              <table className="customer-detail-table">
                <thead>
                  <tr>
                    <th scope="col">견적번호</th>
                    <th scope="col">견적명</th>
                    <th scope="col">작성일</th>
                    <th scope="col">유효기간</th>
                    <th scope="col" className="customer-detail-money">
                      금액
                    </th>
                    <th scope="col">상태</th>
                  </tr>
                </thead>

                <tbody>
                  {quoteQuery.data.content.map((quote) => (
                    <tr key={quote.id}>
                      <td>
                        <button
                          type="button"
                          className="customer-detail-quote-link"
                          onClick={() =>
                            navigate(`${ROUTES.quotes}/${quote.id}`)
                          }
                        >
                          {quote.quoteNumber}
                        </button>
                      </td>
                      <td>{quote.title}</td>
                      <td>{formatDate(quote.writtenDate)}</td>
                      <td>
                        {quote.validUntil
                          ? formatDate(quote.validUntil)
                          : "-"}
                      </td>
                      <td className="customer-detail-money">
                        {formatMoney(quote.totalAmount)}
                      </td>
                      <td>
                        <QuoteStatusBadge status={quote.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </main>
  );
}

type InfoItemProps = {
  label: string;
  value?: string | null;
  preserveWhitespace?: boolean;
};

function InfoItem({
  label,
  value,
  preserveWhitespace = false,
}: InfoItemProps) {
  return (
    <div className="customer-detail-info-item">
      <span className="customer-detail-info-label">
        {label}
      </span>
      <span
        className={
          preserveWhitespace
            ? "customer-detail-info-value customer-detail-pre"
            : "customer-detail-info-value"
        }
      >
        {value || "-"}
      </span>
    </div>
  );
}

function QuoteStatusBadge({
  status,
}: {
  status: QuoteStatus;
}) {
  const labels: Record<QuoteStatus, string> = {
    DRAFT: "작성중",
    ISSUED: "발행",
    EXPIRED: "만료",
    CANCELLED: "취소",
  };

  const variants: Record<
    QuoteStatus,
    "warning" | "success" | "neutral" | "danger"
  > = {
    DRAFT: "warning",
    ISSUED: "success",
    EXPIRED: "neutral",
    CANCELLED: "danger",
  };

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  );
}

function formatMoney(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
