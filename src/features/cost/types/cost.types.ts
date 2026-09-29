export interface FixedCostItemRequest {
  costName: string;
  monthlyAmount: number;
  sortOrder: number | null;
}

export interface CostSettingCreateRequest {
  settingName: string;
  internalHourlyCost: number;
  monthlyStandardHours: number;
  effectiveFrom: string;
  fixedCosts: FixedCostItemRequest[];
}

export interface FixedCostItemResponse {
  id: number;
  costName: string;
  monthlyAmount: number;
  sortOrder: number;
}

export interface CostSettingResponse {
  id: number;
  settingName: string;
  internalHourlyCost: number;
  monthlyStandardHours: number;

  monthlyFixedCost: number;
  hourlyOverheadCost: number;

  effectiveFrom: string;
  effectiveTo: string | null;
  active: boolean;

  fixedCosts: FixedCostItemResponse[];
}