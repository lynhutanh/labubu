export interface CreateProductPayload {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  categoryId: string;
  subcategorySlug?: string;
  brandId?: string;
  productType?: string;
  price: number;
  salePrice?: number;
  discountPercentage?: number;
  stock?: number;
  // SKU and Barcode are auto-generated on backend
  fileIds?: string[];
  ingredients?: string;
  howToUse?: string;
  volume?: string;
  weight?: number;
  skinType?: string[];
  origin?: string;
  madeIn?: string;
  expiryMonths?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  featured?: boolean;
  isNewArrival?: boolean;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  status?: string;
}

export interface ProductSearchParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
  categoryId?: string;
  brandId?: string;
  productType?: string;
  status?: string;
  skinType?: string[];
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductResponse {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  categoryId?: any;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  brandId?: any;
  brand?:
    | string
    | {
        _id: string;
        name: string;
        slug: string;
      };
  productType?: string;
  price: number;
  salePrice?: number;
  discountPercentage?: number;
  stock?: number;
  sku?: string;
  barcode?: string;
  fileIds?: string[];
  files?: Array<{
    _id?: string;
    url: string;
    thumbnailUrl?: string;
    mimeType?: string;
    type?: string;
    name?: string;
  }>;
  coverImage?: string;
  images?: string[];
  ingredients?: string;
  howToUse?: string;
  volume?: string;
  weight?: number;
  skinType?: string[];
  origin?: string;
  madeIn?: string;
  expiryMonths?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  status?: string;
  featured?: boolean;
  isNewArrival?: boolean;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  viewCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export interface ProductSearchResponse {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  pendingProducts: number;
  outOfStockProducts: number;
  totalValue: number;
}

export interface BulkOperationPayload {
  action: 'activate' | 'deactivate' | 'delete';
  productIds: string[];
}

