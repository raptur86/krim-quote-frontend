export type PlatformType =
  | "PLATFORM"
  | "DIRECT"
  | "OTHER";

export type PlatformListItem = {
  id: number;
  code: string;
  name: string;
  platformType: PlatformType;
  automaticFeeSupported: boolean;
  showPublicPhone: boolean;
  showPublicEmail: boolean;
  showPublicWebsite: boolean;
  showPublicAddress: boolean;
  active: boolean;
  memo: string | null;
};

export type PlatformSaveRequest = {
  code: string;
  name: string;
  platformType: PlatformType;
  memo: string | null;
};

export type PlatformActiveRequest = {
  active: boolean;
};

export type UpdatePublicInfoPolicyRequest = {
  showPublicPhone: boolean;
  showPublicEmail: boolean;
  showPublicWebsite: boolean;
  showPublicAddress: boolean;
};