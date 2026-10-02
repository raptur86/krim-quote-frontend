import { apiClient } from "../../../services/apiClient";

import type {
  ApiResponse,
} from "../../../types/api.types";

import type {
  ChangeActiveRequest,
  CreateRateCategoryRequest,
  RateCategory,
  StandardRateDetail,
  StandardRateListParams,
  StandardRatePageResponse,
  StandardRateSaveRequest,
  UpdateRateCategoryRequest,
} from "../types/rate.types";


/* =========================================================
   Rate Category
========================================================= */

export async function getRateCategoriesApi(
  active?: boolean,
): Promise<RateCategory[]> {
  const { data } = await apiClient.get<
    ApiResponse<RateCategory[]>
  >(
    "/rate-categories",
    {
      params: {
        active,
      },
    },
  );

  if (!data.success || !data.data) {
    throw new Error(
      data.message ||
        "표준단가 카테고리를 불러오지 못했습니다.",
    );
  }

  return data.data;
}


export async function createRateCategoryApi(
  request: CreateRateCategoryRequest,
): Promise<RateCategory> {
  const { data } = await apiClient.post<
    ApiResponse<RateCategory>
  >(
    "/rate-categories",
    request,
  );

  if (!data.success || !data.data) {
    throw new Error(
      data.message ||
        "표준단가 카테고리를 등록하지 못했습니다.",
    );
  }

  return data.data;
}


export async function updateRateCategoryApi(
  categoryId: number,
  request: UpdateRateCategoryRequest,
): Promise<RateCategory> {
  const { data } = await apiClient.put<
    ApiResponse<RateCategory>
  >(
    `/rate-categories/${categoryId}`,
    request,
  );

  if (!data.success || !data.data) {
    throw new Error(
      data.message ||
        "표준단가 카테고리를 수정하지 못했습니다.",
    );
  }

  return data.data;
}


export async function changeRateCategoryActiveApi(
  categoryId: number,
  request: ChangeActiveRequest,
): Promise<RateCategory> {
  const { data } = await apiClient.patch<
    ApiResponse<RateCategory>
  >(
    `/rate-categories/${categoryId}/active`,
    request,
  );

  if (!data.success || !data.data) {
    throw new Error(
      data.message ||
        "표준단가 카테고리 상태를 변경하지 못했습니다.",
    );
  }

  return data.data;
}


/* =========================================================
   Standard Rate
========================================================= */

export async function getStandardRatesApi(
  params?: StandardRateListParams,
): Promise<StandardRatePageResponse> {
  const { data } = await apiClient.get<
    ApiResponse<StandardRatePageResponse>
  >(
    "/standard-rates",
    {
      params,
    },
  );

  if (!data.success || !data.data) {
    throw new Error(
      data.message ||
        "표준단가 목록을 불러오지 못했습니다.",
    );
  }

  return data.data;
}


export async function getStandardRateApi(
  rateId: number,
): Promise<StandardRateDetail> {
  const { data } = await apiClient.get<
    ApiResponse<StandardRateDetail>
  >(
    `/standard-rates/${rateId}`,
  );

  if (!data.success || !data.data) {
    throw new Error(
      data.message ||
        "표준단가 정보를 불러오지 못했습니다.",
    );
  }

  return data.data;
}


export async function createStandardRateApi(
  request: StandardRateSaveRequest,
): Promise<StandardRateDetail> {
  const { data } = await apiClient.post<
    ApiResponse<StandardRateDetail>
  >(
    "/standard-rates",
    request,
  );

  if (!data.success || !data.data) {
    throw new Error(
      data.message ||
        "표준단가를 등록하지 못했습니다.",
    );
  }

  return data.data;
}


export async function updateStandardRateApi(
  rateId: number,
  request: StandardRateSaveRequest,
): Promise<StandardRateDetail> {
  const { data } = await apiClient.put<
    ApiResponse<StandardRateDetail>
  >(
    `/standard-rates/${rateId}`,
    request,
  );

  if (!data.success || !data.data) {
    throw new Error(
      data.message ||
        "표준단가를 수정하지 못했습니다.",
    );
  }

  return data.data;
}


export async function changeStandardRateActiveApi(
  rateId: number,
  request: ChangeActiveRequest,
): Promise<StandardRateDetail> {
  const { data } = await apiClient.patch<
    ApiResponse<StandardRateDetail>
  >(
    `/standard-rates/${rateId}/active`,
    request,
  );

  if (!data.success || !data.data) {
    throw new Error(
      data.message ||
        "표준단가 상태를 변경하지 못했습니다.",
    );
  }

  return data.data;
}