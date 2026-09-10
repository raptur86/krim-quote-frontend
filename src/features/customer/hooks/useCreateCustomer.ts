import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCustomerApi } from "../api/customerApi";
import type { CustomerCreateRequest } from "../types/customer.types";
import { customerKeys } from "./useCustomers";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CustomerCreateRequest) =>
      createCustomerApi(request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customerKeys.lists(),
      });
    },
  });
}