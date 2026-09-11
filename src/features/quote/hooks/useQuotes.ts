import { useQuery } from "@tanstack/react-query";

import { getQuotesApi } from "../api/quoteApi";

import type {
  QuoteListParams,
} from "../types/quote.types";


export const quoteKeys = {
  all: ["quotes"] as const,

  lists: () =>
    [...quoteKeys.all, "list"] as const,

  list: (params?: QuoteListParams) =>
    [...quoteKeys.lists(), params] as const,

  details: () =>
    [...quoteKeys.all, "detail"] as const,

  detail: (quoteId: number) =>
    [...quoteKeys.details(), quoteId] as const,
};


export function useQuotes(
  params?: QuoteListParams,
) {
  return useQuery({
    queryKey: quoteKeys.list(params),

    queryFn: () =>
      getQuotesApi(params),
  });
}