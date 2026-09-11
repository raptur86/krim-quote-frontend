import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createQuoteApi,
} from "../api/quoteApi";

import type {
  QuoteCreateRequest,
} from "../types/quote.types";

import {
  quoteKeys,
} from "./useQuotes";


export function useCreateQuote() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      request: QuoteCreateRequest,
    ) =>
      createQuoteApi(request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          quoteKeys.lists(),
      });
    },
  });
}