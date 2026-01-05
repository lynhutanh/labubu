export interface IProductFilter {
  status?: string | { $in: string[] };
  categoryId?: any;
  subcategorySlug?: string;
  brandId?: any;
  productType?: string;
  featured?: boolean;
  skinType?: { $in: string[] };
  price?: { $gte?: number; $lte?: number };
  $or?: Array<{
    name?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
  }>;
  $text?: { $search: string };
  [key: string]: any;
}

export interface IProductSortOptions {
  [key: string]: 1 | -1;
}

export interface IProductUpdateData {
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  categoryId?: any;
  subcategorySlug?: string;
  brandId?: any;
  productType?: string;
  price?: number;
  salePrice?: number;
  discountPercentage?: number;
  stock?: number;
  sku?: string;
  barcode?: string;
  fileIds?: any[];
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
  updatedAt: Date;
}

export interface IProductStats {
  totalProducts: number;
  activeProducts: number;
  pendingProducts: number;
  outOfStockProducts: number;
  totalValue: number;
}
