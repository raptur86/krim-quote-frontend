
import type {
  QuoteDraftItem,
} from "../types/quote.types";

type CalculableQuoteItem = Pick<
  QuoteDraftItem,
  | "itemType"
  | "quoteUnitPrice"
  | "quantity"
  | "difficultyRate"
  | "adjustmentAmount"
>;

export function calculateQuoteItemAmount(
  item: CalculableQuoteItem
): number {
  if (item.itemType === "INCLUDED_FEATURE") {
    return 0;
  }

  const calculatedAmount =
    item.quoteUnitPrice *
    item.quantity *
    item.difficultyRate;

  return Math.round(
    calculatedAmount + (item.adjustmentAmount ?? 0)
  );
}

export function calculateQuoteItemsAmount(
  items: QuoteDraftItem[]
): number {
  return items.reduce(
    (total, item) =>
      total + calculateQuoteItemAmount(item),
    0
  );
}
