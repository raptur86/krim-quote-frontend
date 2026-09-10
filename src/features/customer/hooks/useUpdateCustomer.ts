import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCustomerApi } from "../api/customerApi";
import type { CustomerUpdateRequest } from "../types/customer.types";
import { customerKeys } from "./useCustomers";

type UpdateCustomerVariables = {
  customerId: number;
  request: CustomerUpdateRequest;
};

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      request,
    }: UpdateCustomerVariables) =>
      updateCustomerApi(customerId, request),

    onSuccess: async (customer) => {
      queryClient.setQueryData(
        customerKeys.detail(customer.id),
        customer,
      );

      await queryClient.invalidateQueries({
        queryKey: customerKeys.lists(),
      });
    },
  });
}