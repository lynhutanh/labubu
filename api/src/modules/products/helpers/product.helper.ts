import { BadRequestException } from "@nestjs/common";
import { ObjectId } from "mongodb";
import slugify from "slugify";
import { IProductFilter, IProductSortOptions } from "../interfaces";
import { ProductSearchPayload } from "../payloads";

export function validateObjectId(id: string, fieldName: string = "ID"): void {
  if (!ObjectId.isValid(id)) {
    throw new BadRequestException(`${fieldName} không hợp lệ`);
  }
}

export async function generateSlug(name: string): Promise<string> {
  if (!name || typeof name !== "string") {
    throw new BadRequestException("Tên sản phẩm là bắt buộc");
  }
  const slug = slugify(name, {
    lower: true,
    strict: true,
    locale: "vi",
    trim: true,
  });
  return slug;
}

export function buildProductSearchFilter(
  payload: ProductSearchPayload,
  additionalFilters: Partial<IProductFilter> = {},
): IProductFilter {
  const query: IProductFilter = { ...additionalFilters };

  if (payload.status && payload.status !== "all") {
    query.status = payload.status;
  }

  if (payload.categoryId) {
    query.categoryId = new ObjectId(payload.categoryId);
  }

  if (payload.subcategorySlug) {
    query.subcategorySlug = payload.subcategorySlug;
  }

  if (payload.brandId) {
    query.brandId = new ObjectId(payload.brandId);
  }

  if (payload.productType) {
    query.productType = payload.productType;
  }

  if (payload.featured !== undefined) {
    query.featured = payload.featured;
  }

  if (payload.skinType && payload.skinType.length > 0) {
    query.skinType = { $in: payload.skinType };
  }

  if (payload.minPrice !== undefined || payload.maxPrice !== undefined) {
    query.price = {};
    if (payload.minPrice !== undefined) {
      query.price.$gte = payload.minPrice;
    }
    if (payload.maxPrice !== undefined) {
      query.price.$lte = payload.maxPrice;
    }
  }

  if (payload.keyword) {
    query.$or = [
      { name: { $regex: payload.keyword, $options: "i" } },
      { description: { $regex: payload.keyword, $options: "i" } },
    ];
  }

  return query;
}

export function buildProductSortOptions(
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
): IProductSortOptions {
  const sort: IProductSortOptions = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  if (sortBy !== "createdAt") {
    sort.createdAt = -1;
  }

  return sort;
}

export function calculateOffset(page?: number, limit: number = 20): number {
  if (page && page > 0) {
    return (page - 1) * limit;
  }
  return 0;
}

export function calculateDiscountPercentage(
  price: number,
  salePrice: number,
): number {
  if (!price || price <= 0 || !salePrice || salePrice <= 0) {
    return 0;
  }
  if (salePrice >= price) {
    return 0;
  }
  return Math.round(((price - salePrice) / price) * 100);
}
