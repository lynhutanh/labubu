import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { Model } from "mongoose";
import { QueueEventListener, QueueMessageService } from "src/kernel";
import { EVENT } from "src/kernel/constants";
import { logError } from "src/lib/utils";
import {
  ORDER_CHANNELS,
  ORDER_TOPICS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "../constants";
import { ProductModel } from "src/modules/products/models";
import { PRODUCT_PROVIDER } from "src/modules/products/constants";
import { WalletService } from "src/modules/payment/services";
import { WALLET_OWNER_TYPE } from "src/modules/payment/constants";

@Injectable()
export class OrderCancelledListener {
  constructor(
    private readonly queueEventService: QueueMessageService,
    @Inject(PRODUCT_PROVIDER)
    private readonly productModel: Model<ProductModel>,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
  ) {
    this.queueEventService.subscribe(
      ORDER_CHANNELS.ORDER_CANCELLED,
      ORDER_TOPICS.ORDER_CANCELLED,
      this.handleOrderCancelled.bind(this),
    );
  }

  public async handleOrderCancelled({ data: event }: QueueEventListener) {
    const { eventName, data } = event;
    if (eventName !== EVENT.UPDATED) return;

    try {
      const order = data;
      if (!order || !order.items) return;

      await this.restoreProductStock(order.items);
      await this.refundWalletPayment(order);
    } catch (e) {
      logError("handleOrderCancelled", e);
    }
  }

  private async restoreProductStock(
    items: Array<{ productId: any; quantity: number }>,
  ): Promise<void> {
    try {
      for (const item of items) {
        await this.productModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity, soldCount: -item.quantity },
        });
      }
    } catch (e) {
      logError("restoreProductStock", e);
    }
  }

  private async refundWalletPayment(order: any): Promise<void> {
    try {
      if (
        order.paymentMethod !== PAYMENT_METHOD.WALLET ||
        order.paymentStatus !== PAYMENT_STATUS.PAID
      ) {
        return;
      }

      await this.walletService.refund(
        order.buyerId.toString(),
        WALLET_OWNER_TYPE.USER,
        order.total,
        order._id.toString(),
        `Hoàn tiền đơn hàng #${order.orderNumber}`,
      );
    } catch (e) {
      logError("refundWalletPayment", e);
    }
  }
}
