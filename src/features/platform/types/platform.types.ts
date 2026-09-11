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
  active: boolean;
};