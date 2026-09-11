import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { changeCustomerActiveApi } from "../api/customerApi";

import type {
  CustomerDetail,
} from "../types/customer.types";

import { customerKeys } from "./useCustomers";

type ChangeCustomerActiveVariables = {
  customerId: number;
  active: boolean;
};

export function useChangeCustomerActive() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      active,
    }: ChangeCustomerActiveVariables) =>
      changeCustomerActiveApi(
        customerId,
        {
          active,
        },
      ),

    onSuccess: async (
      result,
    ) => {
      queryClient.setQueryData<CustomerDetail>(
        customerKeys.detail(
          result.id,
        ),
        (previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,
            active:
              result.active,
          };
        },
      );

      await queryClient.invalidateQueries({
        queryKey:
          customerKeys.lists(),
      });
    },
  });
}