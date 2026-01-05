export interface IBrandFilter {
  status?: string;
  $or?: Array<{
    name?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
  }>;
  [key: string]: unknown;
}

export interface IBrandSortOptions {
  [key: string]: 1 | -1;
}

export interface IBrandUpdateData {
  name?: string;
  slug?: string;
  description?: string;
  fileId?: any;
  website?: string;
  origin?: string;
  status?: string;
  sortOrder?: number;
  updatedAt?: Date;
}
