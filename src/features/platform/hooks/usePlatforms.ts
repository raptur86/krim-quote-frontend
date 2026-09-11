import { useQuery } from "@tanstack/react-query";
import { getPlatformsApi } from "../api/platformApi";

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