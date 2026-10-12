import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getPlatformsApi,
  createPlatformApi,
  updatePlatformApi,
  changePlatformActiveApi,
  updatePublicInfoPolicyApi,
} from "../api/platformApi";

import type {
  PlatformSaveRequest,
  PlatformActiveRequest,
  UpdatePublicInfoPolicyRequest,
} from "../types/platform.types";

export const platformKeys = {
  all: ["platforms"] as const,

  list: (active?: boolean) =>
    [
      ...platformKeys.all,
      "list",
      { active },
    ] as const,
};

export function usePlatforms(
  active?: boolean,
) {
  return useQuery({
    queryKey:
      platformKeys.list(active),

    queryFn: () =>
      getPlatformsApi(active),
  });
}

export function useUpdatePublicInfoPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      platformId,
      request,
    }: {
      platformId: number;
      request: UpdatePublicInfoPolicyRequest;
    }) =>
      updatePublicInfoPolicyApi(
        platformId,
        request,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformKeys.all,
      });
    },
  });
}
export function useCreatePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      request: PlatformSaveRequest,
    ) => createPlatformApi(request),

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: platformKeys.all,
      });
    },
  });
}


/* =========================================================
   플랫폼 수정
========================================================= */

export function useUpdatePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      platformId,
      request,
    }: {
      platformId: number;
      request: PlatformSaveRequest;
    }) =>
      updatePlatformApi(
        platformId,
        request,
      ),

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: platformKeys.all,
      });
    },
  });
}


/* =========================================================
   플랫폼 활성/비활성
========================================================= */

export function useChangePlatformActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      platformId,
      active,
    }: {
      platformId: number;
      active: boolean;
    }) => {
      const request: PlatformActiveRequest = {
        active,
      };

      return changePlatformActiveApi(
        platformId,
        request,
      );
    },

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: platformKeys.all,
      });
    },
  });
}