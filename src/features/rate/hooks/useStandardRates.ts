import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  changeRateCategoryActiveApi,
  changeStandardRateActiveApi,
  createRateCategoryApi,
  createStandardRateApi,
  getRateCategoriesApi,
  getStandardRateApi,
  getStandardRatesApi,
  updateRateCategoryApi,
  updateStandardRateApi,
} from "../api/rateApi";

import type {
  CreateRateCategoryRequest,
  StandardRateListParams,
  StandardRateSaveRequest,
  UpdateRateCategoryRequest,
} from "../types/rate.types";


/* =========================================================
   Query Keys
========================================================= */

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

  details: () =>
    [...standardRateKeys.all, "detail"] as const,

  detail: (rateId: number) =>
    [
      ...standardRateKeys.details(),
      rateId,
    ] as const,
};


export const rateCategoryKeys = {
  all: ["rate-categories"] as const,

  lists: () =>
    [...rateCategoryKeys.all, "list"] as const,

  list: (active?: boolean) =>
    [
      ...rateCategoryKeys.lists(),
      { active },
    ] as const,
};


/* =========================================================
   Rate Category Query
========================================================= */

export function useRateCategories(
  active?: boolean,
) {
  return useQuery({
    queryKey:
      rateCategoryKeys.list(active),

    queryFn: () =>
      getRateCategoriesApi(active),
  });
}


/* =========================================================
   Rate Category Mutations
========================================================= */

export function useCreateRateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      request: CreateRateCategoryRequest,
    ) =>
      createRateCategoryApi(request),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: rateCategoryKeys.all,
      });
    },
  });
}


export function useUpdateRateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      request,
    }: {
      categoryId: number;
      request: UpdateRateCategoryRequest;
    }) =>
      updateRateCategoryApi(
        categoryId,
        request,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: rateCategoryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: standardRateKeys.lists(),
      });
    },
  });
}


export function useChangeRateCategoryActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      active,
    }: {
      categoryId: number;
      active: boolean;
    }) =>
      changeRateCategoryActiveApi(
        categoryId,
        { active },
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: rateCategoryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: standardRateKeys.lists(),
      });
    },
  });
}


/* =========================================================
   Standard Rate Queries
========================================================= */

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


export function useStandardRate(
  rateId: number,
) {
  return useQuery({
    queryKey:
      standardRateKeys.detail(rateId),

    queryFn: () =>
      getStandardRateApi(rateId),

    enabled:
      Number.isInteger(rateId) &&
      rateId > 0,
  });
}


/* =========================================================
   Standard Rate Mutations
========================================================= */

export function useCreateStandardRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      request: StandardRateSaveRequest,
    ) =>
      createStandardRateApi(request),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: standardRateKeys.lists(),
      });
    },
  });
}


export function useUpdateStandardRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rateId,
      request,
    }: {
      rateId: number;
      request: StandardRateSaveRequest;
    }) =>
      updateStandardRateApi(
        rateId,
        request,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: standardRateKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey:
          standardRateKeys.detail(
            variables.rateId,
          ),
      });
    },
  });
}


export function useChangeStandardRateActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rateId,
      active,
    }: {
      rateId: number;
      active: boolean;
    }) =>
      changeStandardRateActiveApi(
        rateId,
        { active },
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: standardRateKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey:
          standardRateKeys.detail(
            variables.rateId,
          ),
      });
    },
  });
}