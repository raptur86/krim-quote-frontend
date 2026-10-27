
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  CirclePlus,
  Info,
  ListChecks,
  LoaderCircle,
  ReceiptText,
} from "lucide-react";

import { getPackageFeaturesApi } from "../../rate/api/rateApi";

import type {
  PackageFeatureResponse,
  StandardRateListItem,
} from "../../rate/types/rate.types";

import type { QuoteDraftItem } from "../types/quote.types";

import {
  calculateQuoteItemsAmount,
} from "../utils/quoteCalculation";

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

type ItemGroup = {
  root: QuoteDraftItem;
  members: QuoteDraftItem[];
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

  const [addingRates, setAddingRates] = useState(false);

  const itemsAmount = useMemo(
    () => calculateQuoteItemsAmount(items),
    [items]
  );

  const packageCount = items.filter(
    (item) => item.itemType === "PACKAGE"
  ).length;

  const includedCount = items.filter(
    (item) => item.itemType === "INCLUDED_FEATURE"
  ).length;

  const payableCount = items.filter(
    (item) => item.itemType !== "INCLUDED_FEATURE"
  ).length;

  /**
   * 표준단가 선택 후 견적항목에 추가한다.
   *
   * PACKAGE :
   *   패키지 항목을 생성한 후 포함 기능 API를 조회한다.
   *
   * FEATURE :
   *   독립적인 일반 기능 항목으로 생성한다.
   *
   * API 요청 중 하나라도 실패하면
   * 이번에 선택한 항목은 추가하지 않는다.
   */
  async function handleAddStandardRates(
    rates: StandardRateListItem[]
  ) {
    if (addingRates || rates.length === 0) {
      return;
    }

    setAddingRates(true);
    setErrorMessage("");

    try {
      const existingRootRateIds = new Set(
        items
          .filter(
            (item) =>
              item.itemType !== "INCLUDED_FEATURE"
          )
          .map((item) => item.standardRateId)
          .filter(
            (id): id is number => id !== null
          )
      );

      const selectedIds = new Set<number>();

      const newRates = rates.filter((rate) => {
        if (
          existingRootRateIds.has(rate.id) ||
          selectedIds.has(rate.id)
        ) {
          return false;
        }

        selectedIds.add(rate.id);
        return true;
      });

      if (newRates.length === 0) {
        setErrorMessage(
          "선택한 표준단가가 이미 견적항목에 등록되어 있습니다."
        );
        return;
      }

      const createdGroups = await Promise.all(
        newRates.map(async (rate) => {
          if (rate.rateType === "PACKAGE") {
            const features =
              await getPackageFeaturesApi(
                rate.id,
                { active: true }
              );

            return createPackageItems(
              rate,
              features
            );
          }

          return [
            createStandardRateItem(
              rate,
              "FEATURE"
            ),
          ];
        })
      );

      const newItems = createdGroups.flat();

      onChange(
        normalizeSortOrders([
          ...items,
          ...newItems,
        ])
      );

      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `표준단가 추가 실패 : ${error.message}`
          : "패키지 구성 정보를 불러오지 못했습니다."
      );
    } finally {
      setAddingRates(false);
    }
  }

  function handleOpenDirect() {
    if (addingRates) {
      return;
    }

    setEditingItem(null);
    setEditorOpen(true);
    setErrorMessage("");
  }

  function handleEdit(item: QuoteDraftItem) {
    if (addingRates) {
      return;
    }

    if (item.itemType === "INCLUDED_FEATURE") {
      setErrorMessage(
        "패키지 포함 기능은 개별 수정할 수 없습니다."
      );
      return;
    }

    setEditingItem(item);
    setEditorOpen(true);
    setErrorMessage("");
  }

  function handleSave(item: QuoteDraftItem) {
    if (editingItem) {
      if (
        editingItem.itemType === "INCLUDED_FEATURE"
      ) {
        setErrorMessage(
          "패키지 포함 기능은 개별 수정할 수 없습니다."
        );
        return;
      }

      const updated = items.map((current) => {
        if (
          current.clientId !== editingItem.clientId
        ) {
          return current;
        }

        return {
          ...item,

          // 항목의 고유 식별자 및 순서 유지
          clientId: editingItem.clientId,
          sortOrder: editingItem.sortOrder,

          // 편집 중 패키지 관계가 변경되지 않도록 유지
          itemType: editingItem.itemType,
          standardRateId:
            editingItem.standardRateId,
          parentPackageClientId:
            editingItem.parentPackageClientId,
          parentPackageItemIndex: null,
          packageScopeSnapshot:
            editingItem.packageScopeSnapshot,
        };
      });

      onChange(updated);
    } else {
      const directItem: QuoteDraftItem = {
        ...item,
        clientId: createClientId(),
        itemType: "FEATURE",
        standardRateId: null,
        parentPackageClientId: null,
        parentPackageItemIndex: null,
        packageScopeSnapshot: null,
        sortOrder: items.length + 1,
      };

      onChange(
        normalizeSortOrders([
          ...items,
          directItem,
        ])
      );
    }

    setEditorOpen(false);
    setEditingItem(null);
    setErrorMessage("");
  }

  /**
   * 패키지를 삭제하면 포함 기능도 함께 삭제한다.
   * 일반 기능은 해당 항목만 삭제한다.
   */
  function handleDelete(clientId: string) {
    if (addingRates) {
      return;
    }

    const target = items.find(
      (item) => item.clientId === clientId
    );

    if (!target) {
      return;
    }

    if (target.itemType === "INCLUDED_FEATURE") {
      setErrorMessage(
        "패키지 포함 기능은 개별 삭제할 수 없습니다. 부모 패키지를 삭제해주세요."
      );
      return;
    }

    const isPackage =
      target.itemType === "PACKAGE";

    const confirmed = window.confirm(
      isPackage
        ? "이 패키지와 포함된 모든 기능을 삭제하시겠습니까?"
        : "이 견적항목을 삭제하시겠습니까?"
    );

    if (!confirmed) {
      return;
    }

    const nextItems = items.filter((item) => {
      if (item.clientId === clientId) {
        return false;
      }

      if (
        isPackage &&
        item.itemType === "INCLUDED_FEATURE" &&
        item.parentPackageClientId === clientId
      ) {
        return false;
      }

      return true;
    });

    onChange(normalizeSortOrders(nextItems));
    setErrorMessage("");
  }

  /**
   * 패키지와 포함 기능을 하나의 그룹으로 취급한다.
   * 포함 기능을 단독으로 이동시키지 않는다.
   */
  function handleMoveUp(index: number) {
    moveGroup(index, -1);
  }

  function handleMoveDown(index: number) {
    moveGroup(index, 1);
  }

  function moveGroup(
    itemIndex: number,
    direction: -1 | 1
  ) {
    if (addingRates) {
      return;
    }

    const target = items[itemIndex];

    if (!target) {
      return;
    }

    if (target.itemType === "INCLUDED_FEATURE") {
      setErrorMessage(
        "패키지 포함 기능은 개별 순서를 변경할 수 없습니다."
      );
      return;
    }

    const groups = buildItemGroups(items);

    const groupIndex = groups.findIndex(
      (group) =>
        group.root.clientId === target.clientId
    );

    if (groupIndex < 0) {
      return;
    }

    const nextGroupIndex =
      groupIndex + direction;

    if (
      nextGroupIndex < 0 ||
      nextGroupIndex >= groups.length
    ) {
      return;
    }

    const nextGroups = [...groups];

    const [movingGroup] = nextGroups.splice(
      groupIndex,
      1
    );

    if (!movingGroup) {
      return;
    }

    nextGroups.splice(
      nextGroupIndex,
      0,
      movingGroup
    );

    const reordered = nextGroups.flatMap(
      (group) => group.members
    );

    onChange(normalizeSortOrders(reordered));
    setErrorMessage("");
  }

  /**
   * 검토 단계 이동 전
   * 패키지 관계와 배열 순서를 확인한다.
   */
  function handleNext() {
    if (addingRates) {
      setErrorMessage(
        "표준단가를 추가하는 중입니다. 잠시 기다려주세요."
      );
      return;
    }

    if (items.length === 0) {
      setErrorMessage(
        "견적항목을 하나 이상 추가해주세요."
      );
      return;
    }

    const validationError =
      validatePackageItems(items);

    if (validationError) {
      setErrorMessage(validationError);
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
              <ListChecks
                size={19}
                aria-hidden="true"
              />
            </span>

            <div>
              <h3>표준단가에서 기능 및 패키지 선택</h3>
              <p>
                등록된 표준단가에서 개별 기능이나
                패키지를 선택하여 견적항목에 추가한다.
              </p>
            </div>
          </div>

          <StandardRateSelector
            disabled={addingRates}
            onAdd={(rates) => {
              void handleAddStandardRates(rates);
            }}
          />

          {addingRates && (
            <div
              className="quote-items-error"
              role="status"
              style={{ marginTop: 12 }}
            >
              <LoaderCircle
                size={17}
                aria-hidden="true"
              />
              <span>
                선택한 패키지의 포함 기능을
                불러오는 중입니다.
              </span>
            </div>
          )}
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
                  패키지 및 개별 기능의 단가,
                  난이도와 수량을 조정한다.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={addingRates}
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

            {packageCount > 0 && (
              <span>
                · 패키지 {packageCount}건
              </span>
            )}

            {includedCount > 0 && (
              <span>
                · 포함 기능 {includedCount}건
              </span>
            )}
          </div>

          <div className="quote-items-table-container">
            <QuoteItemTable
              items={items}
              onChange={onChange}
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

        {includedCount > 0 && (
          <div className="quote-items-summary-row">
            <span>금액 산정 항목</span>
            <strong>{payableCount}건</strong>
          </div>
        )}

        <div className="quote-items-summary-total">
          <span>항목 합계</span>
          <strong>
            {itemsAmount.toLocaleString("ko-KR")}
            <small>원</small>
          </strong>
        </div>

        <div className="quote-items-summary-note">
          <Info
            size={16}
            aria-hidden="true"
          />
          <p>
            표준단가 및 견적금액은 VAT 포함
            기준이다. 패키지 포함 기능은 별도
            금액이 발생하지 않는다. 공급가액,
            VAT, 견적 전체 조정금액은 검토
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
            disabled={addingRates}
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
            disabled={addingRates}
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

/**
 * 표준단가에서 일반 기능을 생성한다.
 */
function createStandardRateItem(
  rate: StandardRateListItem,
  itemType: "FEATURE" | "PACKAGE"
): QuoteDraftItem {
  return {
    clientId: createClientId(),
    standardRateId: rate.id,
    categoryName: rate.categoryName,
    featureName: rate.featureName,
    description: null,
    quoteUnitPrice: rate.standardPrice,
    quantity: 1,
    unitName: rate.defaultUnit ?? "건",
    difficultyCode: "NORMAL",
    difficultyRate: 1,
    adjustmentAmount: 0,
    adjustmentReason: null,
    estimatedHours: rate.defaultHours ?? 0,
    internalMemo: null,
    sortOrder: 0,
    itemType,
    parentPackageClientId: null,
    parentPackageItemIndex: null,
    packageScopeSnapshot: null,
  };
}

/**
 * 패키지와 해당 패키지에 포함된 기능을 생성한다.
 *
 * 포함 기능의 단가 및 조정금액은 0원으로 고정한다.
 */
function createPackageItems(
  rate: StandardRateListItem,
  features: PackageFeatureResponse[]
): QuoteDraftItem[] {
  const packageItem = createStandardRateItem(
    rate,
    "PACKAGE"
  );

  const includedItems: QuoteDraftItem[] = [
    ...features,
  ]
    .filter((feature) => feature.active)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder
    )
    .map((feature) => ({
      clientId: createClientId(),
      standardRateId: feature.featureRateId,
      categoryName: feature.categoryName,
      featureName: feature.featureName,
      description: feature.scopeDescription,
      quoteUnitPrice: 0,
      quantity: feature.includedQuantity,
      unitName: feature.unitName ?? "건",
      difficultyCode: null,
      difficultyRate: 1,
      adjustmentAmount: 0,
      adjustmentReason: null,
      estimatedHours: 0,
      internalMemo: null,
      sortOrder: 0,
      itemType: "INCLUDED_FEATURE",
      parentPackageClientId:
        packageItem.clientId,
      parentPackageItemIndex: null,
      packageScopeSnapshot:
        feature.scopeDescription ?? null,
    }));

  return [
    packageItem,
    ...includedItems,
  ];
}

/**
 * 패키지와 포함 기능을 그룹으로 만든다.
 * 일반 기능은 각각 독립된 그룹이다.
 */
function buildItemGroups(
  items: QuoteDraftItem[]
): ItemGroup[] {
  const includedByParent = new Map<
    string,
    QuoteDraftItem[]
  >();

  for (const item of items) {
    if (
      item.itemType !== "INCLUDED_FEATURE" ||
      !item.parentPackageClientId
    ) {
      continue;
    }

    const siblings =
      includedByParent.get(
        item.parentPackageClientId
      ) ?? [];

    siblings.push(item);

    includedByParent.set(
      item.parentPackageClientId,
      siblings
    );
  }

  const groups: ItemGroup[] = [];

  for (const item of items) {
    if (item.itemType === "INCLUDED_FEATURE") {
      continue;
    }

    const members =
      item.itemType === "PACKAGE"
        ? [
          item,
          ...(includedByParent.get(
            item.clientId
          ) ?? []),
        ]
        : [item];

    groups.push({
      root: item,
      members,
    });
  }

  return groups;
}

/**
 * sortOrder를 실제 배열 순서로 정규화한다.
 */
function normalizeSortOrders(
  items: QuoteDraftItem[]
): QuoteDraftItem[] {
  return items.map((item, index) => ({
    ...item,
    sortOrder: index + 1,
    parentPackageItemIndex: null,
  }));
}

/**
 * 검토 단계 진입 전에 패키지 관계를 검증한다.
 */
function validatePackageItems(
  items: QuoteDraftItem[]
): string | null {
  const idToIndex = new Map<string, number>();

  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    if (!item) {
      continue;
    }

    if (idToIndex.has(item.clientId)) {
      return `${item.featureName} : 중복된 견적항목 식별자가 있습니다.`;
    }

    idToIndex.set(item.clientId, index);
  }

  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    if (!item) {
      continue;
    }

    if (item.itemType === "INCLUDED_FEATURE") {
      const parentClientId =
        item.parentPackageClientId;

      if (!parentClientId) {
        return `${item.featureName} : 부모 패키지가 없습니다.`;
      }

      const parentIndex =
        idToIndex.get(parentClientId);

      if (parentIndex === undefined) {
        return `${item.featureName} : 연결된 패키지를 찾을 수 없습니다.`;
      }

      const parent = items[parentIndex];

      if (
        !parent ||
        parent.itemType !== "PACKAGE"
      ) {
        return `${item.featureName} : 부모 항목이 패키지가 아닙니다.`;
      }

      if (parentIndex >= index) {
        return `${item.featureName} : 부모 패키지는 포함 기능보다 앞에 있어야 합니다.`;
      }

      if (item.standardRateId === null) {
        return `${item.featureName} : 포함 기능의 표준단가 ID가 없습니다.`;
      }
    } else if (
      item.parentPackageClientId !== null
    ) {
      return `${item.featureName} : 잘못된 패키지 연결 정보가 있습니다.`;
    }

    if (
      item.itemType === "PACKAGE" &&
      item.standardRateId === null
    ) {
      return `${item.featureName} : 패키지 표준단가 ID가 없습니다.`;
    }
  }

  return null;
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
