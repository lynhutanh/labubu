export const FILE_TYPE = {
  PRODUCT_PHOTO: "product-photo",
  PRODUCT_VIDEO: "product-video",
  AVATAR_PHOTO: "avatar-photo",
  BANNER_PHOTO: "banner-photo",
};

export interface BaseDir {
  dir: string;
  absoluteDir: string;
}

export const FILE_STATUSES = {
  CREATED: "created",
  PROCESSING: "processing",
  QUEUED: "queued",
  FINISHED: "finished",
  ERROR: "error",
};

export enum Storage {
  DiskStorage = "diskStorage",
  MemoryStorage = "memoryStorage",
  S3 = "s3",
}
