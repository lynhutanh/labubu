import { Expose, Transform, Type } from "class-transformer";
import { ObjectId } from "mongodb";
import { FileDto } from "src/modules/file/dtos";

export class CartItemProductDto {
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
    }
  }
}

export class CartItemDto {
  @Expose()
  @Transform(({ obj }) => obj.productId)
  productId: ObjectId;

  @Expose()
  quantity: number;

  @Expose()
  addedAt: Date;

  @Expose()
  @Type(() => CartItemProductDto)
  product?: CartItemProductDto;

  @Expose()
  itemTotal?: number;

  constructor(init?: any) {
    if (init) {
      this.productId = init.productId?._id || init.productId;
      this.quantity = init.quantity || 1;
      this.addedAt = init.addedAt;

      if (
        init.productId &&
        typeof init.productId === "object" &&
        init.productId.name
      ) {
        this.product = new CartItemProductDto(init.productId);
        const price = this.product.salePrice || this.product.price || 0;
        this.itemTotal = price * this.quantity;
      }
    }
  }
}

export class CartDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose()
  @Transform(({ obj }) => obj.ownerId)
  ownerId: ObjectId;

  @Expose()
  ownerType: string;

  @Expose()
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @Expose()
  totalItems: number;

  @Expose()
  totalPrice: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(init?: any) {
    if (init) {
      this._id = init._id;
      this.ownerId = init.ownerId;
      this.ownerType = init.ownerType;
      this.items = (init.items || []).map((item: any) => new CartItemDto(item));
      this.totalItems = init.totalItems || this.items.length;
      this.totalPrice = this.items.reduce(
        (sum: number, item: CartItemDto) => sum + (item.itemTotal || 0),
        0,
      );
      this.createdAt = init.createdAt;
      this.updatedAt = init.updatedAt;
    }
  }
}
