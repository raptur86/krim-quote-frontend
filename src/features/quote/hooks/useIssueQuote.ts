import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  issueQuoteApi,
} from "../api/quoteApi";

import {
  quoteKeys,
} from "./useQuotes";


export function useIssueQuote() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      quoteId: number,
    ) =>
      issueQuoteApi(
        quoteId,
      ),

    onSuccess: async (
      _,
      quoteId,
    ) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            quoteKeys.detail(
              quoteId,
            ),
        }),

        queryClient.invalidateQueries({
          queryKey:
            quoteKeys.lists(),
        }),
      ]);
    },
  });
}