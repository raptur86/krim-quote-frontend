
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getBusinessProfileApi,
  updateBusinessProfileApi,
  uploadBusinessLogoApi,
} from "../api/businessApi";

import type {
  BusinessProfileUpdateRequest,
} from "../types/business.types";

/**
 * 사업자 정보 Query Key
 */
export const businessKeys = {
  all: ["business"] as const,

  profile: () =>
    [...businessKeys.all, "profile"] as const,
};

/**
 * 사업자 정보 조회
 *
 * GET /api/v1/business-profile
 */
export function useBusinessProfile() {
  return useQuery({
    queryKey: businessKeys.profile(),
    queryFn: getBusinessProfileApi,
  });
}

/**
 * 사업자 정보 수정
 *
 * PUT /api/v1/business-profile
 */
export function useUpdateBusinessProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      request: BusinessProfileUpdateRequest,
    ) => updateBusinessProfileApi(request),

    onSuccess: async () => {
      // 수정 응답에는 전체 사업자 정보가 없으므로
      // 상세 조회 캐시를 무효화하여 다시 조회한다.
      await queryClient.invalidateQueries({
        queryKey: businessKeys.profile(),
      });
    },
  });
}

/**
 * 사업자 로고 업로드
 *
 * POST /api/v1/business-profile/logo
 */
export function useUploadBusinessLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      uploadBusinessLogoApi(file),

    onSuccess: async () => {
      // 로고 URL을 포함한 사업자 정보를 다시 조회한다.
      await queryClient.invalidateQueries({
        queryKey: businessKeys.profile(),
      });
    },
  });
}
