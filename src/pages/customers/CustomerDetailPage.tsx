import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";
import { useState } from "react";

import { useChangeCustomerActive } from "../../features/customer/hooks/useChangeCustomerActive";

import { apiErrorMessage } from "../../services/apiClient";
import { useCustomer } from "../../features/customer/hooks/useCustomer";
import { useQuotes } from "../../features/quote/hooks/useQuotes";

import type {
    QuoteStatus,
} from "../../features/quote/types/quote.types";

import "./CustomerDetailPage.css";

export function CustomerDetailPage() {
    const navigate = useNavigate();
    const params = useParams();

    const customerId = Number(params.customerId);

    const invalidCustomerId =
        !Number.isInteger(customerId) ||
        customerId <= 0;

    const customerQuery =
        useCustomer(
            invalidCustomerId
                ? 0
                : customerId,
        );

    const quoteQuery =
        useQuotes({
            customerId:
                invalidCustomerId
                    ? undefined
                    : customerId,

            page: 0,
            size: 20,
            sort: "createdAt,desc",
        });
    const [statusError, setStatusError] =
        useState<string | null>(null);

    const changeActive =
        useChangeCustomerActive();

    if (invalidCustomerId) {
        return (
            <Navigate
                to="/customers"
                replace
            />
        );
    }

    if (customerQuery.isLoading) {
        return (
            <div className="customer-detail-state">
                고객 정보를 불러오고 있습니다.
            </div>
        );
    }

    if (
        customerQuery.isError ||
        !customerQuery.data
    ) {
        return (
            <div className="customer-detail-state">
                <strong>
                    고객 정보를 불러오지 못했습니다.
                </strong>

                <button
                    type="button"
                    className="btn"
                    onClick={() =>
                        navigate("/customers")
                    }
                >
                    고객 목록으로
                </button>
            </div>
        );
    }

    const customer =
        customerQuery.data;
    async function handleChangeActive() {
        const nextActive =
            !customer.active;

        const message =
            nextActive
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
            setStatusError(
                apiErrorMessage(error),
            );
        }
    }
    return (
        <div className="customer-detail-page">

            {/* =====================================================
          Header
      ====================================================== */}

            <div className="customer-detail-header">
                <div>
                    <button
                        type="button"
                        className="customer-detail-back"
                        onClick={() =>
                            navigate("/customers")
                        }
                    >
                        ← 고객 목록
                    </button>

                    <h1>
                        {customer.customerName}
                    </h1>

                    <p>
                        고객 기본정보와 견적 내역을 확인합니다.
                    </p>
                </div>

                <div className="customer-detail-header-actions">
                    <button
                        type="button"
                        className={
                            customer.active
                                ? "btn customer-detail-deactivate"
                                : "btn customer-detail-activate"
                        }
                        disabled={
                            changeActive.isPending
                        }
                        onClick={
                            handleChangeActive
                        }
                    >
                        {changeActive.isPending
                            ? "변경 중..."
                            : customer.active
                                ? "미사용 처리"
                                : "사용 처리"}
                    </button>

                    <button
                        type="button"
                        className="btn"
                        disabled={
                            changeActive.isPending
                        }
                        onClick={() =>
                            navigate(
                                `/customers/${customerId}/edit`,
                            )
                        }
                    >
                        정보 수정
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary"
                        disabled={
                            !customer.active
                        }
                        onClick={() =>
                            navigate(
                                `/quotes/new?customerId=${customerId}`,
                            )
                        }
                    >
                        + 새 견적 작성
                    </button>
                </div>
            </div>
            {statusError && (
                <div
                    className="customer-detail-status-error"
                    role="alert"
                >
                    {statusError}
                </div>
            )}

            {/* =====================================================
          Customer Info
      ====================================================== */}

            <section className="customer-detail-card">
                <div className="customer-detail-card-header">
                    <h2>
                        고객 기본정보
                    </h2>

                    <span
                        className={
                            customer.active
                                ? "customer-detail-status customer-detail-status-active"
                                : "customer-detail-status customer-detail-status-inactive"
                        }
                    >
                        {customer.active
                            ? "사용"
                            : "미사용"}
                    </span>
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
                        value={formatDateTime(
                            customer.createdAt,
                        )}
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


            {/* =====================================================
          Customer Quotes
      ====================================================== */}

            <section className="customer-detail-card">

                <div className="customer-detail-card-header">
                    <div>
                        <h2>
                            견적 내역
                        </h2>

                        {quoteQuery.data && (
                            <span className="customer-detail-count">
                                총{" "}
                                {quoteQuery.data.totalElements.toLocaleString(
                                    "ko-KR",
                                )}
                                건
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                            navigate(
                                `/quotes/new?customerId=${customerId}`,
                            )
                        }
                    >
                        + 새 견적
                    </button>
                </div>


                {/* Quote Loading */}

                {quoteQuery.isLoading && (
                    <div className="customer-detail-quote-state">
                        견적 내역을 불러오고 있습니다.
                    </div>
                )}


                {/* Quote Error */}

                {quoteQuery.isError && (
                    <div className="customer-detail-quote-state customer-detail-error">
                        견적 내역을 불러오지 못했습니다.
                    </div>
                )}


                {/* Empty */}

                {!quoteQuery.isLoading &&
                    !quoteQuery.isError &&
                    quoteQuery.data &&
                    quoteQuery.data.content.length === 0 && (
                        <div className="customer-detail-quote-state">

                            <strong>
                                아직 작성된 견적이 없습니다.
                            </strong>

                            <p>
                                이 고객의 첫 견적을 작성할 수 있습니다.
                            </p>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() =>
                                    navigate(
                                        `/quotes/new?customerId=${customerId}`,
                                    )
                                }
                            >
                                + 견적 작성
                            </button>

                        </div>
                    )}


                {/* Quote Table */}

                {!quoteQuery.isLoading &&
                    !quoteQuery.isError &&
                    quoteQuery.data &&
                    quoteQuery.data.content.length > 0 && (
                        <div className="customer-detail-table-wrapper">

                            <table className="customer-detail-table">

                                <thead>
                                    <tr>
                                        <th>견적번호</th>
                                        <th>견적명</th>
                                        <th>작성일</th>
                                        <th>유효기간</th>
                                        <th>금액</th>
                                        <th>상태</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {quoteQuery.data.content.map(
                                        (quote) => (
                                            <tr
                                                key={quote.id}
                                                tabIndex={0}
                                                onClick={() =>
                                                    navigate(
                                                        `/quotes/${quote.id}`,
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === "Enter" ||
                                                        event.key === " "
                                                    ) {
                                                        event.preventDefault();

                                                        navigate(
                                                            `/quotes/${quote.id}`,
                                                        );
                                                    }
                                                }}
                                            >

                                                <td>
                                                    <strong>
                                                        {quote.quoteNumber}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {quote.title}
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        quote.writtenDate,
                                                    )}
                                                </td>

                                                <td>
                                                    {quote.validUntil
                                                        ? formatDate(
                                                            quote.validUntil,
                                                        )
                                                        : "-"}
                                                </td>

                                                <td className="customer-detail-money">
                                                    {formatMoney(
                                                        quote.totalAmount,
                                                    )}
                                                </td>

                                                <td>
                                                    <QuoteStatusBadge
                                                        status={
                                                            quote.status
                                                        }
                                                    />
                                                </td>

                                            </tr>
                                        ),
                                    )}
                                </tbody>

                            </table>

                        </div>
                    )}

            </section>

        </div>
    );
}


/* =========================================================
 * Info Item
 * ========================================================= */

type InfoItemProps = {
    label: string;

    value?:
    | string
    | null;

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


/* =========================================================
 * Quote Status
 * ========================================================= */

function QuoteStatusBadge({
    status,
}: {
    status: QuoteStatus;
}) {
    const labels:
        Record<QuoteStatus, string> = {
        DRAFT: "작성중",
        ISSUED: "발행",
         EXPIRED: "만료",
        CANCELLED: "취소",
    };

    return (
        <span
            className={`quote-status quote-status-${status.toLowerCase()}`}
        >
            {labels[status]}
        </span>
    );
}


/* =========================================================
 * Format
 * ========================================================= */

function formatMoney(
    amount: number,
) {
    return `${amount.toLocaleString(
        "ko-KR",
    )}원`;
}

function formatDate(
    value: string,
) {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "ko-KR",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        },
    ).format(date);
}

function formatDateTime(
    value: string,
) {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "ko-KR",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",

            hour: "2-digit",
            minute: "2-digit",
        },
    ).format(date);
}