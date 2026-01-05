import { Injectable, Inject } from "@nestjs/common";
import { Model } from "mongoose";
import { QueueEventListener, QueueMessageService } from "src/kernel";
import { EVENT } from "src/kernel/constants";
import { logError } from "src/lib/utils";
import { ORDER_CHANNELS, ORDER_TOPICS } from "../constants";
import { CART_PROVIDER } from "src/modules/cart/providers";
import { CartModel } from "src/modules/cart/models";
import { CART_OWNER_TYPE } from "src/modules/cart/constants";

@Injectable()
export class OrderCreatedListener {
  constructor(
    private readonly queueEventService: QueueMessageService,
    @Inject(CART_PROVIDER)
    private readonly cartModel: Model<CartModel>,
  ) {
    this.queueEventService.subscribe(
      ORDER_CHANNELS.ORDER_CREATED,
      ORDER_TOPICS.ORDER_CREATED,
      this.handleOrderCreated.bind(this),
    );
  }

  public async handleOrderCreated({ data: event }: QueueEventListener) {
    const { eventName, data } = event;
    if (eventName !== EVENT.CREATED) return;

    try {
      const order = data;
      if (!order || !order.items) return;

      await this.updateCartAfterOrder(order);
    } catch (e) {
      logError("handleOrderCreated", e);
    }
  }

  private async updateCartAfterOrder(order: any): Promise<void> {
    try {
      const cart = await this.cartModel.findOne({
        ownerId: order.buyerId,
        ownerType: CART_OWNER_TYPE.USER,
      });

      if (!cart) return;

      for (const orderItem of order.items) {
        const cartItemIndex = cart.items.findIndex(
          (item: any) =>
            item.productId.toString() === orderItem.productId?.toString(),
        );

        if (cartItemIndex !== -1) {
          const newQuantity =
            cart.items[cartItemIndex].quantity - orderItem.quantity;

          if (newQuantity < 1) {
            cart.items.splice(cartItemIndex, 1);
          } else {
            cart.items[cartItemIndex].quantity = newQuantity;
          }
        }
      }

      cart.totalItems = cart.items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0,
      );
      await cart.save();
    } catch (e) {
      logError("updateCartAfterOrder", e);
    }
  }
}
