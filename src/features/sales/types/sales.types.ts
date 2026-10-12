export type SalesType =
  | "FULL"
  | "DEPOSIT"
  | "INTERIM"
  | "BALANCE"
  | "OTHER";

export type SettlementStatus =
  | "EXPECTED"
  | "SETTLED"
  | "CANCELLED";

export type SalesListItem = {
  id: number;
  salesType: SalesType;
  description: string | null;
  salesDate: string;
  settlementDate: string | null;

  paymentPlatformId: number | null;
  paymentPlatformName: string | null;

  supplyAmount: number;
  salesVatAmount: number;
  totalSalesAmount: number;

  actualSettlementAmount: number | null;
  actualDeductionAmount: number | null;

  settlementStatus: SettlementStatus;
};

export type SalesDetail = {
  id: number;
  quoteId: number;
  quoteNumber: string;

  salesType: SalesType;
  description: string | null;

  paymentPlatform: {
    id: number;
    code: string;
    name: string;
  } | null;

  salesDate: string;
  settlementDate: string | null;

  supplyAmount: number;
  salesVatAmount: number;
  totalSalesAmount: number;

  actualSettlementAmount: number | null;
  actualDeductionAmount: number | null;

  serviceFeeAmount: number | null;
  paymentFeeAmount: number | null;
  feeVatAmount: number | null;
  withholdingTaxAmount: number | null;
  otherDeductionAmount: number | null;
  settlementVatAmount: number | null;

  settlementStatus: SettlementStatus;
  memo: string | null;

  createdAt: string;
  updatedAt: string;
};

export type SalesSaveRequest = {
  paymentPlatformId: number | null;
  salesType: SalesType;
  description: string | null;

  salesDate: string;
  settlementDate: string | null;

  totalSalesAmount: number;
  actualSettlementAmount: number | null;

  serviceFeeAmount: number | null;
  paymentFeeAmount: number | null;
  feeVatAmount: number | null;
  withholdingTaxAmount: number | null;
  otherDeductionAmount: number | null;
  settlementVatAmount: number | null;

  settlementStatus: SettlementStatus;
  memo: string | null;
};