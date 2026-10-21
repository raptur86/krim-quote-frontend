
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { copyQuoteApi } from "../api/quoteApi";

import type {
  QuoteCopyType,
} from "../types/quote.types";

import { quoteKeys } from "./useQuotes";

type CopyQuoteVariables = {
  quoteId: number;
  copyType: QuoteCopyType;
};

export function useCopyQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quoteId,
      copyType,
    }: CopyQuoteVariables) =>
      copyQuoteApi(quoteId, {
        copyType,
      }),

    onSuccess: async (result) => {
      await Promise.all([
        // 견적 목록 갱신
        queryClient.invalidateQueries({
          queryKey: quoteKeys.lists(),
        }),

        // 새로 생성된 견적 상세 갱신
        queryClient.invalidateQueries({
          queryKey: quoteKeys.detail(result.quoteId),
        }),

        // 원본 견적 상세 갱신
        ...(result.originalQuoteId != null
          ? [
              queryClient.invalidateQueries({
                queryKey: quoteKeys.detail(
                  result.originalQuoteId,
                ),
              }),
            ]
          : []),

        // 개정 이력 전체 갱신
        queryClient.invalidateQueries({
          queryKey: quoteKeys.revisions(),
        }),
      ]);
    },
  });
}
