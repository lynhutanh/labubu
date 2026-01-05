import { Expose, Transform, Type } from "class-transformer";
import { ObjectId } from "mongodb";
import { FileDto } from "src/modules/file/dtos";

export class ProductDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description?: string;

  @Expose()
  shortDescription?: string;

  @Expose()
  @Transform(({ obj }) => obj.categoryId)
  categoryId: ObjectId;

  @Expose()
  subcategorySlug?: string;

  @Expose()
  @Transform(({ obj }) => obj.brandId?._id || obj.brandId)
  brandId?: ObjectId;

  @Expose()
  brand?: any;

  @Expose()
  productType: string;

  @Expose()
  price: number;

  @Expose()
  salePrice?: number;

  @Expose()
  discountPercentage?: number;

  @Expose()
  stock: number;

  @Expose()
  sku?: string;

  @Expose()
  barcode?: string;

  @Expose()
  fileIds: ObjectId[];

  @Expose()
  files: any[];

  @Expose()
  coverImage?: string;

  @Expose()
  ingredients?: string;

  @Expose()
  howToUse?: string;

  @Expose()
  volume?: string;

  @Expose()
  weight?: number;

  @Expose()
  skinType: string[];

  @Expose()
  origin?: string;

  @Expose()
  madeIn?: string;

  @Expose()
  expiryMonths?: number;

  @Expose()
  metaTitle?: string;

  @Expose()
  metaDescription?: string;

  @Expose()
  metaKeywords?: string[];

  @Expose()
  status: string;

  @Expose()
  featured: boolean;

  @Expose()
  isNewArrival: boolean;

  @Expose()
  rating: number;

  @Expose()
  reviewCount: number;

  @Expose()
  soldCount: number;

  @Expose()
  viewCount: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  category?: any;

  constructor(init?: any) {
    if (init) {
      this._id = init._id;
      this.name = init.name;
      this.slug = init.slug;
      this.description = init.description;
      this.shortDescription = init.shortDescription;
      this.categoryId = init.categoryId?._id || init.categoryId;
      this.category =
        init.categoryId && typeof init.categoryId === "object"
          ? init.categoryId
          : undefined;
      this.subcategorySlug = init.subcategorySlug;
      this.brandId = init.brandId?._id || init.brandId;
      this.brand =
        init.brandId && typeof init.brandId === "object"
          ? init.brandId
          : undefined;
      this.productType = init.productType || "other";
      this.price = init.price;
      this.salePrice = init.salePrice;
      this.discountPercentage = init.discountPercentage;
      this.stock = init.stock || 0;
      this.sku = init.sku;
      this.barcode = init.barcode;
      this.fileIds = init.fileIds || [];
      this.files = (init.files || []).map((f: any) =>
        FileDto.fromModel(f).toPublicResponse(),
      );
      this.coverImage = this.files[0]?.url || "";
      this.ingredients = init.ingredients;
      this.howToUse = init.howToUse;
      this.volume = init.volume;
      this.weight = init.weight;
      this.skinType = init.skinType || [];
      this.origin = init.origin;
      this.madeIn = init.madeIn;
      this.expiryMonths = init.expiryMonths;
      this.metaTitle = init.metaTitle;
      this.metaDescription = init.metaDescription;
      this.metaKeywords = init.metaKeywords || [];
      this.status = init.status || "pending";
      this.featured = init.featured || false;
      this.isNewArrival = init.isNewArrival || true;
      this.rating = init.rating || 0;
      this.reviewCount = init.reviewCount || 0;
      this.soldCount = init.soldCount || 0;
      this.viewCount = init.viewCount || 0;
      this.createdAt = init.createdAt;
      this.updatedAt = init.updatedAt;
    }
  }
}

export class ProductListDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  shortDescription?: string;

  @Expose()
  categoryId?: ObjectId;

  @Expose()
  category?: any;

  @Expose()
  brandId?: ObjectId;

  @Expose()
  brand?: any;

  @Expose()
  price: number;

  @Expose()
  salePrice?: number;

  @Expose()
  discountPercentage?: number;

  @Expose()
  sku?: string;

  @Expose()
  files: any[];

  @Expose()
  coverImage?: string;

  @Expose()
  status: string;

  @Expose()
  featured: boolean;

  @Expose()
  rating: number;

  @Expose()
  reviewCount: number;

  @Expose()
  stock: number;

  @Expose()
  soldCount: number;

  @Expose()
  createdAt: Date;

  constructor(init?: any) {
    if (init) {
      this._id = init._id;
      this.name = init.name;
      this.slug = init.slug;
      this.shortDescription = init.shortDescription;
      this.categoryId = init.categoryId?._id || init.categoryId;
      this.category =
        init.categoryId && typeof init.categoryId === "object"
          ? init.categoryId
          : undefined;
      this.brandId = init.brandId?._id || init.brandId;
      this.brand =
        init.brandId && typeof init.brandId === "object"
          ? init.brandId
          : undefined;
      this.price = init.price;
      this.salePrice = init.salePrice;
      this.discountPercentage = init.discountPercentage;
      this.sku = init.sku;
      this.files = (init.files || []).map((f: any) =>
        FileDto.fromModel(f).toPublicResponse(),
      );
      this.coverImage = this.files[0]?.url || "";
      this.status = init.status || "pending";
      this.featured = init.featured || false;
      this.rating = init.rating || 0;
      this.reviewCount = init.reviewCount || 0;
      this.stock = init.stock || 0;
      this.soldCount = init.soldCount || 0;
      this.createdAt = init.createdAt;
    }
  }
}

export class ProductSearchResponseDto {
  @Expose()
  @Type(() => ProductListDto)
  products: ProductListDto[];

  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  totalPages: number;

  constructor(init?: Partial<ProductSearchResponseDto>) {
    if (init) {
      this.products = init.products || [];
      this.total = init.total || 0;
      this.page = init.page || 1;
      this.limit = init.limit || 20;
      this.totalPages = Math.ceil(this.total / this.limit);
    }
  }
}

export class ProductStatsDto {
  @Expose()
  totalProducts: number;

  @Expose()
  activeProducts: number;

  @Expose()
  pendingProducts: number;

  @Expose()
  outOfStockProducts: number;

  @Expose()
  totalValue: number;

  constructor(init?: Partial<ProductStatsDto>) {
    if (init) {
      this.totalProducts = init.totalProducts || 0;
      this.activeProducts = init.activeProducts || 0;
      this.pendingProducts = init.pendingProducts || 0;
      this.outOfStockProducts = init.outOfStockProducts || 0;
      this.totalValue = init.totalValue || 0;
    }
  }
}
