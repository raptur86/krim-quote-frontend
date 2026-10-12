
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getQuoteSalesApi,
  getSalesDetailApi,
  createSalesApi,
  updateSalesApi,
} from "../api/salesApi";

import type {
  SalesDetail,
  SalesSaveRequest,
} from "../types/sales.types";

/**
 * 매출 관련 Query Key
 */
export const salesKeys = {
  all: ["sales"] as const,

  quoteList: (quoteId: number) =>
    [...salesKeys.all, "quote", quoteId] as const,

  detail: (salesId: number) =>
    [...salesKeys.all, "detail", salesId] as const,
};

/**
 * 견적별 매출 목록 조회
 */
export function useQuoteSales(quoteId: number) {
  return useQuery({
    queryKey: salesKeys.quoteList(quoteId),
    queryFn: () => getQuoteSalesApi(quoteId),
    enabled: Number.isInteger(quoteId) && quoteId > 0,
  });
}

/**
 * 매출 상세 조회
 */
export function useSalesDetail(
  salesId: number | null,
) {
  return useQuery({
    queryKey: salesKeys.detail(salesId ?? 0),
    queryFn: () => getSalesDetailApi(salesId!),
    enabled:
      salesId !== null &&
      Number.isInteger(salesId) &&
      salesId > 0,
  });
}

/**
 * 매출 등록
 */
type CreateSalesVariables = {
  quoteId: number;
  request: SalesSaveRequest;
};

export function useCreateSales() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quoteId,
      request,
    }: CreateSalesVariables) =>
      createSalesApi(quoteId, request),

    onSuccess: (_data, variables) => {
      // 해당 견적의 매출 목록 갱신
      queryClient.invalidateQueries({
        queryKey: salesKeys.quoteList(
          variables.quoteId,
        ),
      });

      // 견적 관련 합계나 상태가 변경될 수 있으므로
      // 기존 견적 캐시도 갱신
      queryClient.invalidateQueries({
        queryKey: ["quotes"],
      });
    },
  });
}

/**
 * 매출 수정
 */
type UpdateSalesVariables = {
  salesId: number;
  quoteId: number;
  request: SalesSaveRequest;
};

export function useUpdateSales() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      salesId,
      request,
    }: UpdateSalesVariables) =>
      updateSalesApi(salesId, request),

    onSuccess: (
      data: SalesDetail,
      variables,
    ) => {
      // 수정한 매출 상세 캐시 갱신
      queryClient.setQueryData(
        salesKeys.detail(variables.salesId),
        data,
      );

      // 해당 견적의 매출 목록 갱신
      queryClient.invalidateQueries({
        queryKey: salesKeys.quoteList(
          variables.quoteId,
        ),
      });

      // 견적 관련 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: ["quotes"],
      });
    },
  });
}
