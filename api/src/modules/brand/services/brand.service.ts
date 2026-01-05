import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { QueueMessageService } from "src/kernel";
import { BrandModel } from "../models";
import { BrandDto, BrandSearchResponseDto, BrandStatsDto } from "../dtos";
import {
  CreateBrandPayload,
  UpdateBrandPayload,
  BrandSearchPayload,
  BrandBulkOperationPayload,
} from "../payloads";
import { BRAND_PROVIDER } from "../constants";
import { IBrandFilter, IBrandUpdateData } from "../interfaces";
import {
  generateSlug,
  buildBrandSearchFilter,
  buildBrandSortOptions,
  calculateOffset,
} from "../helpers";

@Injectable()
export class BrandService {
  constructor(
    @Inject(BRAND_PROVIDER)
    private readonly brandModel: Model<BrandModel>,
    private readonly queueEventService: QueueMessageService,
  ) {}

  public async getAll(): Promise<BrandDto[]> {
    const brands = await this.brandModel
      .find()
      .populate("fileId")
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return brands.map((brand) => new BrandDto(brand));
  }

  public async findById(id: string): Promise<BrandDto | null> {
    if (!id || !ObjectId.isValid(id)) return null;

    const brand = await this.brandModel.findById(id).populate("fileId").lean();

    if (!brand) return null;

    return new BrandDto(brand);
  }

  public async findBySlug(slug: string): Promise<BrandDto | null> {
    if (!slug) return null;

    const brand = await this.brandModel
      .findOne({ slug })
      .populate("fileId")
      .lean();

    if (!brand) return null;

    return new BrandDto({
      ...brand,
      logo: brand.fileId,
      fileId: (brand.fileId as any)?._id || brand.fileId,
    });
  }

  public async findAll(payload: BrandSearchPayload = {}): Promise<BrandDto[]> {
    const {
      keyword,
      sortBy = "sortOrder",
      sortOrder = "asc",
      page = 1,
      limit = 50,
    } = payload;

    const query: IBrandFilter = { status: "active" };

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    const sort = buildBrandSortOptions(sortBy, sortOrder);
    const skip = calculateOffset(page, limit);

    const brands = await this.brandModel
      .find(query)
      .populate("fileId")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return brands.map(
      (brand) =>
        new BrandDto({
          ...brand,
          logo: brand.fileId,
          fileId: (brand.fileId as any)?._id || brand.fileId,
        }),
    );
  }

  public async create(payload: CreateBrandPayload): Promise<BrandDto> {
    try {
      // Check if brand already exists
      const existingBrand = await this.brandModel.findOne({
        name: payload.name,
      });

      if (existingBrand) {
        throw new BadRequestException("Nhãn hàng này đã tồn tại");
      }

      // Generate slug if not provided
      const slug = payload.slug || (await generateSlug(payload.name));

      const brandData: any = {
        name: payload.name,
        slug,
        description: payload.description || "",
        website: payload.website || "",
        origin: payload.origin || "",
        status: payload.status || "active",
        sortOrder: payload.sortOrder || 0,
      };

      if (payload.fileId) {
        brandData.fileId = new ObjectId(payload.fileId);
      }

      const brand = await this.brandModel.create(brandData);

      const createdBrand = await this.brandModel
        .findById(brand._id)
        .populate("fileId")
        .lean();

      return new BrandDto(createdBrand);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException("Nhãn hàng này đã tồn tại");
      }
      throw error;
    }
  }

  public async update(
    id: string,
    payload: UpdateBrandPayload,
  ): Promise<BrandDto> {
    const brand = await this.brandModel.findById(id);
    if (!brand) {
      throw new NotFoundException("Nhãn hàng không tồn tại");
    }

    // Check if name already exists (excluding current brand)
    if (payload.name && payload.name !== brand.name) {
      const existingBrand = await this.brandModel.findOne({
        name: payload.name,
        _id: { $ne: id },
      });
      if (existingBrand) {
        throw new BadRequestException("Nhãn hàng này đã tồn tại");
      }
    }

    const updateData: IBrandUpdateData = {};

    if (payload.name !== undefined) {
      updateData.name = payload.name;
      // Auto-generate slug if name changed and no slug provided
      if (!payload.slug) {
        updateData.slug = await generateSlug(payload.name);
      }
    }
    if (payload.slug !== undefined) updateData.slug = payload.slug;
    if (payload.description !== undefined)
      updateData.description = payload.description;
    if (payload.website !== undefined) updateData.website = payload.website;
    if (payload.origin !== undefined) updateData.origin = payload.origin;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.sortOrder !== undefined)
      updateData.sortOrder = payload.sortOrder;
    if (payload.fileId !== undefined) {
      updateData.fileId = payload.fileId ? new ObjectId(payload.fileId) : null;
    }

    await this.brandModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    const updated = await this.brandModel
      .findById(id)
      .populate("fileId")
      .lean();

    return new BrandDto(updated);
  }

  public async delete(id: string): Promise<boolean> {
    const brand = await this.brandModel.findById(id);
    if (!brand) {
      throw new NotFoundException("Nhãn hàng không tồn tại");
    }

    await this.brandModel.findByIdAndDelete(id);
    return true;
  }

  public async getStats(): Promise<BrandStatsDto> {
    const [totalBrands, activeBrands] = await Promise.all([
      this.brandModel.countDocuments(),
      this.brandModel.countDocuments({ status: "active" }),
    ]);

    const inactiveBrands = totalBrands - activeBrands;

    return new BrandStatsDto({
      totalBrands,
      activeBrands,
      inactiveBrands,
    });
  }

  public async search(
    payload: BrandSearchPayload,
  ): Promise<BrandSearchResponseDto> {
    const {
      keyword,
      status,
      sortBy = "sortOrder",
      sortOrder = "asc",
      page = 1,
      limit = 20,
    } = payload;

    const query = buildBrandSearchFilter({ keyword, status });
    const sort = buildBrandSortOptions(sortBy, sortOrder);
    const skip = calculateOffset(page, limit);

    const [brands, total] = await Promise.all([
      this.brandModel
        .find(query)
        .populate("fileId")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.brandModel.countDocuments(query),
    ]);

    const brandDtos = brands.map(
      (brand) =>
        new BrandDto({
          ...brand,
          logo: brand.fileId,
          fileId: (brand.fileId as any)?._id || brand.fileId,
        }),
    );

    return new BrandSearchResponseDto({
      brands: brandDtos,
      total,
      page,
      limit,
    });
  }

  public async bulkOperation(
    payload: BrandBulkOperationPayload,
  ): Promise<{ success: number; failed: number }> {
    const { action, brandIds } = payload;
    let success = 0;
    let failed = 0;

    for (const brandId of brandIds) {
      try {
        switch (action) {
          case "activate":
            await this.brandModel.findByIdAndUpdate(brandId, {
              status: "active",
            });
            break;
          case "deactivate":
            await this.brandModel.findByIdAndUpdate(brandId, {
              status: "inactive",
            });
            break;
          case "delete":
            await this.delete(brandId);
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

  public async getPublicBrands(): Promise<BrandDto[]> {
    const brands = await this.brandModel
      .find({ status: "active" })
      .populate("fileId")
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return brands.map(
      (brand) =>
        new BrandDto({
          ...brand,
          logo: brand.fileId,
          fileId: (brand.fileId as any)?._id || brand.fileId,
        }),
    );
  }

  public async getAllBrandsForUser(): Promise<BrandDto[]> {
    try {
      // Get all brands regardless of status for user
      const brands = await this.brandModel.find({}).sort({ name: 1 }).lean();

      return brands.map(
        (brand) =>
          new BrandDto({
            _id: brand._id,
            name: brand.name,
          }),
      );
    } catch (error) {
      console.error("Error in getAllBrandsForUser:", error);
      throw error;
    }
  }
}
