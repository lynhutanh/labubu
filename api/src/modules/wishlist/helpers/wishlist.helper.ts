import { ObjectId } from "mongodb";
import { IWishlistItem } from "../models";
import { WISHLIST_OWNER_TYPE } from "../constants";

export function buildWishlistFilter(
  ownerId: ObjectId | string,
  ownerType: string,
) {
  return {
    ownerId: new ObjectId(ownerId),
    ownerType,
  };
}

export function findItemIndex(
  items: IWishlistItem[],
  productId: string | ObjectId,
): number {
  const productIdObj = new ObjectId(productId);
  return items.findIndex(
    (item) => item.productId.toString() === productIdObj.toString(),
  );
}

export function calculateTotalItems(items: IWishlistItem[]): number {
  return items.length;
}




