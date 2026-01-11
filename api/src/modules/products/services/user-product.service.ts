import { Injectable, Inject } from "@nestjs/common";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { ProductModel } from "../models";
import { ProductDto, ProductListDto, ProductSearchResponseDto } from "../dtos";
import { ProductSearchPayload } from "../payloads";
import { PRODUCT_PROVIDER, PRODUCT_STATUS } from "../constants";
import {
  buildProductSearchFilter,
  buildProductSortOptions,
  calculateOffset,
} from "../helpers";

@Injectable()
export class UserProductService {
  constructor(
    @Inject(PRODUCT_PROVIDER)
    private readonly productModel: Model<ProductModel>,
  ) {}

  private transformProductWithFiles(product: any): any {
    return {
      ...product,
      files: product.fileIds || [],
    };
  }

  async findById(id: string): Promise<ProductDto | null> {
    if (!id || !ObjectId.isValid(id)) return null;

    const product = await this.productModel
      .findOneAndUpdate(
        { _id: new ObjectId(id), status: PRODUCT_STATUS.ACTIVE },
        { $inc: { viewCount: 1 } },
        { new: true },
      )
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug fileId")
      .populate("fileIds")
      .lean();

    if (!product) return null;

    return new ProductDto(this.transformProductWithFiles(product));
  }

  async findBySlug(slug: string): Promise<ProductDto | null> {
    if (!slug) return null;

    const product = await this.productModel
      .findOneAndUpdate(
        { slug, status: PRODUCT_STATUS.ACTIVE },
        { $inc: { viewCount: 1 } },
        { new: true },
      )
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug fileId")
      .populate("fileIds")
      .lean();

    if (!product) return null;

    return new ProductDto(this.transformProductWithFiles(product));
  }

  async search(
    payload: ProductSearchPayload,
  ): Promise<ProductSearchResponseDto> {
    const {
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = payload;

    const query = buildProductSearchFilter(payload, {
      status: PRODUCT_STATUS.ACTIVE,
    });
    const sort = buildProductSortOptions(sortBy, sortOrder);
    const skip = calculateOffset(page, limit);

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate("brandId", "name slug")
        .populate("fileIds")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(query),
    ]);

    const productDtos = products.map(
      (product: any) =>
        new ProductListDto(this.transformProductWithFiles(product)),
    );

    return new ProductSearchResponseDto({
      products: productDtos,
      total,
      page,
      limit,
    });
  }

  async getFeaturedProducts(limit: number = 10): Promise<ProductListDto[]> {
    const products = await this.productModel
      .find({
        status: PRODUCT_STATUS.ACTIVE,
        featured: true,
      })
      .populate("brandId", "name slug")
      .populate("fileIds")
      .sort({ soldCount: -1, rating: -1 })
      .limit(limit)
      .lean();

    return products.map(
      (product: any) =>
        new ProductListDto(this.transformProductWithFiles(product)),
    );
  }

  async getNewProducts(limit: number = 10): Promise<ProductListDto[]> {
    const products = await this.productModel
      .find({
        status: PRODUCT_STATUS.ACTIVE,
      })
      .populate("brandId", "name slug")
      .populate("fileIds")
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo mới nhất
      .limit(limit)
      .lean();

    return products.map(
      (product: any) =>
        new ProductListDto(this.transformProductWithFiles(product)),
    );
  }

  async getBestSellerProducts(limit: number = 10): Promise<ProductListDto[]> {
    const products = await this.productModel
      .find({
        status: PRODUCT_STATUS.ACTIVE,
      })
      .populate("brandId", "name slug")
      .populate("fileIds")
      .sort({ soldCount: -1 })
      .limit(limit)
      .lean();

    return products.map(
      (product: any) =>
        new ProductListDto(this.transformProductWithFiles(product)),
    );
  }

  async getProductsByCategory(
    categoryId: string,
    limit: number = 20,
    page: number = 1,
  ): Promise<ProductSearchResponseDto> {
    const skip = calculateOffset(page, limit);

    const query = {
      categoryId: new ObjectId(categoryId),
      status: PRODUCT_STATUS.ACTIVE,
    };

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate("brandId", "name slug")
        .populate("fileIds")
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(query),
    ]);

    const productDtos = products.map(
      (product: any) =>
        new ProductListDto(this.transformProductWithFiles(product)),
    );

    return new ProductSearchResponseDto({
      products: productDtos,
      total,
      page,
      limit,
    });
  }

  async getProductsByBrand(
    brandId: string,
    limit: number = 20,
    page: number = 1,
  ): Promise<ProductSearchResponseDto> {
    const skip = calculateOffset(page, limit);

    const query = {
      brandId: new ObjectId(brandId),
      status: PRODUCT_STATUS.ACTIVE,
    };

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate("brandId", "name slug")
        .populate("fileIds")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(query),
    ]);

    const productDtos = products.map(
      (product: any) =>
        new ProductListDto(this.transformProductWithFiles(product)),
    );

    return new ProductSearchResponseDto({
      products: productDtos,
      total,
      page,
      limit,
    });
  }

  async getRelatedProducts(
    productId: string,
    limit: number = 8,
  ): Promise<ProductListDto[]> {
    const product = await this.productModel.findById(productId).lean();
    if (!product) return [];

    const products = await this.productModel
      .find({
        _id: { $ne: new ObjectId(productId) },
        categoryId: product.categoryId,
        status: PRODUCT_STATUS.ACTIVE,
      })
      .populate("brandId", "name slug")
      .populate("fileIds")
      .sort({ soldCount: -1, rating: -1 })
      .limit(limit)
      .lean();

    return products.map(
      (p: any) => new ProductListDto(this.transformProductWithFiles(p)),
    );
  }

  async getSaleProducts(limit: number = 20): Promise<ProductListDto[]> {
    const products = await this.productModel
      .find({
        status: PRODUCT_STATUS.ACTIVE,
        salePrice: { $gt: 0 },
        discountPercentage: { $gt: 0 },
      })
      .populate("brandId", "name slug")
      .populate("fileIds")
      .sort({ discountPercentage: -1 })
      .limit(limit)
      .lean();

    return products.map(
      (product: any) =>
        new ProductListDto(this.transformProductWithFiles(product)),
    );
  }
}
