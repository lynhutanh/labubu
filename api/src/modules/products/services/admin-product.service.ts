import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { QueueMessageService } from "src/kernel";
import { EVENT } from "src/kernel/constants";
import { ProductModel } from "../models";
import {
  ProductDto,
  ProductListDto,
  ProductSearchResponseDto,
  ProductStatsDto,
} from "../dtos";
import {
  CreateProductPayload,
  UpdateProductPayload,
  ProductSearchPayload,
  ProductBulkOperationPayload,
} from "../payloads";
import {
  PRODUCT_PROVIDER,
  PRODUCT_CHANNEL,
  PRODUCT_STATUS,
} from "../constants";
import { IProductUpdateData } from "../interfaces";
import {
  generateSlug,
  buildProductSearchFilter,
  buildProductSortOptions,
  calculateOffset,
  calculateDiscountPercentage,
} from "../helpers";

@Injectable()
export class AdminProductService {
  constructor(
    @Inject(PRODUCT_PROVIDER)
    private readonly productModel: Model<ProductModel>,
    private readonly queueEventService: QueueMessageService,
  ) {}

  async findById(id: string): Promise<ProductDto | null> {
    if (!id || !ObjectId.isValid(id)) return null;

    const product = await this.productModel
      .findById(id)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug fileId")
      .populate("fileIds")
      .lean();

    if (!product) return null;

    const productData = {
      ...product,
      files: product.fileIds || [],
    };

    return new ProductDto(productData);
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

    const query = buildProductSearchFilter(payload);
    const sort = buildProductSortOptions(sortBy, sortOrder);
    const skip = calculateOffset(page, limit);

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate("categoryId", "name slug")
        .populate("brandId", "name slug")
        .populate("fileIds")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(query),
    ]);

    const productDtos = products.map((product: any) => {
      const productData = {
        ...product,
        files: product.fileIds || [],
      };
      return new ProductListDto(productData);
    });

    return new ProductSearchResponseDto({
      products: productDtos,
      total,
      page,
      limit,
    });
  }

  private generateSKU(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SKU-${timestamp}-${random}`;
  }

  private generateBarcode(): string {
    const prefix = "890"; // Vietnam country code for EAN-13
    const timestamp = Date.now().toString().slice(-9);
    const checkDigit = this.calculateEAN13CheckDigit(prefix + timestamp);
    return prefix + timestamp + checkDigit;
  }

  private calculateEAN13CheckDigit(code: string): string {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(code[i], 10);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  }

  async create(payload: CreateProductPayload): Promise<ProductDto> {
    const slug = payload.slug || (await generateSlug(payload.name));
    const existingSlug = await this.productModel.findOne({ slug });
    if (existingSlug) {
      throw new BadRequestException("Slug này đã được sử dụng");
    }

    let discountPercentage = payload.discountPercentage || 0;
    if (payload.salePrice && payload.price) {
      discountPercentage = calculateDiscountPercentage(
        payload.price,
        payload.salePrice,
      );
    }

    // Auto-generate SKU and barcode
    const sku = this.generateSKU();
    const barcode = this.generateBarcode();

    const productData: any = {
      ...payload,
      slug,
      sku,
      barcode,
      discountPercentage,
      categoryId: new ObjectId(payload.categoryId),
      status: PRODUCT_STATUS.ACTIVE,
    };

    if (payload.fileIds) {
      productData.fileIds = payload.fileIds.map((id) => new ObjectId(id));
    }

    if (payload.brandId) {
      productData.brandId = new ObjectId(payload.brandId);
    }

    const product = await this.productModel.create(productData);
    const createdProduct = await this.productModel
      .findById(product._id)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .populate("fileIds")
      .lean();

    return new ProductDto({
      ...createdProduct,
      files: createdProduct?.fileIds || [],
    });
  }

  async update(id: string, payload: UpdateProductPayload): Promise<ProductDto> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException("Sản phẩm không tồn tại");
    }

    if (payload.name && !payload.slug) {
      payload.slug = await generateSlug(payload.name);
    }

    if (payload.slug && payload.slug !== product.slug) {
      const existingSlug = await this.productModel.findOne({
        slug: payload.slug,
        _id: { $ne: id },
      });
      if (existingSlug) {
        throw new BadRequestException("Slug này đã được sử dụng");
      }
    }

    let discountPercentage = payload.discountPercentage;
    const price = payload.price ?? product.price;
    const salePrice = payload.salePrice ?? product.salePrice;
    if (salePrice && price) {
      discountPercentage = calculateDiscountPercentage(price, salePrice);
    }

    const updateData: IProductUpdateData = {
      ...(payload as any),
      discountPercentage,
      updatedAt: new Date(),
    };

    if (payload.fileIds) {
      updateData.fileIds = payload.fileIds.map((id) => new ObjectId(id));
    }

    if (payload.categoryId) {
      updateData.categoryId = new ObjectId(payload.categoryId);
    }

    if (payload.brandId) {
      updateData.brandId = new ObjectId(payload.brandId);
    }

    await this.productModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    const updatedProduct = await this.productModel
      .findById(id)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .populate("fileIds")
      .lean();

    const productDto = new ProductDto({
      ...updatedProduct,
      files: updatedProduct?.fileIds || [],
    });

    await this.queueEventService.publish(PRODUCT_CHANNEL, {
      channel: PRODUCT_CHANNEL,
      eventName: EVENT.UPDATED,
      data: productDto,
    });

    return productDto;
  }

  async delete(id: string): Promise<boolean> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException("Sản phẩm không tồn tại");
    }

    await this.productModel.findByIdAndDelete(id);

    await this.queueEventService.publish(PRODUCT_CHANNEL, {
      channel: PRODUCT_CHANNEL,
      eventName: EVENT.DELETED,
      data: new ProductDto(product),
    });

    return true;
  }

  async getStats(): Promise<ProductStatsDto> {
    const baseQuery = {};

    const [
      totalProducts,
      activeProducts,
      pendingProducts,
      outOfStockProducts,
      valueResult,
    ] = await Promise.all([
      this.productModel.countDocuments(baseQuery),
      this.productModel.countDocuments({
        ...baseQuery,
        status: PRODUCT_STATUS.ACTIVE,
      }),
      this.productModel.countDocuments({
        ...baseQuery,
        status: PRODUCT_STATUS.PENDING,
      }),
      this.productModel.countDocuments({
        ...baseQuery,
        $or: [{ status: PRODUCT_STATUS.OUT_OF_STOCK }, { stock: 0 }],
      }),
      this.productModel.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
          },
        },
      ]),
    ]);

    return new ProductStatsDto({
      totalProducts,
      activeProducts,
      pendingProducts,
      outOfStockProducts,
      totalValue: valueResult[0]?.totalValue || 0,
    });
  }

  async bulkOperation(
    payload: ProductBulkOperationPayload,
  ): Promise<{ success: number; failed: number }> {
    const { action, productIds } = payload;
    let success = 0;
    let failed = 0;

    for (const productId of productIds) {
      try {
        switch (action) {
          case "activate":
            await this.productModel.findByIdAndUpdate(productId, {
              status: PRODUCT_STATUS.ACTIVE,
            });
            break;
          case "deactivate":
            await this.productModel.findByIdAndUpdate(productId, {
              status: PRODUCT_STATUS.INACTIVE,
            });
            break;
          case "delete":
            await this.delete(productId);
            break;
          default:
            failed++;
            continue;
        }
        success++;
      } catch {
        failed++;
      }
    }

    return { success, failed };
  }

  async approveProduct(id: string): Promise<ProductDto> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException("Sản phẩm không tồn tại");
    }

    await this.productModel.findByIdAndUpdate(
      id,
      { status: PRODUCT_STATUS.ACTIVE },
      { new: true },
    );

    const updatedProduct = await this.productModel
      .findById(id)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .populate("fileIds")
      .lean();

    return new ProductDto({
      ...updatedProduct,
      files: updatedProduct?.fileIds || [],
    });
  }

  async rejectProduct(id: string): Promise<ProductDto> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException("Sản phẩm không tồn tại");
    }

    await this.productModel.findByIdAndUpdate(
      id,
      { status: PRODUCT_STATUS.INACTIVE },
      { new: true },
    );

    const updatedProduct = await this.productModel
      .findById(id)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .populate("fileIds")
      .lean();

    return new ProductDto({
      ...updatedProduct,
      files: updatedProduct?.fileIds || [],
    });
  }
}
