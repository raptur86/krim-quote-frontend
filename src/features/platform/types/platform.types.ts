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
};

export type UpdatePublicInfoPolicyRequest = {
  showPublicPhone: boolean;
  showPublicEmail: boolean;
  showPublicWebsite: boolean;
  showPublicAddress: boolean;
};