import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { CART_PROVIDER } from "../providers";
import { CartModel } from "../models";
import { CartDto } from "../dtos";
import { CART_OWNER_TYPE } from "../constants";
import {
  calculateTotalItems,
  findItemIndex,
  buildCartFilter,
} from "../helpers";
import {
  AddToCartPayload,
  UpdateCartItemPayload,
  RemoveFromCartPayload,
} from "../payloads";
import { ProductModel } from "src/modules/products/models";
import {
  PRODUCT_PROVIDER,
  PRODUCT_STATUS,
} from "src/modules/products/constants";

@Injectable()
export class CartService {
  constructor(
    @Inject(CART_PROVIDER)
    private readonly cartModel: Model<CartModel>,
    @Inject(PRODUCT_PROVIDER)
    private readonly productModel: Model<ProductModel>,
  ) {}

  private getOwnerInfo(user: any): { ownerId: ObjectId; ownerType: string } {
    return {
      ownerId: new ObjectId(user._id),
      ownerType: CART_OWNER_TYPE.USER,
    };
  }

  async createCart(
    ownerId: ObjectId | string,
    ownerType: string,
  ): Promise<CartModel> {
    const existingCart = await this.cartModel.findOne(
      buildCartFilter(ownerId, ownerType),
    );
    if (existingCart) {
      return existingCart;
    }

    const cart = new this.cartModel({
      ownerId: new ObjectId(ownerId),
      ownerType,
      items: [],
      totalItems: 0,
    });
    return cart.save();
  }

  async getCart(user: any): Promise<CartDto> {
    const { ownerId, ownerType } = this.getOwnerInfo(user);

    let cart = await this.cartModel
      .findOne(buildCartFilter(ownerId, ownerType))
      .populate({
        path: "items.productId",
        populate: {
          path: "fileIds",
        },
      })
      .lean();

    if (!cart) {
      const newCart = await this.createCart(ownerId, ownerType);
      cart = newCart.toObject();
    }

    return new CartDto(cart);
  }

  async addToCart(user: any, payload: AddToCartPayload): Promise<CartDto> {
    const { ownerId, ownerType } = this.getOwnerInfo(user);
    const { productId, quantity } = payload;

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException("Sản phẩm không tồn tại");
    }

    if (product.status !== PRODUCT_STATUS.ACTIVE) {
      throw new BadRequestException("Sản phẩm không còn được bán");
    }

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Sản phẩm chỉ còn ${product.stock} trong kho`,
      );
    }

    let cart: any = await this.cartModel.findOne(
      buildCartFilter(ownerId, ownerType),
    );
    if (!cart) {
      cart = await this.createCart(ownerId, ownerType);
    }

    const existingIndex = findItemIndex(cart.items, productId);
    if (existingIndex !== -1) {
      const newQuantity = cart.items[existingIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `Không thể thêm. Tổng số lượng vượt quá tồn kho (${product.stock})`,
        );
      }
      cart.items[existingIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        productId: new ObjectId(productId),
        quantity,
        addedAt: new Date(),
      });
    }

    cart.totalItems = calculateTotalItems(cart.items);
    await cart.save();

    return this.getCart(user);
  }

  async updateCartItem(
    user: any,
    payload: UpdateCartItemPayload,
  ): Promise<CartDto> {
    const { ownerId, ownerType } = this.getOwnerInfo(user);
    const { productId, quantity } = payload;

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException("Sản phẩm không tồn tại");
    }

    if (quantity > product.stock) {
      throw new BadRequestException(
        `Số lượng vượt quá tồn kho (${product.stock})`,
      );
    }

    const cart = await this.cartModel.findOne(
      buildCartFilter(ownerId, ownerType),
    );
    if (!cart) {
      throw new NotFoundException("Giỏ hàng không tồn tại");
    }

    const itemIndex = findItemIndex(cart.items, productId);
    if (itemIndex === -1) {
      throw new NotFoundException("Sản phẩm không có trong giỏ hàng");
    }

    cart.items[itemIndex].quantity = quantity;
    cart.totalItems = calculateTotalItems(cart.items);
    await cart.save();

    return this.getCart(user);
  }

  async removeFromCart(
    user: any,
    payload: RemoveFromCartPayload,
  ): Promise<CartDto> {
    const { ownerId, ownerType } = this.getOwnerInfo(user);
    const { productId } = payload;

    const cart = await this.cartModel.findOne(
      buildCartFilter(ownerId, ownerType),
    );
    if (!cart) {
      throw new NotFoundException("Giỏ hàng không tồn tại");
    }

    const itemIndex = findItemIndex(cart.items, productId);
    if (itemIndex === -1) {
      throw new NotFoundException("Sản phẩm không có trong giỏ hàng");
    }

    cart.items.splice(itemIndex, 1);
    cart.totalItems = calculateTotalItems(cart.items);
    await cart.save();

    return this.getCart(user);
  }

  async clearCart(user: any): Promise<CartDto> {
    const { ownerId, ownerType } = this.getOwnerInfo(user);

    const cart = await this.cartModel.findOne(
      buildCartFilter(ownerId, ownerType),
    );
    if (!cart) {
      throw new NotFoundException("Giỏ hàng không tồn tại");
    }

    cart.items = [];
    cart.totalItems = 0;
    await cart.save();

    return new CartDto(cart);
  }

  async createUserCart(userId: ObjectId | string): Promise<CartModel> {
    return this.createCart(userId, CART_OWNER_TYPE.USER);
  }

  async deleteCartByOwner(
    ownerId: ObjectId | string,
    ownerType: string,
  ): Promise<boolean> {
    const result = await this.cartModel.deleteOne(
      buildCartFilter(ownerId, ownerType),
    );
    return result.deletedCount > 0;
  }
}
