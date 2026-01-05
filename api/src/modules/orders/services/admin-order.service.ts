import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Model } from "mongoose";
import { QueueMessageService } from "src/kernel";
import { EVENT } from "src/kernel/constants";
import { OrderModel } from "../models";
import { OrderDto, OrderSearchResponseDto, OrderStatsDto } from "../dtos";
import {
  OrderSearchPayload,
  UpdateOrderStatusPayload,
  UpdatePaymentStatusPayload,
} from "../payloads";
import {
  ORDER_PROVIDER,
  ORDER_STATUS,
  PAYMENT_STATUS,
  ORDER_CHANNELS,
} from "../constants";
import {
  buildOrderSearchFilter,
  buildOrderSortOptions,
  calculateOffset,
} from "../helpers";
import { ProductModel } from "src/modules/products/models";
import { PRODUCT_PROVIDER } from "src/modules/products/constants";

@Injectable()
export class AdminOrderService {
  constructor(
    @Inject(ORDER_PROVIDER)
    private readonly orderModel: Model<OrderModel>,
    @Inject(PRODUCT_PROVIDER)
    private readonly productModel: Model<ProductModel>,
    private readonly queueEventService: QueueMessageService,
  ) {}

  async findById(orderId: string): Promise<OrderDto | null> {
    const order = await this.orderModel.findById(orderId).lean();
    return order ? new OrderDto(order) : null;
  }

  async search(payload: OrderSearchPayload): Promise<OrderSearchResponseDto> {
    const {
      keyword,
      status,
      paymentStatus,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = payload;

    const query = buildOrderSearchFilter({ keyword, status, paymentStatus });
    const sort = buildOrderSortOptions(sortBy, sortOrder);
    const skip = calculateOffset(page, limit);

    const [orders, total] = await Promise.all([
      this.orderModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      this.orderModel.countDocuments(query),
    ]);

    const orderDtos = orders.map((order) => new OrderDto(order));

    return new OrderSearchResponseDto({
      orders: orderDtos,
      total,
      page,
      limit,
    });
  }

  async updateStatus(
    orderId: string,
    payload: UpdateOrderStatusPayload,
  ): Promise<OrderDto> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException("Đơn hàng không tồn tại");
    }

    const { status, cancelReason } = payload;

    // Validate status transition
    this.validateStatusTransition(order.status, status);

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    switch (status) {
      case ORDER_STATUS.CONFIRMED:
        updateData.confirmedAt = new Date();
        break;
      case ORDER_STATUS.SHIPPING:
        updateData.shippedAt = new Date();
        break;
      case ORDER_STATUS.DELIVERED:
        updateData.deliveredAt = new Date();
        break;
      case ORDER_STATUS.COMPLETED:
        updateData.completedAt = new Date();
        updateData.paymentStatus = PAYMENT_STATUS.PAID;
        break;
      case ORDER_STATUS.CANCELLED:
        updateData.cancelledAt = new Date();
        updateData.cancelReason = cancelReason || "Admin hủy đơn";
        // Restore stock when admin cancels
        await this.restoreProductStock(order);
        break;
    }

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(orderId, { $set: updateData }, { new: true })
      .lean();

    const orderDto = new OrderDto(updatedOrder);

    await this.queueEventService.publish(ORDER_CHANNELS.ORDER_UPDATED, {
      eventName: EVENT.UPDATED,
      data: orderDto,
    });

    return orderDto;
  }

  private validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): void {
    const allowedTransitions: Record<string, string[]> = {
      [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.CONFIRMED]: [
        ORDER_STATUS.PROCESSING,
        ORDER_STATUS.CANCELLED,
      ],
      [ORDER_STATUS.PROCESSING]: [
        ORDER_STATUS.SHIPPING,
        ORDER_STATUS.CANCELLED,
      ],
      [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.REFUNDED],
      [ORDER_STATUS.COMPLETED]: [ORDER_STATUS.REFUNDED],
      [ORDER_STATUS.CANCELLED]: [],
      [ORDER_STATUS.REFUNDED]: [],
    };

    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển từ trạng thái "${currentStatus}" sang "${newStatus}"`,
      );
    }
  }

  private async restoreProductStock(order: OrderModel): Promise<void> {
    for (const item of order.items) {
      await this.productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      });
    }
  }

  async updatePaymentStatus(
    orderId: string,
    payload: UpdatePaymentStatusPayload,
  ): Promise<OrderDto> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException("Đơn hàng không tồn tại");
    }

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        {
          $set: {
            paymentStatus: payload.paymentStatus,
            updatedAt: new Date(),
          },
        },
        { new: true },
      )
      .lean();

    return new OrderDto(updatedOrder);
  }

  async getStats(): Promise<OrderStatsDto> {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      revenueResult,
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: ORDER_STATUS.PENDING }),
      this.orderModel.countDocuments({
        status: {
          $in: [
            ORDER_STATUS.CONFIRMED,
            ORDER_STATUS.PROCESSING,
            ORDER_STATUS.SHIPPING,
          ],
        },
      }),
      this.orderModel.countDocuments({ status: ORDER_STATUS.COMPLETED }),
      this.orderModel.countDocuments({ status: ORDER_STATUS.CANCELLED }),
      this.orderModel.aggregate([
        { $match: { status: ORDER_STATUS.COMPLETED } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    return new OrderStatsDto({
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
    });
  }
}
