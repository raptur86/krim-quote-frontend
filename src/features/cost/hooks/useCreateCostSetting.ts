import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createCostSettingApi,
} from "../api/costApi";

import type {
  CostSettingCreateRequest,
} from "../types/cost.types";

import {
  costKeys,
} from "./useCostSettings";

export function useCreateCostSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      request: CostSettingCreateRequest,
    ) => createCostSettingApi(request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: costKeys.settings(),
      });
    },
  });
}