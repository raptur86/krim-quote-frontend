import {
  useMemo,
  useState,
} from "react";

import type {
  StandardRateListItem,
} from "../../rate/types/rate.types";

import type {
  QuoteDraftItem,
} from "../types/quote.types";

import {
  calculateQuoteItemsAmount,
} from "../utils/quoteCalculation";

import {
  StandardRateSelector,
} from "./StandardRateSelector";

import {
  QuoteItemEditor,
} from "./QuoteItemEditor";

import {
  QuoteItemTable,
} from "./QuoteItemTable";

import "./QuoteItemsStep.css";


type Props = {
  items: QuoteDraftItem[];

  onChange: (
    items: QuoteDraftItem[],
  ) => void;

  onPrevious: () => void;

  onNext: () => void;
};


export function QuoteItemsStep({
  items,
  onChange,
  onPrevious,
  onNext,
}: Props) {
  const [
    editorOpen,
    setEditorOpen,
  ] = useState(false);

  const [
    editingItem,
    setEditingItem,
  ] =
    useState<QuoteDraftItem | null>(
      null,
    );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  const itemsAmount =
    useMemo(
      () =>
        calculateQuoteItemsAmount(
          items,
        ),
      [items],
    );


  function handleAddStandardRates(
    rates:
      StandardRateListItem[],
  ) {
    const existingIds =
      new Set(
        items
          .map(
            (item) =>
              item.standardRateId,
          )
          .filter(
            (
              id,
            ): id is number =>
              id !== null,
          ),
      );


    const newItems =
      rates
        .filter(
          (rate) =>
            !existingIds.has(
              rate.id,
            ),
        )
        .map(
          (
            rate,
            index,
          ): QuoteDraftItem => ({
            clientId:
              createClientId(),

            standardRateId:
              rate.id,

            categoryName:
              rate.categoryName,

            featureName:
              rate.featureName,

            description: null,

            quoteUnitPrice:
              rate.standardPrice,

            quantity: 1,

            unitName:
              rate.defaultUnit,

            difficultyCode:
              "NORMAL",

            difficultyRate: 1.0,

            adjustmentAmount: 0,

            adjustmentReason: null,

            estimatedHours:
              rate.defaultHours,

            internalMemo: null,

            sortOrder:
              items.length +
              index +
              1,
          }),
        );


    if (
      newItems.length === 0
    ) {
      return;
    }


    onChange([
      ...items,
      ...newItems,
    ]);

    setErrorMessage("");
  }


  function handleOpenDirect() {
    setEditingItem(null);

    setEditorOpen(true);

    setErrorMessage("");
  }


  function handleEdit(
    item: QuoteDraftItem,
  ) {
    setEditingItem(item);

    setEditorOpen(true);

    setErrorMessage("");
  }


  function handleSave(
    item: QuoteDraftItem,
  ) {
    if (editingItem) {
      onChange(
        items.map(
          (current) =>
            current.clientId ===
            editingItem.clientId
              ? {
                  ...item,

                  clientId:
                    editingItem.clientId,

                  sortOrder:
                    editingItem.sortOrder,
                }
              : current,
        ),
      );
    } else {
      onChange([
        ...items,

        {
          ...item,

          sortOrder:
            items.length + 1,
        },
      ]);
    }


    setEditorOpen(false);

    setEditingItem(null);

    setErrorMessage("");
  }


  function handleDelete(
    clientId: string,
  ) {
    const confirmed =
      window.confirm(
        "이 견적항목을 삭제하시겠습니까?",
      );

    if (!confirmed) {
      return;
    }


    const nextItems =
      items
        .filter(
          (item) =>
            item.clientId !==
            clientId,
        )
        .map(
          (item, index) => ({
            ...item,
            sortOrder:
              index + 1,
          }),
        );


    onChange(nextItems);
  }


  function handleMoveUp(
    index: number,
  ) {
    if (index <= 0) {
      return;
    }

    moveItem(
      index,
      index - 1,
    );
  }


  function handleMoveDown(
    index: number,
  ) {
    if (
      index >=
      items.length - 1
    ) {
      return;
    }

    moveItem(
      index,
      index + 1,
    );
  }


  function moveItem(
    fromIndex: number,
    toIndex: number,
  ) {
    const nextItems =
      [...items];

    const [target] =
      nextItems.splice(
        fromIndex,
        1,
      );

    if (!target) {
      return;
    }

    nextItems.splice(
      toIndex,
      0,
      target,
    );


    onChange(
      nextItems.map(
        (item, index) => ({
          ...item,
          sortOrder:
            index + 1,
        }),
      ),
    );
  }


  function handleNext() {
    if (
      items.length === 0
    ) {
      setErrorMessage(
        "견적항목을 하나 이상 추가해주세요.",
      );

      return;
    }


    setErrorMessage("");

    onNext();
  }


  return (
    <section className="quote-items-step">

      <div className="quote-items-main">

        <StandardRateSelector
          onAdd={
            handleAddStandardRates
          }
        />


        <section className="quote-items-added">

          <header className="quote-items-added-header">

            <div>
              <h3>
                견적항목
              </h3>

              <p>
                추가된 기능의 단가,
                난이도와 수량을
                조정합니다.
              </p>
            </div>


            <button
              type="button"
              onClick={
                handleOpenDirect
              }
            >
              + 직접 항목 추가
            </button>

          </header>


          <QuoteItemTable
            items={items}
            onEdit={
              handleEdit
            }
            onDelete={
              handleDelete
            }
            onMoveUp={
              handleMoveUp
            }
            onMoveDown={
              handleMoveDown
            }
          />

        </section>

      </div>


      <aside className="quote-items-summary">

        <h3>
          견적 금액
        </h3>


        <div className="quote-items-summary-row">

          <span>
            항목 수
          </span>

          <strong>
            {items.length}
          </strong>

        </div>


        <div className="quote-items-summary-row">

          <span>
            항목 합계
          </span>

          <strong>
            {itemsAmount.toLocaleString(
              "ko-KR",
            )}
            원
          </strong>

        </div>


        <p className="quote-items-summary-note">
          공급가액과 VAT,
          견적 전체 조정금액은
          검토 단계에서 최종
          계산합니다.
        </p>

      </aside>


      <footer className="quote-items-footer">

        {errorMessage && (
          <p
            className="quote-items-error"
            role="alert"
          >
            {errorMessage}
          </p>
        )}


        <div className="quote-items-footer-actions">

          <button
            type="button"
            onClick={
              onPrevious
            }
          >
            ← 이전
          </button>

          <button
            type="button"
            onClick={
              handleNext
            }
          >
            다음 →
          </button>

        </div>

      </footer>


      {editorOpen && (
        <QuoteItemEditor
          item={
            editingItem
          }
          onSave={
            handleSave
          }
          onCancel={() => {
            setEditorOpen(false);

            setEditingItem(null);
          }}
        />
      )}

    </section>
  );
}


function createClientId():
  string {
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