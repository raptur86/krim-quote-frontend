import type {
  QuoteDraftItem,
} from "../types/quote.types";


export function calculateQuoteItemAmount(
  item: Pick<
    QuoteDraftItem,
    | "quoteUnitPrice"
    | "quantity"
    | "difficultyRate"
    | "adjustmentAmount"
  >,
): number {
  const calculatedAmount =
    item.quoteUnitPrice *
    item.quantity *
    item.difficultyRate;

  return Math.round(
    calculatedAmount +
      item.adjustmentAmount,
  );
}


export function calculateQuoteItemsAmount(
  items: QuoteDraftItem[],
): number {
  return items.reduce(
    (total, item) =>
      total +
      calculateQuoteItemAmount(item),
    0,
  );
}