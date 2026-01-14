import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Model } from "mongoose";
import { ORDER_PROVIDER, ORDER_STATUS } from "../constants";
import { OrderModel } from "../models";
import { GhnService } from "src/modules/payment/services/ghn.service";

@Injectable()
export class GhnOrderSyncService {
  constructor(
    @Inject(ORDER_PROVIDER)
    private readonly orderModel: Model<OrderModel>,
    @Inject(forwardRef(() => GhnService))
    private readonly ghnService: GhnService,
  ) {}

  private mapGhnStatusToOrderStatus(ghnStatus: string): string | null {
    const status = (ghnStatus || "").toLowerCase();

    if (
      status === "ready_to_pick" ||
      status === "picking" ||
      status === "picked" ||
      status === "storing"
    ) {
      return ORDER_STATUS.PROCESSING;
    }

    if (
      status === "transporting" ||
      status === "sorting" ||
      status === "delivering" ||
      status === "money_collect_picking"
    ) {
      return ORDER_STATUS.SHIPPING;
    }

    if (status === "delivered") {
      return ORDER_STATUS.DELIVERED;
    }

    if (
      status === "delivery_fail" ||
      status === "waiting_to_return" ||
      status === "return" ||
      status === "returned" ||
      status === "cancel"
    ) {
      return ORDER_STATUS.CANCELLED;
    }

    return null;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async syncGhnStatuses() {
    const orders = await this.orderModel
      .find({
        ghnOrderCode: { $ne: "", $exists: true },
        status: {
          $in: [
            ORDER_STATUS.CONFIRMED,
            ORDER_STATUS.PROCESSING,
            ORDER_STATUS.SHIPPING,
          ],
        },
      })
      .select("_id orderNumber ghnOrderCode status")
      .lean();

    if (!orders.length) {
      return;
    }

    for (const order of orders) {
      try {
        const detail = await this.ghnService.getOrderDetailByGhnCode(
          order.ghnOrderCode,
        );
        const data: any = detail?.data || detail;
        let ghnStatus: string =
          data?.status || data?.status_text || data?.current_status || "";

        if (Array.isArray(data?.log) && data.log.length > 0) {
          const lastLog = data.log[data.log.length - 1];
          if (lastLog?.status) {
            ghnStatus = lastLog.status;
          }
        }

        const mapped = this.mapGhnStatusToOrderStatus(ghnStatus);

        if (mapped && mapped !== order.status) {
          await this.orderModel.updateOne(
            { _id: order._id },
            {
              $set: {
                status: mapped,
              },
            },
          );
        }
      } catch (e) {
      }
    }
  }
}

