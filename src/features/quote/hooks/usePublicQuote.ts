import { useQuery } from "@tanstack/react-query";
import { getPublicQuoteApi } from "../api/publicQuoteApi";

export const publicQuoteKeys = {
  all: ["public-quotes"] as const,

  detail: (token: string) =>
    [...publicQuoteKeys.all, token] as const,
};

export function usePublicQuote(
  token: string | undefined,
) {
  return useQuery({
    queryKey: publicQuoteKeys.detail(token ?? ""),
    queryFn: () => getPublicQuoteApi(token!),
    enabled: Boolean(token),
    retry: false,
  });
}