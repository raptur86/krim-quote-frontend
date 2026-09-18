import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateQuoteApi } from "../api/quoteApi";
import { quoteKeys } from "./useQuotes";

import type {
  QuoteUpdateRequest,
} from "../types/quote.types";

type UpdateQuoteVariables = {
  quoteId: number;
  request: QuoteUpdateRequest;
};

export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quoteId,
      request,
    }: UpdateQuoteVariables) =>
      updateQuoteApi(quoteId, request),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: quoteKeys.detail(
            variables.quoteId,
          ),
        }),

        queryClient.invalidateQueries({
          queryKey: quoteKeys.lists(),
        }),
      ]);
    },
  });
}