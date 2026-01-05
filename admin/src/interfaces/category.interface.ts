export interface CreateSubcategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  status?: 'active' | 'inactive';
  sortOrder?: number;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  status?: 'active' | 'inactive';
  sortOrder?: number;
  subcategories?: CreateSubcategoryPayload[];
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {
  _id: string;
}

export interface CategoryResponse {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  status?: string;
  sortOrder?: number;
  subcategories?: any[];
  [key: string]: any;
}

export interface CategorySearchParams {
  keyword?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

