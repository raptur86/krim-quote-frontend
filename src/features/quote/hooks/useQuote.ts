import { useQuery } from "@tanstack/react-query";

import {
  getQuoteApi,
} from "../api/quoteApi";

import {
  quoteKeys,
} from "./useQuotes";


export function useQuote(
  quoteId: number,
) {
  return useQuery({
    queryKey:
      quoteKeys.detail(quoteId),

    queryFn: () =>
      getQuoteApi(quoteId),

    enabled:
      Number.isFinite(quoteId) &&
      quoteId > 0,
  });
}