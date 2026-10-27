
import type {
  QuoteDetailItem,
  QuoteDraftItem,
  QuoteItemRequest,
} from "../types/quote.types";

function nullableText(
  value: string | null | undefined
): string | null {
  return value?.trim() || null;
}

function requireValidNumber(
  value: number,
  label: string,
  min: number
): void {
  if (!Number.isFinite(value) || value < min) {
    throw new Error(
      `${label} : ${min} 이상의 유효한 숫자여야 합니다.`
    );
  }
}

/**
 * 서버의 견적 상세 항목을
 * 프론트엔드 편집 항목으로 복원한다.
 *
 * parentPackageItemId는 DB 항목 ID이고,
 * parentPackageClientId는 화면에서 사용하는 ID이다.
 */
export function toQuoteDraftItems(
  items: QuoteDetailItem[]
): QuoteDraftItem[] {
  const ordered = [...items].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  const packageIds = new Set(
    ordered
      .filter((item) => item.itemType === "PACKAGE")
      .map((item) => item.id)
  );

  const itemIds = new Set<number>();

  return ordered.map((item) => {
    if (itemIds.has(item.id)) {
      throw new Error(
        `중복된 견적항목 ID입니다 : ${item.id}`
      );
    }

    itemIds.add(item.id);

    const itemType = item.itemType ?? "FEATURE";
    const parentId =
      item.parentPackageItemId ?? null;

    if (itemType === "INCLUDED_FEATURE") {
      if (
        parentId === null ||
        !packageIds.has(parentId)
      ) {
        throw new Error(
          `${item.featureName} : 부모 패키지를 찾을 수 없습니다.`
        );
      }
    } else if (parentId !== null) {
      throw new Error(
        `${item.featureName} : 패키지 포함 기능이 아닌 항목에 부모 패키지가 지정되어 있습니다.`
      );
    }

    return {
      clientId: `quote-item-${item.id}`,

      standardRateId: item.standardRateId ?? null,
      categoryName: item.categoryName ?? null,

      featureName: item.featureName,
      description: item.description ?? null,

      quoteUnitPrice:
        itemType === "INCLUDED_FEATURE"
          ? 0
          : item.quoteUnitPrice,

      quantity: item.quantity,
      unitName: item.unitName ?? "건",

      difficultyCode:
        itemType === "INCLUDED_FEATURE"
          ? null
          : item.difficultyCode ?? "NORMAL",

      difficultyRate:
        itemType === "INCLUDED_FEATURE"
          ? 1
          : item.difficultyRate,

      adjustmentAmount:
        itemType === "INCLUDED_FEATURE"
          ? 0
          : item.adjustmentAmount ?? 0,

      adjustmentReason:
        itemType === "INCLUDED_FEATURE"
          ? null
          : item.adjustmentReason ?? null,

      estimatedHours: item.estimatedHours ?? 0,
      internalMemo: item.internalMemo ?? null,

      sortOrder: item.sortOrder,
      itemType,

      parentPackageClientId:
        itemType === "INCLUDED_FEATURE" &&
        parentId !== null
          ? `quote-item-${parentId}`
          : null,

      parentPackageItemIndex: null,

      packageScopeSnapshot:
        itemType === "INCLUDED_FEATURE"
          ? item.packageScopeSnapshot ?? null
          : null,
    };
  });
}

/**
 * 편집용 견적항목을 서버 요청 항목으로 변환한다.
 *
 * 주의 :
 * parentPackageItemIndex는 sortOrder가 아니라
 * 최종 items 배열의 0부터 시작하는 인덱스이다.
 */
export function toQuoteItemRequests(
  items: QuoteDraftItem[]
): QuoteItemRequest[] {
  const indexByClientId = new Map<string, number>();

  items.forEach((item, index) => {
    if (!item.clientId?.trim()) {
      throw new Error(
        `${index + 1}번째 견적항목의 식별자가 없습니다.`
      );
    }

    if (indexByClientId.has(item.clientId)) {
      throw new Error(
        `${item.featureName} : 중복된 견적항목 식별자입니다.`
      );
    }

    indexByClientId.set(item.clientId, index);
  });

  return items.map((item, index) => {
    const itemType = item.itemType ?? "FEATURE";
    const featureName = item.featureName.trim();

    if (!featureName) {
      throw new Error(
        `${index + 1}번째 견적항목의 기능명을 입력해주세요.`
      );
    }

    requireValidNumber(
      item.quoteUnitPrice,
      `${featureName}의 단가`,
      0
    );

    requireValidNumber(
      item.quantity,
      `${featureName}의 수량`,
      Number.EPSILON
    );

    requireValidNumber(
      item.difficultyRate,
      `${featureName}의 난이도 계수`,
      Number.EPSILON
    );

    requireValidNumber(
      item.adjustmentAmount ?? 0,
      `${featureName}의 조정금액`,
      Number.NEGATIVE_INFINITY
    );

    requireValidNumber(
      item.estimatedHours ?? 0,
      `${featureName}의 예상 작업시간`,
      0
    );

    if (
      itemType !== "FEATURE" &&
      itemType !== "PACKAGE" &&
      itemType !== "INCLUDED_FEATURE" &&
      itemType !== "ADDITIONAL_FEATURE"
    ) {
      throw new Error(
        `${featureName} : 지원하지 않는 견적항목 유형입니다.`
      );
    }

    let parentPackageItemIndex: number | null = null;

    if (itemType === "PACKAGE") {
      if (item.standardRateId == null) {
        throw new Error(
          `${featureName} : 패키지 표준단가 ID가 없습니다.`
        );
      }
    }

    if (itemType === "INCLUDED_FEATURE") {
      if (item.standardRateId == null) {
        throw new Error(
          `${featureName} : 포함 기능의 표준단가 ID가 없습니다.`
        );
      }

      const parentClientId =
        item.parentPackageClientId;

      const parentIndex =
        parentClientId == null
          ? undefined
          : indexByClientId.get(parentClientId);

      if (parentIndex === undefined) {
        throw new Error(
          `${featureName} : 부모 패키지를 찾을 수 없습니다.`
        );
      }

      const parent = items[parentIndex];

      if (parent.itemType !== "PACKAGE") {
        throw new Error(
          `${featureName} : 부모 항목이 패키지가 아닙니다.`
        );
      }

      if (parentIndex >= index) {
        throw new Error(
          `${featureName} : 부모 패키지는 포함 기능보다 앞에 있어야 합니다.`
        );
      }

      parentPackageItemIndex = parentIndex;
    } else if (item.parentPackageClientId != null) {
      throw new Error(
        `${featureName} : 패키지 포함 기능이 아닌 항목에 부모 패키지가 지정되어 있습니다.`
      );
    }

    const included = itemType === "INCLUDED_FEATURE";

    const adjustmentAmount = included
      ? 0
      : item.adjustmentAmount ?? 0;

    const adjustmentReason = included
      ? null
      : nullableText(item.adjustmentReason);

    if (
      adjustmentAmount !== 0 &&
      adjustmentReason === null
    ) {
      throw new Error(
        `${featureName} : 조정금액이 있는 경우 조정사유를 입력해주세요.`
      );
    }

    return {
      standardRateId: item.standardRateId ?? null,

      categoryName: nullableText(item.categoryName),
      featureName,
      description: nullableText(item.description),

      quoteUnitPrice: included
        ? 0
        : item.quoteUnitPrice,

      quantity: item.quantity,
      unitName: nullableText(item.unitName),

      difficultyCode: included
        ? null
        : item.difficultyCode,

      difficultyRate: included
        ? 1
        : item.difficultyRate,

      adjustmentAmount,
      adjustmentReason,

      estimatedHours: included
        ? 0
        : item.estimatedHours ?? 0,

      internalMemo: nullableText(item.internalMemo),

      sortOrder: index + 1,
      itemType,
      parentPackageItemIndex,

      packageScopeSnapshot: included
        ? nullableText(item.packageScopeSnapshot)
        : null,
    };
  });
}
