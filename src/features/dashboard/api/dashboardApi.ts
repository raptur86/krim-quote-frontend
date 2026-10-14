import { apiClient } from "../../../services/apiClient";
import type { DashboardData } from "../types/dashboard.types";

type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T | null;
};

export async function getDashboardApi(year: number, month: number): Promise<DashboardData> {
  const { data } = await apiClient.get<ApiResponse<DashboardData>>("/dashboard", {
    params: { year, month },
  });
  if (!data.success || !data.data) {
    throw new Error(data.message || "대시보드 조회에 실패했습니다.");
  }
  return data.data;
}
