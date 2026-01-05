import { Expose, Transform } from "class-transformer";
import { FileDto } from "src/modules/file/dtos";

export class BrandDto {
  @Expose()
  @Transform(({ obj }) => obj._id || obj?._id?.toString())
  _id: string;

  @Expose()
  name: string;

  @Expose()
  slug?: string;

  @Expose()
  description?: string;

  @Expose()
  fileId?: string;

  @Expose()
  logo?: {
    _id: string;
    url: string;
    thumbnailUrl?: string;
    name?: string;
    mimeType?: string;
  };

  @Expose()
  website?: string;

  @Expose()
  origin?: string;

  @Expose()
  status?: string;

  @Expose()
  sortOrder?: number;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;

  constructor(init?: any) {
    if (init) {
      this._id = init._id?.toString() || init._id;
      this.name = init.name;
      this.slug = init.slug;
      this.description = init.description;

      // Transform fileId/logo to proper format with URL
      const fileData = init.logo || init.fileId;
      if (fileData && typeof fileData === "object" && fileData._id) {
        const fileDto = new FileDto(fileData);
        this.logo = fileDto.toPublicResponse() as any;
        this.fileId = fileData._id?.toString();
      } else {
        this.fileId = fileData?.toString() || fileData;
        this.logo = undefined;
      }

      this.website = init.website;
      this.origin = init.origin;
      this.status = init.status;
      this.sortOrder = init.sortOrder;
      this.createdAt = init.createdAt;
      this.updatedAt = init.updatedAt;
    }
  }
}

export class BrandSearchResponseDto {
  @Expose()
  brands: BrandDto[];

  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  totalPages: number;

  constructor(init?: Partial<BrandSearchResponseDto>) {
    if (init) {
      this.brands = init.brands || [];
      this.total = init.total || 0;
      this.page = init.page || 1;
      this.limit = init.limit || 20;
      this.totalPages = Math.ceil(this.total / this.limit);
    }
  }
}

export class BrandStatsDto {
  @Expose()
  totalBrands: number;

  @Expose()
  activeBrands: number;

  @Expose()
  inactiveBrands: number;

  constructor(init?: Partial<BrandStatsDto>) {
    if (init) {
      this.totalBrands = init.totalBrands || 0;
      this.activeBrands = init.activeBrands || 0;
      this.inactiveBrands = init.inactiveBrands || 0;
    }
  }
}
