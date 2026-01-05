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
import { CategoryModel } from "../models";
import {
  CategoryDto,
  CategorySearchResponseDto,
  CategoryStatsDto,
} from "../dtos";
import {
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategorySearchPayload,
  CategoryBulkOperationPayload,
} from "../payloads";
import { CATEGORY_PROVIDER } from "../providers";
import { CATEGORY_CHANNEL } from "../constants";
import { ICategoryFilter, ICategoryUpdateData } from "../interfaces";
import {
  generateSlug,
  buildCategorySearchFilter,
  buildCategorySortOptions,
  calculateOffset,
} from "../helpers";
import { PRODUCT_PROVIDER } from "src/modules/products/constants";

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CATEGORY_PROVIDER)
    private readonly categoryModel: Model<CategoryModel>,
    @Inject(PRODUCT_PROVIDER)
    private readonly productModel: Model<any>,
    private readonly queueEventService: QueueMessageService,
  ) {}

  public async findById(id: string): Promise<CategoryDto | null> {
    if (!id) return null;

    if (!ObjectId.isValid(id)) {
      return null;
    }

    const category = await this.categoryModel.findById(id).lean();
    return category ? new CategoryDto(category) : null;
  }

  public async findBySlug(slug: string): Promise<CategoryDto | null> {
    if (!slug) return null;

    const category = await this.categoryModel.findOne({ slug }).lean();
    return category ? new CategoryDto(category) : null;
  }

  public async findAll(
    payload: CategorySearchPayload = {},
  ): Promise<CategoryDto[]> {
    const {
      keyword,
      sortBy = "sortOrder",
      sortOrder = "asc",
      page = 1,
      limit = 50,
    } = payload;

    const query: ICategoryFilter = { status: "active" };

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    const sort = buildCategorySortOptions(sortBy, sortOrder);
    const skip = calculateOffset(page, limit);

    const categories = await this.categoryModel
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return categories.map((category) => new CategoryDto(category));
  }

  public async create(payload: CreateCategoryPayload): Promise<CategoryDto> {
    const existingCategory = await this.categoryModel.findOne({
      name: payload.name,
    });

    if (existingCategory) {
      throw new BadRequestException("Danh mục với tên này đã tồn tại");
    }

    const slug = payload.slug || (await generateSlug(payload.name));
    const existingSlug = await this.categoryModel.findOne({ slug });
    if (existingSlug) {
      throw new BadRequestException("Slug này đã được sử dụng");
    }

    const categoryData = {
      name: payload.name,
      slug,
      description: payload.description || "",
      icon: payload.icon || "",
      image: payload.image || "",
      status: payload.status || "active",
      sortOrder: payload.sortOrder || 0,
      subcategories: payload.subcategories || [],
    };

    const category = await this.categoryModel.create(categoryData);
    return new CategoryDto(category);
  }

  public async update(
    id: string,
    payload: UpdateCategoryPayload,
  ): Promise<CategoryDto> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException("Danh mục không tồn tại");
    }

    if (payload.name && payload.name !== category.name) {
      const existingCategory = await this.categoryModel.findOne({
        name: payload.name,
        _id: { $ne: id },
      });
      if (existingCategory) {
        throw new BadRequestException("Danh mục với tên này đã tồn tại");
      }
    }

    if (payload.name && !payload.slug) {
      payload.slug = await generateSlug(payload.name);
    }

    if (payload.slug && payload.slug !== category.slug) {
      const existingSlug = await this.categoryModel.findOne({
        slug: payload.slug,
        _id: { $ne: id },
      });
      if (existingSlug) {
        throw new BadRequestException("Slug này đã được sử dụng");
      }
    }

    const updateData: ICategoryUpdateData = {
      ...(payload as unknown as ICategoryUpdateData),
      updatedAt: new Date(),
    };

    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    const categoryDto = new CategoryDto(updatedCategory);

    await this.queueEventService.publish(CATEGORY_CHANNEL, {
      channel: CATEGORY_CHANNEL,
      eventName: EVENT.UPDATED,
      data: categoryDto,
    });

    return categoryDto;
  }

  public async delete(id: string): Promise<boolean> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException("Danh mục không tồn tại");
    }

    await this.categoryModel.findByIdAndUpdate(id, { status: "inactive" });

    const categoryDto = new CategoryDto(category);

    await this.queueEventService.publish(CATEGORY_CHANNEL, {
      channel: CATEGORY_CHANNEL,
      eventName: EVENT.DELETED,
      data: categoryDto,
    });

    return true;
  }

  public async getStats(): Promise<CategoryStatsDto> {
    const [totalCategories, activeCategories] = await Promise.all([
      this.categoryModel.countDocuments(),
      this.categoryModel.countDocuments({ status: "active" }),
    ]);

    const inactiveCategories = totalCategories - activeCategories;

    return new CategoryStatsDto({
      totalCategories,
      activeCategories,
      inactiveCategories,
      topCategories: [],
    });
  }

  public async search(
    payload: CategorySearchPayload,
  ): Promise<CategorySearchResponseDto> {
    const {
      keyword,
      status,
      sortBy = "sortOrder",
      sortOrder = "asc",
      page = 1,
      limit = 20,
    } = payload;

    const query = buildCategorySearchFilter({ keyword, status });
    const sort = buildCategorySortOptions(sortBy, sortOrder);
    const skip = calculateOffset(page, limit);

    const [categories, total] = await Promise.all([
      this.categoryModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      this.categoryModel.countDocuments(query),
    ]);

    const categoryDtos = categories.map(
      (category) => new CategoryDto(category),
    );

    return new CategorySearchResponseDto({
      categories: categoryDtos,
      total,
      page,
      limit,
    });
  }

  public async bulkOperation(
    payload: CategoryBulkOperationPayload,
  ): Promise<{ success: number; failed: number }> {
    const { action, categoryIds } = payload;
    let success = 0;
    let failed = 0;

    for (const categoryId of categoryIds) {
      try {
        switch (action) {
          case "activate":
            await this.categoryModel.findByIdAndUpdate(categoryId, {
              status: "active",
            });
            break;
          case "deactivate":
            await this.categoryModel.findByIdAndUpdate(categoryId, {
              status: "inactive",
            });
            break;
          case "delete":
            await this.delete(categoryId);
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

  public async getPublicCategories(): Promise<CategoryDto[]> {
    const categories = await this.categoryModel
      .find({ status: "active" })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Count products for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await this.productModel.countDocuments({
          categoryId: category._id,
          status: "active",
        });
        return new CategoryDto({
          ...category,
          productCount,
        });
      }),
    );

    return categoriesWithCount;
  }
}
