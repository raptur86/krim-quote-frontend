import { useEffect, useState } from "react";

import {
    QUOTE_DIFFICULTIES,
} from "../constants/quoteDifficulty";

import type {
    QuoteDraftItem,
} from "../types/quote.types";

import "./QuoteItemEditor.css";


type Props = {
    item: QuoteDraftItem | null;

    onSave: (
        item: QuoteDraftItem,
    ) => void;

    onCancel: () => void;
};


export function QuoteItemEditor({
    item,
    onSave,
    onCancel,
}: Props) {
    const [form, setForm] =
        useState<QuoteDraftItem>(
            () =>
                item ??
                createEmptyItem(),
        );

    const [errorMessage, setErrorMessage] =
        useState("");


    useEffect(() => {
        setForm(
            item ??
            createEmptyItem(),
        );

        setErrorMessage("");
    }, [item]);


    function update<
        K extends keyof QuoteDraftItem,
    >(
        field: K,
        value: QuoteDraftItem[K],
    ) {
        setForm(
            (previous) => ({
                ...previous,
                [field]: value,
            }),
        );

        setErrorMessage("");
    }


    function handleDifficultyChange(
        code: string,
    ) {
        const difficulty =
            QUOTE_DIFFICULTIES.find(
                (item) =>
                    item.code === code,
            );

        if (!difficulty) {
            return;
        }

        setForm(
            (previous) => ({
                ...previous,

                difficultyCode:
                    difficulty.code,

                difficultyRate:
                    difficulty.rate,
            }),
        );
    }


    function handleSave() {
        const featureName =
            form.featureName.trim();

        const unitName =
            form.unitName.trim();

        const adjustmentReason =
            form.adjustmentReason?.trim() ||
            null;


        if (!featureName) {
            setErrorMessage(
                "기능명을 입력해주세요.",
            );

            return;
        }


        if (
            !Number.isFinite(
                form.quoteUnitPrice,
            ) ||
            form.quoteUnitPrice < 0
        ) {
            setErrorMessage(
                "단가는 0원 이상이어야 합니다.",
            );

            return;
        }


        if (
            !Number.isFinite(
                form.quantity,
            ) ||
            form.quantity <= 0
        ) {
            setErrorMessage(
                "수량은 0보다 커야 합니다.",
            );

            return;
        }


        if (
            !Number.isFinite(
                form.difficultyRate,
            ) ||
            form.difficultyRate <= 0
        ) {
            setErrorMessage(
                "난이도 계수는 0보다 커야 합니다.",
            );

            return;
        }


        if (!unitName) {
            setErrorMessage(
                "단위를 입력해주세요.",
            );

            return;
        }


        if (
            form.adjustmentAmount !== 0 &&
            !adjustmentReason
        ) {
            setErrorMessage(
                "조정금액이 있는 경우 조정사유를 입력해주세요.",
            );

            return;
        }


        onSave({
            ...form,

            categoryName:
                nullableText(
                    form.categoryName,
                ),

            featureName,

            unitName,

            description:
                nullableText(
                    form.description,
                ),

            adjustmentReason,

            internalMemo:
                nullableText(
                    form.internalMemo,
                ),
        });
    }


    return (
        <div
            className="quote-item-editor-backdrop"
            role="presentation"
        >
            <section
                className="quote-item-editor"
                role="dialog"
                aria-modal="true"
                aria-labelledby="quote-item-editor-title"
            >

                <header className="quote-item-editor-header">

                    <div>
                        <h3 id="quote-item-editor-title">
                            {item
                                ? "견적항목 수정"
                                : "직접 항목 추가"}
                        </h3>

                        <p>
                            견적 단가와 난이도,
                            수량을 설정합니다.
                        </p>
                    </div>

                </header>


                {errorMessage && (
                    <div
                        className="quote-item-editor-error"
                        role="alert"
                    >
                        {errorMessage}
                    </div>
                )}
                <div className="quote-item-editor-field quote-item-editor-field-full">

                    <label htmlFor="quote-item-category">
                        카테고리
                    </label>

                    <input
                        id="quote-item-category"
                        value={
                            form.categoryName ?? ""
                        }
                        placeholder="예: API 연동"
                        onChange={(event) =>
                            update(
                                "categoryName",
                                event.target.value,
                            )
                        }
                    />

                </div>

                <div className="quote-item-editor-grid">

                    <div className="quote-item-editor-field quote-item-editor-field-full">

                        <label htmlFor="quote-item-feature-name">
                            기능명 *
                        </label>

                        <input
                            id="quote-item-feature-name"
                            value={form.featureName}
                            onChange={(event) =>
                                update(
                                    "featureName",
                                    event.target.value,
                                )
                            }
                        />

                    </div>


                    <div className="quote-item-editor-field quote-item-editor-field-full">

                        <label htmlFor="quote-item-description">
                            기능 설명
                        </label>

                        <textarea
                            id="quote-item-description"
                            rows={3}
                            value={
                                form.description ?? ""
                            }
                            onChange={(event) =>
                                update(
                                    "description",
                                    event.target.value,
                                )
                            }
                        />

                    </div>


                    <div className="quote-item-editor-field">

                        <label htmlFor="quote-item-price">
                            견적 기준단가 *
                        </label>

                        <input
                            id="quote-item-price"
                            type="number"
                            min={0}
                            step={1000}
                            value={
                                form.quoteUnitPrice
                            }
                            onChange={(event) =>
                                update(
                                    "quoteUnitPrice",
                                    Number(
                                        event.target.value,
                                    ),
                                )
                            }
                        />

                    </div>


                    <div className="quote-item-editor-field">

                        <label htmlFor="quote-item-quantity">
                            수량 *
                        </label>

                        <input
                            id="quote-item-quantity"
                            type="number"
                            min={0.01}
                            step={1}
                            value={
                                form.quantity
                            }
                            onChange={(event) =>
                                update(
                                    "quantity",
                                    Number(
                                        event.target.value,
                                    ),
                                )
                            }
                        />

                    </div>


                    <div className="quote-item-editor-field">

                        <label htmlFor="quote-item-unit">
                            단위 *
                        </label>

                        <input
                            id="quote-item-unit"
                            value={
                                form.unitName
                            }
                            placeholder="건"
                            onChange={(event) =>
                                update(
                                    "unitName",
                                    event.target.value,
                                )
                            }
                        />

                    </div>


                    <div className="quote-item-editor-field">

                        <label htmlFor="quote-item-difficulty">
                            난이도
                        </label>

                        <select
                            id="quote-item-difficulty"
                            value={
                                form.difficultyCode
                            }
                            onChange={(event) =>
                                handleDifficultyChange(
                                    event.target.value,
                                )
                            }
                        >

                            {QUOTE_DIFFICULTIES.map(
                                (difficulty) => (
                                    <option
                                        key={
                                            difficulty.code
                                        }
                                        value={
                                            difficulty.code
                                        }
                                    >
                                        {difficulty.label}
                                        {" "}
                                        (
                                        {difficulty.rate}
                                        )
                                    </option>
                                ),
                            )}

                        </select>

                    </div>


                    <div className="quote-item-editor-field">

                        <label htmlFor="quote-item-difficulty-rate">
                            난이도 계수
                        </label>

                        <input
                            id="quote-item-difficulty-rate"
                            type="number"
                            min={0.01}
                            step={0.05}
                            value={
                                form.difficultyRate
                            }
                            onChange={(event) =>
                                update(
                                    "difficultyRate",
                                    Number(
                                        event.target.value,
                                    ),
                                )
                            }
                        />

                    </div>


                    <div className="quote-item-editor-field">

                        <label htmlFor="quote-item-adjustment">
                            조정금액
                        </label>

                        <input
                            id="quote-item-adjustment"
                            type="number"
                            step={1000}
                            value={
                                form.adjustmentAmount
                            }
                            onChange={(event) =>
                                update(
                                    "adjustmentAmount",
                                    Number(
                                        event.target.value,
                                    ),
                                )
                            }
                        />

                    </div>


                    <div className="quote-item-editor-field">

                        <label htmlFor="quote-item-hours">
                            예상 작업시간
                        </label>

                        <input
                            id="quote-item-hours"
                            type="number"
                            min={0}
                            step={0.5}
                            value={
                                form.estimatedHours
                            }
                            onChange={(event) =>
                                update(
                                    "estimatedHours",
                                    Number(
                                        event.target.value,
                                    ),
                                )
                            }
                        />

                    </div>


                    <div className="quote-item-editor-field quote-item-editor-field-full">

                        <label htmlFor="quote-item-adjustment-reason">
                            조정사유
                        </label>

                        <input
                            id="quote-item-adjustment-reason"
                            value={
                                form.adjustmentReason ??
                                ""
                            }
                            onChange={(event) =>
                                update(
                                    "adjustmentReason",
                                    event.target.value,
                                )
                            }
                        />

                    </div>


                    <div className="quote-item-editor-field quote-item-editor-field-full">

                        <label htmlFor="quote-item-internal-memo">
                            내부 메모
                        </label>

                        <textarea
                            id="quote-item-internal-memo"
                            rows={3}
                            value={
                                form.internalMemo ?? ""
                            }
                            onChange={(event) =>
                                update(
                                    "internalMemo",
                                    event.target.value,
                                )
                            }
                        />

                    </div>

                </div>


                <footer className="quote-item-editor-actions">

                    <button
                        type="button"
                        onClick={onCancel}
                    >
                        취소
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                    >
                        {item
                            ? "수정하기"
                            : "추가하기"}
                    </button>

                </footer>

            </section>
        </div>
    );
}


function createEmptyItem():
    QuoteDraftItem {
    return {
        clientId:
            createClientId(),

        standardRateId: null,

        categoryName: null,

        featureName: "",

        description: null,

        quoteUnitPrice: 0,

        quantity: 1,

        unitName: "건",

        difficultyCode:
            "NORMAL",

        difficultyRate: 1.0,

        adjustmentAmount: 0,

        adjustmentReason: null,

        estimatedHours: 0,

        internalMemo: null,

        sortOrder: 1,
    };
}


function createClientId(): string {
    if (
        typeof crypto !==
        "undefined" &&
        typeof crypto.randomUUID ===
        "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()}`;
}


function nullableText(
    value: string | null,
): string | null {
    if (!value) {
        return null;
    }

    const text = value.trim();

    return text || null;
}