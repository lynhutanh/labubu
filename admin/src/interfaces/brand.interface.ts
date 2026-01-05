export interface Brand {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  fileId?: string;
  logo?: {
    _id: string;
    url: string;
    path?: string;
  };
  website?: string;
  origin?: string;
  status?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBrandPayload {
  name: string;
  slug?: string;
  description?: string;
  fileId?: string;
  website?: string;
  origin?: string;
  status?: string;
  sortOrder?: number;
}

export interface UpdateBrandPayload {
  name?: string;
  slug?: string;
  description?: string;
  fileId?: string;
  website?: string;
  origin?: string;
  status?: string;
  sortOrder?: number;
}

export interface BrandSearchParams {
  keyword?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface BrandSearchResponse {
  brands: Brand[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BrandStats {
  totalBrands: number;
  activeBrands: number;
  inactiveBrands: number;
}

