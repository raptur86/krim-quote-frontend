import { useQuery } from "@tanstack/react-query";
import { getDashboardApi } from "../api/dashboardApi";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  month: (year: number, month: number) => ["dashboard", year, month] as const,
};

export function useDashboard(year: number, month: number) {
  return useQuery({
    queryKey: dashboardKeys.month(year, month),
    queryFn: () => getDashboardApi(year, month),
    enabled: Number.isInteger(year) && year >= 2000 && Number.isInteger(month) && month >= 1 && month <= 12,
  });
}
