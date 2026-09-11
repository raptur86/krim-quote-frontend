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

import "./QuoteReviewStep.css";


type Props = {
    basic: QuoteBasicFormValues;

    items: QuoteDraftItem[];

    customers: CustomerListItem[];

    platforms: PlatformListItem[];

    adjustmentAmount: number;

    onAdjustmentAmountChange:
    (value: number) => void;

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
    const customer =
        customers.find(
            (item) =>
                item.id ===
                basic.customerId,
        );

    const platform =
        basic.inquiryPlatformId
            ? platforms.find(
                (item) =>
                    item.id ===
                    basic.inquiryPlatformId,
            )
            : null;


    const itemsAmount =
        calculateQuoteItemsAmount(
            items,
        );


    const totalAmount =
        Math.round(
            itemsAmount +
            adjustmentAmount,
        );


    const supplyAmount =
        Math.round(
            totalAmount / 1.1,
        );


    const vatAmount =
        totalAmount -
        supplyAmount;


    return (
        <section className="quote-review">

            <div className="quote-review-document">

                <header className="quote-review-header">

                    <div>
                        <strong className="quote-review-brand">
                            KRIM
                        </strong>

                        <h2>
                            견 적 서
                        </h2>
                    </div>

                    <div className="quote-review-number">
                        견적번호
                        <strong>
                            발행 시 자동 생성
                        </strong>
                    </div>

                </header>


                <section className="quote-review-basic">

                    <dl>
                        <div>
                            <dt>
                                고객
                            </dt>

                            <dd>
                                {customer
                                    ? formatCustomer(
                                        customer,
                                    )
                                    : "-"}
                            </dd>
                        </div>


                        <div>
                            <dt>
                                프로젝트
                            </dt>

                            <dd>
                                {basic.title}
                            </dd>
                        </div>


                        <div>
                            <dt>
                                작성일
                            </dt>

                            <dd>
                                {basic.writtenDate}
                            </dd>
                        </div>


                        <div>
                            <dt>
                                유효기간
                            </dt>

                            <dd>
                                {basic.validUntil ||
                                    "-"}
                            </dd>
                        </div>


                        <div>
                            <dt>
                                개발기간
                            </dt>

                            <dd>
                                {basic.expectedDuration ||
                                    "-"}
                            </dd>
                        </div>


                        <div>
                            <dt>
                                의뢰 플랫폼
                            </dt>

                            <dd>
                                {platform?.name ??
                                    "-"}
                            </dd>
                        </div>

                    </dl>

                </section>


                <section className="quote-review-items">

                    <table>

                        <thead>
                            <tr>
                                <th>
                                    구분
                                </th>

                                <th>
                                    기능
                                </th>

                                <th>
                                    단가
                                </th>

                                <th>
                                    수량
                                </th>

                                <th>
                                    난이도
                                </th>

                                <th>
                                    금액
                                </th>
                            </tr>
                        </thead>


                        <tbody>

                            {items.map(
                                (item) => (
                                    <tr
                                        key={
                                            item.clientId
                                        }
                                    >

                                        <td>
                                            {item.categoryName ||
                                                "-"}
                                        </td>

                                        <td>
                                            <strong>
                                                {
                                                    item.featureName
                                                }
                                            </strong>

                                            {item.description && (
                                                <p>
                                                    {
                                                        item.description
                                                    }
                                                </p>
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
                                            {formatMoney(
                                                calculateQuoteItemAmount(
                                                    item,
                                                ),
                                            )}
                                        </td>

                                    </tr>
                                ),
                            )}

                        </tbody>

                    </table>

                </section>


                <section className="quote-review-adjustment">

                    <label htmlFor="quote-adjustment-amount">
                        견적 전체 조정금액
                    </label>

                    <input
                        id="quote-adjustment-amount"
                        type="number"
                        step={1000}
                        value={
                            adjustmentAmount
                        }
                        onChange={(event) =>
                            onAdjustmentAmountChange(
                                Number(
                                    event.target.value,
                                ),
                            )
                        }
                    />

                </section>


                <section className="quote-review-summary">

                    <div>
                        <span>
                            항목 합계
                        </span>

                        <strong>
                            {formatMoney(
                                itemsAmount,
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>
                            전체 조정
                        </span>

                        <strong>
                            {formatSignedMoney(
                                adjustmentAmount,
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>
                            공급가액
                        </span>

                        <strong>
                            {formatMoney(
                                supplyAmount,
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>
                            VAT 10%
                        </span>

                        <strong>
                            {formatMoney(
                                vatAmount,
                            )}
                        </strong>
                    </div>


                    <div className="quote-review-total">
                        <span>
                            총 견적금액
                        </span>

                        <strong>
                            {formatMoney(
                                totalAmount,
                            )}
                        </strong>
                    </div>

                </section>


                {basic.customerNote && (
                    <section className="quote-review-note">

                        <h3>
                            비고
                        </h3>

                        <p>
                            {basic.customerNote}
                        </p>

                    </section>
                )}

            </div>


            <footer className="quote-review-actions">

                <button
                    type="button"
                    onClick={
                        onPrevious
                    }
                >
                    ← 수정하기
                </button>
                {saveError && (
                    <p
                        className="quote-review-save-error"
                        role="alert"
                    >
                        {saveError}
                    </p>
                )}
                <button
                    type="button"
                    disabled={saving}
                    onClick={
                        onSave
                    }
                >
                    {saving
                        ? "저장 중..."
                        : "DRAFT 저장"}
                </button>

            </footer>

        </section>
    );
}


function formatCustomer(
    customer: CustomerListItem,
): string {
    if (
        customer.companyName
    ) {
        return `${customer.companyName} / ${customer.customerName}`;
    }

    return customer.customerName;
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
    ).toLocaleString(
        "ko-KR",
    )}원`;
}