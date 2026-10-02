import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getPlatformsApi,
  updatePublicInfoPolicyApi,
} from "../api/platformApi";

import type {
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