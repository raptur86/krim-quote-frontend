
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Pencil,
  Trash2,
} from "lucide-react";

import type { QuoteDraftItem } from "../types/quote.types";
import { calculateQuoteItemAmount } from "../utils/quoteCalculation";

import "./QuoteItemTable.css";

type Props = {
  items: QuoteDraftItem[];
  onChange: (items: QuoteDraftItem[]) => void;
  onEdit: (item: QuoteDraftItem) => void;
  onDelete: (clientId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
};

type DisplayRow = {
  item: QuoteDraftItem;
  originalIndex: number;
  displayNumber: string;
  included: boolean;
};

export function QuoteItemTable({
  items,
  onChange,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Props) {
  const [collapsedPackages, setCollapsedPackages] =
    useState<string[]>([]);

  const rootItems = items.filter(
    (item) => item.itemType !== "INCLUDED_FEATURE"
  );

  const displayRows: DisplayRow[] = [];
  const displayedIds = new Set<string>();

  rootItems.forEach((root, rootIndex) => {
    const originalIndex = items.findIndex(
      (item) => item.clientId === root.clientId
    );

    displayRows.push({
      item: root,
      originalIndex,
      displayNumber: String(rootIndex + 1),
      included: false,
    });

    displayedIds.add(root.clientId);

    if (root.itemType !== "PACKAGE") {
      return;
    }

    const children = items.filter(
      (item) =>
        item.itemType === "INCLUDED_FEATURE" &&
        item.parentPackageClientId === root.clientId
    );

    if (collapsedPackages.includes(root.clientId)) {
      return;
    }

    children.forEach((child, childIndex) => {
      const childOriginalIndex = items.findIndex(
        (item) => item.clientId === child.clientId
      );

      displayRows.push({
        item: child,
        originalIndex: childOriginalIndex,
        displayNumber: `${rootIndex + 1}-${childIndex + 1}`,
        included: true,
      });

      displayedIds.add(child.clientId);
    });
  });

  // 연결이 끊어진 포함 기능도 숨기지 않고 표시한다.
  const orphanItems = items.filter(
    (item) =>
      item.itemType === "INCLUDED_FEATURE" &&
      !items.some(
        (parent) =>
          parent.itemType === "PACKAGE" &&
          parent.clientId === item.parentPackageClientId
      )
  );

  orphanItems.forEach((item, index) => {
    displayRows.push({
      item,
      originalIndex: items.findIndex(
        (entry) => entry.clientId === item.clientId
      ),
      displayNumber: `!${index + 1}`,
      included: true,
    });

    displayedIds.add(item.clientId);
  });

  function togglePackage(clientId: string) {
    setCollapsedPackages((previous) =>
      previous.includes(clientId)
        ? previous.filter((id) => id !== clientId)
        : [...previous, clientId]
    );
  }

  function updateItem(
    clientId: string,
    changes: Partial<QuoteDraftItem>
  ) {
    const nextItems = items.map((item) => {
      if (item.clientId !== clientId) {
        return item;
      }

      if (item.itemType === "INCLUDED_FEATURE") {
        return item;
      }

      return {
        ...item,
        ...changes,
      };
    });

    onChange(nextItems);
  }

  if (items.length === 0) {
    return (
      <div className="quote-item-empty">
        <span className="quote-item-empty-icon">
          <ClipboardList
            size={28}
            aria-hidden="true"
          />
        </span>

        <strong>
          아직 추가된 견적항목이 없습니다.
        </strong>

        <p>
          표준단가에서 패키지나 개별 기능을
          선택하거나 직접 항목을 추가한다.
        </p>
      </div>
    );
  }

  return (
    <div className="quote-item-table-wrapper">
      <table className="quote-item-table quote-item-table-package">
        <thead>
          <tr>
            <th scope="col">순서</th>
            <th scope="col">구분</th>
            <th scope="col">기능정보</th>

            <th
              scope="col"
              className="quote-item-align-right"
            >
              단가
            </th>

            <th
              scope="col"
              className="quote-item-align-right"
            >
              수량
            </th>

            <th
              scope="col"
              className="quote-item-align-center"
            >
              난이도
            </th>

            <th
              scope="col"
              className="quote-item-align-right"
            >
              조정금액
            </th>

            <th
              scope="col"
              className="quote-item-align-right"
            >
              항목금액
            </th>

            <th
              scope="col"
              className="quote-item-align-center"
            >
              관리
            </th>
          </tr>
        </thead>

        <tbody>
          {displayRows.map(
            ({
              item,
              originalIndex,
              displayNumber,
              included,
            }) => {
              const itemType =
                item.itemType ?? "FEATURE";

              const isPackage =
                itemType === "PACKAGE";

              const isIncluded =
                itemType === "INCLUDED_FEATURE";

              const isAdditional =
                itemType === "ADDITIONAL_FEATURE";

              const collapsed =
                collapsedPackages.includes(
                  item.clientId
                );

              const childrenCount = isPackage
                ? items.filter(
                    (child) =>
                      child.itemType ===
                        "INCLUDED_FEATURE" &&
                      child.parentPackageClientId ===
                        item.clientId
                  ).length
                : 0;

              const rootIndex = rootItems.findIndex(
                (root) =>
                  root.clientId === item.clientId
              );

              const amount =
                calculateQuoteItemAmount(item);

              const isOrphan =
                isIncluded &&
                !items.some(
                  (parent) =>
                    parent.itemType === "PACKAGE" &&
                    parent.clientId ===
                      item.parentPackageClientId
                );

              return (
                <tr
                  key={item.clientId}
                  className={[
                    isPackage
                      ? "quote-item-package-row"
                      : "",
                    isIncluded
                      ? "quote-item-included-row"
                      : "",
                    isAdditional
                      ? "quote-item-additional-row"
                      : "",
                    isOrphan
                      ? "quote-item-orphan-row"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <td>
                    {included ? (
                      <span className="quote-item-child-number">
                        {displayNumber}
                      </span>
                    ) : (
                      <div className="quote-item-order">
                        <button
                          type="button"
                          className="quote-item-order-button"
                          disabled={rootIndex <= 0}
                          onClick={() =>
                            onMoveUp(originalIndex)
                          }
                          aria-label={`${item.featureName} 위로 이동`}
                          title="위로 이동"
                        >
                          <ArrowUp
                            size={14}
                            aria-hidden="true"
                          />
                        </button>

                        <span className="quote-item-order-number">
                          {displayNumber}
                        </span>

                        <button
                          type="button"
                          className="quote-item-order-button"
                          disabled={
                            rootIndex >=
                            rootItems.length - 1
                          }
                          onClick={() =>
                            onMoveDown(originalIndex)
                          }
                          aria-label={`${item.featureName} 아래로 이동`}
                          title="아래로 이동"
                        >
                          <ArrowDown
                            size={14}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    )}
                  </td>

                  <td>
                    <span
                      className={[
                        "quote-item-type",
                        isPackage
                          ? "quote-item-type-package"
                          : isIncluded
                            ? "quote-item-type-included"
                            : isAdditional
                              ? "quote-item-type-additional"
                              : item.standardRateId !== null
                                ? "standard"
                                : "direct",
                      ].join(" ")}
                    >
                      {isPackage
                        ? "패키지"
                        : isIncluded
                          ? "포함"
                          : isAdditional
                            ? "추가 기능"
                            : item.standardRateId !== null
                              ? "표준"
                              : "직접"}
                    </span>
                  </td>

                  <td>
                    <div
                      className={[
                        "quote-item-feature",
                        isIncluded
                          ? "quote-item-feature-child"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="quote-item-feature-title">
                        {isPackage && (
                          <button
                            type="button"
                            className="quote-item-package-toggle"
                            onClick={() =>
                              togglePackage(
                                item.clientId
                              )
                            }
                            aria-expanded={!collapsed}
                            aria-label={`${item.featureName} 포함 기능 ${
                              collapsed
                                ? "펼치기"
                                : "접기"
                            }`}
                            title={
                              collapsed
                                ? "포함 기능 펼치기"
                                : "포함 기능 접기"
                            }
                          >
                            {collapsed ? (
                              <ChevronRight
                                size={17}
                                aria-hidden="true"
                              />
                            ) : (
                              <ChevronDown
                                size={17}
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        )}

                        {isIncluded && (
                          <span
                            className="quote-item-child-connector"
                            aria-hidden="true"
                          >
                            └
                          </span>
                        )}

                        <strong>
                          {item.featureName}
                        </strong>
                      </div>

                      {item.categoryName && (
                        <span className="quote-item-category">
                          {item.categoryName}
                        </span>
                      )}

                      {isPackage && (
                        <span className="quote-item-package-count">
                          포함 기능 {childrenCount}개
                        </span>
                      )}

                      {item.description && (
                        <p
                          className="quote-item-description"
                          title={item.description}
                        >
                          {item.description}
                        </p>
                      )}

                      {isIncluded &&
                        item.packageScopeSnapshot &&
                        item.packageScopeSnapshot !==
                          item.description && (
                          <p className="quote-item-description">
                            {item.packageScopeSnapshot}
                          </p>
                        )}

                      {isOrphan && (
                        <p className="quote-item-relation-error">
                          부모 패키지 연결 오류
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="quote-item-align-right quote-item-number">
                    {isIncluded
                      ? "-"
                      : formatMoney(
                          item.quoteUnitPrice
                        )}
                  </td>

                  <td className="quote-item-align-right">
                    {isIncluded ? (
                      <span className="quote-item-included-quantity">
                        {item.quantity}{" "}
                        {item.unitName ?? "건"}
                      </span>
                    ) : (
                      <div className="quote-item-inline-field">
                        <input
                          type="number"
                          min="0.01"
                          step="1"
                          value={item.quantity}
                          aria-label={`${item.featureName} 수량`}
                          onChange={(event) => {
                            const value = Number(
                              event.target.value
                            );

                            if (
                              Number.isFinite(value) &&
                              value > 0
                            ) {
                              updateItem(
                                item.clientId,
                                { quantity: value }
                              );
                            }
                          }}
                        />

                        <span>
                          {item.unitName ?? "건"}
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="quote-item-align-center">
                    {isIncluded ? (
                      <span className="quote-item-included-label">
                        포함
                      </span>
                    ) : (
                      <div className="quote-item-inline-difficulty">
                        <span>×</span>

                        <input
                          type="number"
                          min="0.01"
                          step="0.05"
                          value={item.difficultyRate}
                          aria-label={`${item.featureName} 난이도 계수`}
                          onChange={(event) => {
                            const value = Number(
                              event.target.value
                            );

                            if (
                              Number.isFinite(value) &&
                              value > 0
                            ) {
                              updateItem(
                                item.clientId,
                                {
                                  difficultyRate:
                                    value,
                                }
                              );
                            }
                          }}
                        />
                      </div>
                    )}
                  </td>

                  <td
                    className={[
                      "quote-item-align-right",
                      "quote-item-number",
                      "quote-item-adjustment",
                      (item.adjustmentAmount ?? 0) > 0
                        ? "positive"
                        : (item.adjustmentAmount ?? 0) < 0
                          ? "negative"
                          : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {isIncluded
                      ? "-"
                      : formatSignedMoney(
                          item.adjustmentAmount ?? 0
                        )}
                  </td>

                  <td className="quote-item-align-right quote-item-total">
                    {isIncluded ? (
                      <span className="quote-item-included-amount">
                        포함
                      </span>
                    ) : (
                      formatMoney(amount)
                    )}
                  </td>

                  <td>
                    {isIncluded ? (
                      <span className="quote-item-included-manage">
                        패키지 포함
                      </span>
                    ) : (
                      <div className="quote-item-actions">
                        <button
                          type="button"
                          className="quote-item-action-button edit"
                          onClick={() =>
                            onEdit(item)
                          }
                          aria-label={`${item.featureName} 수정`}
                          title="수정"
                        >
                          <Pencil
                            size={15}
                            aria-hidden="true"
                          />
                        </button>

                        <button
                          type="button"
                          className="quote-item-action-button delete"
                          onClick={() =>
                            onDelete(
                              item.clientId
                            )
                          }
                          aria-label={`${item.featureName} 삭제`}
                          title="삭제"
                        >
                          <Trash2
                            size={15}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatMoney(value: number): string {
  return `${Math.round(value).toLocaleString(
    "ko-KR"
  )}원`;
}

function formatSignedMoney(value: number): string {
  if (value === 0) {
    return "0원";
  }

  const sign = value > 0 ? "+" : "-";

  return `${sign}${Math.abs(value).toLocaleString(
    "ko-KR"
  )}원`;
}
