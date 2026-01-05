import { ObjectId } from "mongodb";
import { CartModel, ICartItem } from "../models";

export function calculateTotalItems(items: ICartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function findItemIndex(
  items: ICartItem[],
  productId: ObjectId | string,
): number {
  const productIdStr = productId.toString();
  return items.findIndex((item) => item.productId.toString() === productIdStr);
}

export function buildCartFilter(
  ownerId: ObjectId | string,
  ownerType: string,
): { ownerId: ObjectId; ownerType: string } {
  return {
    ownerId: new ObjectId(ownerId),
    ownerType,
  };
}

export function isItemInCart(cart: CartModel, productId: string): boolean {
  return findItemIndex(cart.items, productId) !== -1;
}
