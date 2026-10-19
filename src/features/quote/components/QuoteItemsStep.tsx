
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  CirclePlus,
  Info,
  ListChecks,
  ReceiptText,
} from "lucide-react";

import type { StandardRateListItem } from "../../rate/types/rate.types";
import type { QuoteDraftItem } from "../types/quote.types";

import { calculateQuoteItemsAmount } from "../utils/quoteCalculation";

import { StandardRateSelector } from "./StandardRateSelector";
import { QuoteItemEditor } from "./QuoteItemEditor";
import { QuoteItemTable } from "./QuoteItemTable";

import { Button } from "../../../components/ui/Button";

import "./QuoteItemsStep.css";

type Props = {
  items: QuoteDraftItem[];
  onChange: (items: QuoteDraftItem[]) => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function QuoteItemsStep({
  items,
  onChange,
  onPrevious,
  onNext,
}: Props) {
  const [editorOpen, setEditorOpen] = useState(false);

  const [editingItem, setEditingItem] =
    useState<QuoteDraftItem | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  const itemsAmount = useMemo(
    () => calculateQuoteItemsAmount(items),
    [items]
  );

  function handleAddStandardRates(
    rates: StandardRateListItem[]
  ) {
    const existingIds = new Set(
      items
        .map((item) => item.standardRateId)
        .filter((id): id is number => id !== null)
    );

    const newItems = rates
      .filter((rate) => !existingIds.has(rate.id))
      .map(
        (rate, index): QuoteDraftItem => ({
          clientId: createClientId(),
          standardRateId: rate.id,
          categoryName: rate.categoryName,
          featureName: rate.featureName,
          description: null,
          quoteUnitPrice: rate.standardPrice,
          quantity: 1,
          unitName: rate.defaultUnit,
          difficultyCode: "NORMAL",
          difficultyRate: 1.0,
          adjustmentAmount: 0,
          adjustmentReason: null,
          estimatedHours: rate.defaultHours,
          internalMemo: null,
          sortOrder: items.length + index + 1,
        })
      );

    if (newItems.length === 0) {
      return;
    }

    onChange([...items, ...newItems]);
    setErrorMessage("");
  }

  function handleOpenDirect() {
    setEditingItem(null);
    setEditorOpen(true);
    setErrorMessage("");
  }

  function handleEdit(item: QuoteDraftItem) {
    setEditingItem(item);
    setEditorOpen(true);
    setErrorMessage("");
  }

  function handleSave(item: QuoteDraftItem) {
    if (editingItem) {
      onChange(
        items.map((current) =>
          current.clientId === editingItem.clientId
            ? {
                ...item,
                clientId: editingItem.clientId,
                sortOrder: editingItem.sortOrder,
              }
            : current
        )
      );
    } else {
      onChange([
        ...items,
        {
          ...item,
          sortOrder: items.length + 1,
        },
      ]);
    }

    setEditorOpen(false);
    setEditingItem(null);
    setErrorMessage("");
  }

  function handleDelete(clientId: string) {
    const confirmed = window.confirm(
      "이 견적항목을 삭제하시겠습니까?"
    );

    if (!confirmed) {
      return;
    }

    const nextItems = items
      .filter((item) => item.clientId !== clientId)
      .map((item, index) => ({
        ...item,
        sortOrder: index + 1,
      }));

    onChange(nextItems);
    setErrorMessage("");
  }

  function handleMoveUp(index: number) {
    if (index <= 0) {
      return;
    }

    moveItem(index, index - 1);
  }

  function handleMoveDown(index: number) {
    if (index >= items.length - 1) {
      return;
    }

    moveItem(index, index + 1);
  }

  function moveItem(fromIndex: number, toIndex: number) {
    const nextItems = [...items];

    const [target] = nextItems.splice(fromIndex, 1);

    if (!target) {
      return;
    }

    nextItems.splice(toIndex, 0, target);

    onChange(
      nextItems.map((item, index) => ({
        ...item,
        sortOrder: index + 1,
      }))
    );
  }

  function handleNext() {
    if (items.length === 0) {
      setErrorMessage(
        "견적항목을 하나 이상 추가해주세요."
      );
      return;
    }

    setErrorMessage("");
    onNext();
  }

  return (
    <section className="quote-items-step">
      <div className="quote-items-main">
        <div className="quote-items-selector-panel">
          <div className="quote-items-panel-heading">
            <span className="quote-items-panel-icon">
              <ListChecks size={19} aria-hidden="true" />
            </span>

            <div>
              <h3>표준단가에서 기능 선택</h3>
              <p>
                등록된 표준단가를 선택하여 견적항목에
                추가한다.
              </p>
            </div>
          </div>

          <StandardRateSelector
            onAdd={handleAddStandardRates}
          />
        </div>

        <section className="quote-items-added">
          <header className="quote-items-added-header">
            <div className="quote-items-added-heading">
              <span className="quote-items-panel-icon">
                <ReceiptText
                  size={19}
                  aria-hidden="true"
                />
              </span>

              <div>
                <h3>견적항목</h3>
                <p>
                  추가된 기능의 단가, 난이도, 수량을
                  조정한다.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleOpenDirect}
            >
              <CirclePlus
                size={16}
                aria-hidden="true"
              />
              직접 항목 추가
            </Button>
          </header>

          <div className="quote-items-added-count">
            <span>등록된 견적항목</span>
            <strong>{items.length}건</strong>
          </div>

          <div className="quote-items-table-container">
            <QuoteItemTable
              items={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          </div>
        </section>
      </div>

      <aside
        className="quote-items-summary"
        aria-label="견적 금액 요약"
      >
        <div className="quote-items-summary-heading">
          <span className="quote-items-summary-icon">
            <Calculator
              size={19}
              aria-hidden="true"
            />
          </span>

          <div>
            <h3>견적 금액</h3>
            <p>현재 구성된 항목 기준</p>
          </div>
        </div>

        <div className="quote-items-summary-row">
          <span>항목 수</span>
          <strong>{items.length}건</strong>
        </div>

        <div className="quote-items-summary-total">
          <span>항목 합계</span>
          <strong>
            {itemsAmount.toLocaleString("ko-KR")}
            <small>원</small>
          </strong>
        </div>

        <div className="quote-items-summary-note">
          <Info size={16} aria-hidden="true" />
          <p>
            표준단가 및 견적금액은 VAT 포함 기준이다.
            공급가액, VAT, 견적 전체 조정금액은 검토
            단계에서 최종 계산한다.
          </p>
        </div>
      </aside>

      <footer className="quote-items-footer">
        {errorMessage && (
          <div
            className="quote-items-error"
            role="alert"
          >
            <AlertCircle
              size={17}
              aria-hidden="true"
            />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="quote-items-footer-actions">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
            />
            이전 단계
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
          >
            다음 단계
            <ArrowRight
              size={16}
              aria-hidden="true"
            />
          </Button>
        </div>
      </footer>

      {editorOpen && (
        <QuoteItemEditor
          item={editingItem}
          onSave={handleSave}
          onCancel={() => {
            setEditorOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </section>
  );
}

function createClientId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}
