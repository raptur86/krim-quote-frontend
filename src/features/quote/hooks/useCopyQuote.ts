
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { copyQuoteApi } from "../api/quoteApi";
import { quoteKeys } from "./useQuotes";

export function useCopyQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteId: number) =>
      copyQuoteApi(quoteId),

    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: quoteKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: quoteKeys.detail(result.id),
        }),
      ]);
    },
  });
}
