import { useQuery } from "@tanstack/react-query";
import { getAllSalesApi } from "../api/allSalesApi";

export function useAllSales() {
  return useQuery({
    queryKey: ["sales", "all-list"],
    queryFn: getAllSalesApi,
  });
}
