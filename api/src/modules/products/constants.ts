export const PRODUCT_PROVIDER = "PRODUCT";

export const PRODUCT_CHANNEL = "PRODUCT_CHANNEL";
export const PRODUCT_UPDATE_TOPIC = "PRODUCT_UPDATE_TOPIC";
export const PRODUCT_DELETE_TOPIC = "PRODUCT_DELETE_TOPIC";

export const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  OUT_OF_STOCK: "out_of_stock",
} as const;

export const SKIN_TYPE = {
  ALL: "all",
  OILY: "oily",
  DRY: "dry",
  COMBINATION: "combination",
  SENSITIVE: "sensitive",
  NORMAL: "normal",
} as const;

export const PRODUCT_TYPE = {
  SKINCARE: "skincare",
  MAKEUP: "makeup",
  HAIRCARE: "haircare",
  BODYCARE: "bodycare",
  FRAGRANCE: "fragrance",
  TOOLS: "tools",
  OTHER: "other",
} as const;
