import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { WISHLIST_PROVIDER } from "../providers";
import { WishlistModel } from "../models";
import { WishlistDto } from "../dtos";
import { WISHLIST_OWNER_TYPE } from "../constants";
import {
  calculateTotalItems,
  findItemIndex,
  buildWishlistFilter,
} from "../helpers";
import { AddToWishlistPayload, RemoveFromWishlistPayload } from "../payloads";
import { ProductModel } from "src/modules/products/models";
import {
  PRODUCT_PROVIDER,
  PRODUCT_STATUS,
} from "src/modules/products/constants";

@Injectable()
export class WishlistService {
  constructor(
    @Inject(WISHLIST_PROVIDER)
    private readonly wishlistModel: Model<WishlistModel>,
    @Inject(PRODUCT_PROVIDER)
    private readonly productModel: Model<ProductModel>,
  ) {}

  private getOwnerInfo(user: any): { ownerId: ObjectId; ownerType: string } {
    return {
      ownerId: new ObjectId(user._id),
      ownerType: WISHLIST_OWNER_TYPE.USER,
    };
  }

  async createWishlist(
    ownerId: ObjectId | string,
    ownerType: string,
  ): Promise<WishlistModel> {
    const existingWishlist = await this.wishlistModel.findOne(
      buildWishlistFilter(ownerId, ownerType),
    );
    if (existingWishlist) {
      return existingWishlist;
    }

    const wishlist = new this.wishlistModel({
      ownerId: new ObjectId(ownerId),
      ownerType,
      items: [],
      totalItems: 0,
    });
    return wishlist.save();
  }

  async getWishlist(user: any): Promise<WishlistDto> {
    const { ownerId, ownerType } = this.getOwnerInfo(user);

    let wishlist: any = await this.wishlistModel
      .findOne(buildWishlistFilter(ownerId, ownerType))
      .populate({
        path: "items.productId",
        populate: [
          {
            path: "fileIds",
          },
          {
            path: "brandId",
            select: "_id name",
          },
        ],
      })
      .lean();

    if (!wishlist) {
      const newWishlist = await this.createWishlist(ownerId, ownerType);
      wishlist = newWishlist.toObject();
    }

    return new WishlistDto(wishlist);
  }

  async addToWishlist(
    user: any,
    payload: AddToWishlistPayload,
  ): Promise<WishlistDto> {
    const { ownerId, ownerType } = this.getOwnerInfo(user);
    const { productId } = payload;

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException("Sản phẩm không tồn tại");
    }

    if (product.status !== PRODUCT_STATUS.ACTIVE) {
      throw new BadRequestException("Sản phẩm không còn được bán");
    }

    let wishlist: any = await this.wishlistModel.findOne(
      buildWishlistFilter(ownerId, ownerType),
    );
    if (!wishlist) {
      wishlist = await this.createWishlist(ownerId, ownerType);
    }

    const existingIndex = findItemIndex(wishlist.items, productId);
    if (existingIndex !== -1) {
      throw new BadRequestException("Sản phẩm đã có trong danh sách yêu thích");
    }

    wishlist.items.push({
      productId: new ObjectId(productId),
      addedAt: new Date(),
    });
    wishlist.totalItems = calculateTotalItems(wishlist.items);
    await wishlist.save();

    const populatedWishlist = await this.wishlistModel
      .findById(wishlist._id)
      .populate({
        path: "items.productId",
        populate: [
          {
            path: "fileIds",
          },
          {
            path: "brandId",
            select: "_id name",
          },
        ],
      })
      .lean();

    return new WishlistDto(populatedWishlist);
  }

  async removeFromWishlist(
    user: any,
    payload: RemoveFromWishlistPayload,
  ): Promise<WishlistDto> {
    const { ownerId, ownerType } = this.getOwnerInfo(user);
    const { productId } = payload;

    const wishlist = await this.wishlistModel.findOne(
      buildWishlistFilter(ownerId, ownerType),
    );
    if (!wishlist) {
      throw new NotFoundException("Danh sách yêu thích không tồn tại");
    }

    const itemIndex = findItemIndex(wishlist.items, productId);
    if (itemIndex === -1) {
      throw new NotFoundException(
        "Sản phẩm không có trong danh sách yêu thích",
      );
    }

    wishlist.items.splice(itemIndex, 1);
    wishlist.totalItems = calculateTotalItems(wishlist.items);
    await wishlist.save();

    const populatedWishlist = await this.wishlistModel
      .findById(wishlist._id)
      .populate({
        path: "items.productId",
        populate: [
          {
            path: "fileIds",
          },
          {
            path: "brandId",
            select: "_id name",
          },
        ],
      })
      .lean();

    return new WishlistDto(populatedWishlist);
  }

  async clearWishlist(user: any): Promise<WishlistDto> {
    const { ownerId, ownerType } = this.getOwnerInfo(user);

    const wishlist = await this.wishlistModel.findOne(
      buildWishlistFilter(ownerId, ownerType),
    );
    if (!wishlist) {
      throw new NotFoundException("Danh sách yêu thích không tồn tại");
    }

    wishlist.items = [];
    wishlist.totalItems = 0;
    await wishlist.save();

    return new WishlistDto(wishlist.toObject());
  }

  async isInWishlist(user: any, productId: string): Promise<boolean> {
    const { ownerId, ownerType } = this.getOwnerInfo(user);

    const wishlist = await this.wishlistModel.findOne(
      buildWishlistFilter(ownerId, ownerType),
    );
    if (!wishlist) {
      return false;
    }

    return findItemIndex(wishlist.items, productId) !== -1;
  }
}
