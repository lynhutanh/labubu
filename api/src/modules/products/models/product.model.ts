import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export class ProductModel extends Document {
  _id: ObjectId;

  name: string;

  slug: string;

  description?: string;

  shortDescription?: string;

  categoryId: ObjectId;

  subcategorySlug?: string;

  brandId?: ObjectId;

  productType: string;

  price: number;

  salePrice?: number;

  discountPercentage?: number;

  stock: number;

  sku?: string;

  barcode?: string;

  fileIds: ObjectId[];

  ingredients?: string;

  howToUse?: string;

  volume?: string;

  weight?: number;

  skinType: string[];

  origin?: string;

  madeIn?: string;

  expiryMonths?: number;

  metaTitle?: string;

  metaDescription?: string;

  metaKeywords?: string[];

  status: string;

  featured: boolean;

  isNewArrival: boolean;

  rating: number;

  reviewCount: number;

  soldCount: number;

  viewCount: number;

  createdAt: Date;

  updatedAt: Date;
}
