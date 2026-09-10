import { useQuery } from "@tanstack/react-query";

import { getCustomersApi } from "../api/customerApi";
import type { CustomerListParams } from "../types/customer.types";

export const customerKeys = {
  all: ["customers"] as const,

  lists: () => [...customerKeys.all, "list"] as const,

  list: (params?: CustomerListParams) =>
    [...customerKeys.lists(), params] as const,

  details: () => [...customerKeys.all, "detail"] as const,

  detail: (customerId: number) =>
    [...customerKeys.details(), customerId] as const,
};

export function useCustomers(params?: CustomerListParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => getCustomersApi(params),
  });
}