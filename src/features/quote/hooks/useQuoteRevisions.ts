
import { useQuery } from "@tanstack/react-query";

import { getQuoteRevisionsApi } from "../api/quoteApi";

import { quoteKeys } from "./useQuotes";

export function useQuoteRevisions(
  quoteId: number | null | undefined,
) {
  return useQuery({
    queryKey: quoteKeys.revision(quoteId ?? 0),

    queryFn: () => {
      if (quoteId == null || quoteId <= 0) {
        throw new Error(
          "유효하지 않은 견적 ID이다.",
        );
      }

      return getQuoteRevisionsApi(quoteId);
    },

    enabled: quoteId != null && quoteId > 0,
  });
}
