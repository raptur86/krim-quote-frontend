import { useQuery } from "@tanstack/react-query";

import { getCustomerApi } from "../api/customerApi";
import { customerKeys } from "./useCustomers";

export function useCustomer(customerId: number) {
  return useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: () => getCustomerApi(customerId),
    enabled: customerId > 0,
  });
}