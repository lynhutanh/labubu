import { Expose, Transform, Type } from "class-transformer";
import { ObjectId } from "mongodb";
import { FileDto } from "src/modules/file/dtos";

export class WishlistItemProductDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  price: number;

  @Expose()
  salePrice?: number;

  @Expose()
  stock: number;

  @Expose()
  status: string;

  @Expose()
  files: any[];

  @Expose()
  coverImage?: string;

  @Expose()
  brand?: {
    _id: ObjectId;
    name: string;
  };

  constructor(init?: any) {
    if (init) {
      this._id = init._id;
      this.name = init.name;
      this.slug = init.slug;
      this.price = init.price;
      this.salePrice = init.salePrice;
      this.stock = init.stock || 0;
      this.status = init.status;
      const files = (init.fileIds || []).map((f: any) =>
        FileDto.fromModel(f).toPublicResponse(),
      );
      this.files = files;
      this.coverImage = files[0]?.url || "";
      if (init.brandId && typeof init.brandId === "object") {
        this.brand = {
          _id: init.brandId._id,
          name: init.brandId.name,
        };
      }
    }
  }
}

export class WishlistItemDto {
  @Expose()
  @Transform(({ obj }) => obj.productId)
  productId: ObjectId;

  @Expose()
  addedAt: Date;

  @Expose()
  @Type(() => WishlistItemProductDto)
  product?: WishlistItemProductDto;

  constructor(init?: any) {
    if (init) {
      this.productId = init.productId?._id || init.productId;
      this.addedAt = init.addedAt;

      if (
        init.productId &&
        typeof init.productId === "object" &&
        init.productId.name
      ) {
        this.product = new WishlistItemProductDto(init.productId);
      }
    }
  }
}

export class WishlistDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose()
  @Transform(({ obj }) => obj.ownerId)
  ownerId: ObjectId;

  @Expose()
  ownerType: string;

  @Expose()
  @Type(() => WishlistItemDto)
  items: WishlistItemDto[];

  @Expose()
  totalItems: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(init?: any) {
    if (init) {
      this._id = init._id;
      this.ownerId = init.ownerId;
      this.ownerType = init.ownerType;
      this.items = (init.items || []).map(
        (item: any) => new WishlistItemDto(item),
      );
      this.totalItems = init.totalItems || this.items.length;
      this.createdAt = init.createdAt;
      this.updatedAt = init.updatedAt;
    }
  }
}




