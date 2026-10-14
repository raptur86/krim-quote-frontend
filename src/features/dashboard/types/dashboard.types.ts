export type DashboardData = {
  period: { year: number; month: number };
  quoteSummary: {
    totalCount: number; draftCount: number; issuedCount: number;
    expiredCount: number; cancelledCount: number; issuedAmount: number;
  };
  salesSummary: {
    supplyAmount: number; salesVatAmount: number; totalSalesAmount: number;
    actualSettlementAmount: number; actualDeductionAmount: number;
  };
  profitabilitySummary: {
    estimatedCostAmount: number; estimatedProfitAmount: number;
    estimatedProfitRate: number;
  };
  yearSummary: {
    totalSalesAmount: number; salesVatAmount: number;
    actualSettlementAmount: number;
  };
  quarterSummary: {
    quarter: number; totalSalesAmount: number; salesVatAmount: number;
  };
  platformSummary: Array<{
    platformId: number | null; platformName: string;
    totalSalesAmount: number; actualSettlementAmount: number;
    actualDeductionAmount: number;
  }>;
  recentQuotes: Array<{
    id: number; quoteNumber: string; title: string; customerName: string;
    status: string; totalAmount: number; writtenDate: string;
  }>;
  recentSales: Array<{
    id: number; quoteId: number; quoteNumber: string; salesType: string;
    totalSalesAmount: number; actualSettlementAmount: number | null;
    salesDate: string;
  }>;
};
