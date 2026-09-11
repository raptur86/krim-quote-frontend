import { useQuery } from "@tanstack/react-query";

import {
  getStandardRatesApi,
} from "../api/rateApi";

import type {
  StandardRateListParams,
} from "../types/rate.types";


export const standardRateKeys = {
  all: ["standard-rates"] as const,

  lists: () =>
    [...standardRateKeys.all, "list"] as const,

  list: (
    params?: StandardRateListParams,
  ) =>
    [
      ...standardRateKeys.lists(),
      params,
    ] as const,
};


export function useStandardRates(
  params?: StandardRateListParams,
) {
  return useQuery({
    queryKey:
      standardRateKeys.list(params),

    queryFn: () =>
      getStandardRatesApi(params),
  });
}