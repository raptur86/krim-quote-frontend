import { useQuery } from "@tanstack/react-query";
import { getCostSettingsApi } from "../api/costApi";

export const costKeys = {
  all: ["cost"] as const,

  settings: () =>
    [...costKeys.all, "settings"] as const,
};

export function useCostSettings() {
  return useQuery({
    queryKey: costKeys.settings(),
    queryFn: getCostSettingsApi,
  });
}