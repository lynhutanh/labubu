import { Expose, Transform, Type } from "class-transformer";
import { ObjectId } from "mongodb";

export class SubcategoryDto {
  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description?: string;

  @Expose()
  icon?: string;

  @Expose()
  status: "active" | "inactive";

  @Expose()
  sortOrder: number;

  constructor(init?: Partial<SubcategoryDto>) {
    if (init) {
      this.name = init.name || "";
      this.slug = init.slug || "";
      this.description = init.description;
      this.icon = init.icon;
      this.status = init.status || "active";
      this.sortOrder = init.sortOrder || 0;
    }
  }
}

export class CategoryDto {
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
  icon?: string;

  @Expose()
  image?: string;

  @Expose()
  status: "active" | "inactive";

  @Expose()
  sortOrder: number;

  @Expose()
  @Type(() => SubcategoryDto)
  subcategories?: SubcategoryDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  productCount?: number;

  constructor(init?: any) {
    if (init) {
      this._id = init._id;
      this.name = init.name;
      this.slug = init.slug;
      this.description = init.description;
      this.icon = init.icon;
      this.image = init.image;
      this.status = init.status || "active";
      this.sortOrder = init.sortOrder || 0;
      this.subcategories =
        init.subcategories?.map((sub: any) => new SubcategoryDto(sub)) || [];
      this.createdAt = init.createdAt;
      this.updatedAt = init.updatedAt;
      this.productCount = init.productCount ?? 0;
    }
  }
}

export class CategorySearchResponseDto {
  @Expose()
  categories: CategoryDto[];

  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  totalPages: number;

  constructor(init?: Partial<CategorySearchResponseDto>) {
    if (init) {
      this.categories = init.categories || [];
      this.total = init.total || 0;
      this.page = init.page || 1;
      this.limit = init.limit || 20;
      this.totalPages = Math.ceil(this.total / this.limit);
    }
  }
}

export class CategoryStatsDto {
  @Expose()
  totalCategories: number;

  @Expose()
  activeCategories: number;

  @Expose()
  inactiveCategories: number;

  @Expose()
  topCategories: CategoryDto[];

  constructor(init?: Partial<CategoryStatsDto>) {
    if (init) {
      this.totalCategories = init.totalCategories || 0;
      this.activeCategories = init.activeCategories || 0;
      this.inactiveCategories = init.inactiveCategories || 0;
      this.topCategories = init.topCategories || [];
    }
  }
}
