import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  forwardRef,
} from "@nestjs/common";
import { Model, ClientSession } from "mongoose";
import { ObjectId } from "mongodb";
import { toObjectId } from "src/kernel/helpers/string.helper";
import { RefundRequestModel } from "../models";
import {
  RefundRequestDto,
  RefundRequestSearchResponseDto,
} from "../dtos";
import {
  CreateRefundRequestPayload,
  RefundRequestSearchPayload,
  ProcessRefundRequestPayload,
} from "../payloads";
import {
  REFUND_REQUEST_PROVIDER,
  REFUND_REQUEST_STATUS,
  ORDER_PROVIDER,
  ORDER_STATUS,
  PAYMENT_STATUS,
} from "../constants";
import { OrderModel } from "../models";
import { WalletService } from "src/modules/payment/services";
import { WALLET_OWNER_TYPE } from "src/modules/payment/constants";
import { calculateOffset } from "../helpers";

@Injectable()
export class RefundRequestService {
  constructor(
    @Inject(REFUND_REQUEST_PROVIDER)
    private readonly refundRequestModel: Model<RefundRequestModel>,
    @Inject(ORDER_PROVIDER)
    private readonly orderModel: Model<OrderModel>,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
  ) {}

  async createRefundRequest(
    user: any,
    payload: CreateRefundRequestPayload,
  ): Promise<RefundRequestDto> {
    const order = await this.orderModel.findById(payload.orderId).lean();

    if (!order) {
      throw new NotFoundException("Đơn hàng không tồn tại");
    }

    if (order.buyerId.toString() !== user._id.toString()) {
      throw new BadRequestException("Bạn không có quyền hoàn tiền đơn hàng này");
    }

    if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
      throw new BadRequestException(
        "Chỉ có thể yêu cầu hoàn tiền cho đơn hàng đã thanh toán",
      );
    }

    if (order.status === ORDER_STATUS.REFUNDED) {
      throw new BadRequestException("Đơn hàng đã được hoàn tiền");
    }

    if (order.ghnOrderCode && order.ghnOrderCode.trim() !== "") {
      throw new BadRequestException(
        "Đơn hàng đã được tạo trên GHN, không thể hoàn tiền",
      );
    }

    const existingRequest = await this.refundRequestModel.findOne({
      orderId: toObjectId(payload.orderId),
      status: REFUND_REQUEST_STATUS.PENDING,
    });

    if (existingRequest) {
      throw new BadRequestException("Đã có yêu cầu hoàn tiền đang chờ xử lý");
    }

    const refundRequest = await this.refundRequestModel.create({
      orderId: toObjectId(payload.orderId),
      orderNumber: order.orderNumber,
      userId: toObjectId(user._id),
      amount: order.total,
      reason: payload.reason || "",
      status: REFUND_REQUEST_STATUS.PENDING,
    });

    return new RefundRequestDto(refundRequest.toObject());
  }

  async getRefundRequests(
    payload: RefundRequestSearchPayload,
  ): Promise<RefundRequestSearchResponseDto> {
    try {
      const {
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 20,
      } = payload;

      const query: any = {};
      if (status) {
        query.status = status;
      }

      const sort: any = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      const skip = calculateOffset(page, limit);

      const [requests, total] = await Promise.all([
        this.refundRequestModel
          .find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        this.refundRequestModel.countDocuments(query),
      ]);

      const requestDtos = requests
        .map((req: any) => {
          if (!req) {
            console.error("Empty request found");
            return null;
          }
          try {
            return new RefundRequestDto(req);
          } catch (error) {
            console.error("Error creating RefundRequestDto:", error, JSON.stringify(req, null, 2));
            throw error;
          }
        })
        .filter((dto) => dto !== null) as RefundRequestDto[];

      return new RefundRequestSearchResponseDto({
        requests: requestDtos,
        total,
        page,
        limit,
      });
    } catch (error) {
      console.error("Error in getRefundRequests:", error);
      throw error;
    }
  }

  async getPendingCount(): Promise<number> {
    return this.refundRequestModel.countDocuments({
      status: REFUND_REQUEST_STATUS.PENDING,
    });
  }

  async processRefundRequest(
    admin: any,
    requestId: string,
    payload: ProcessRefundRequestPayload,
  ): Promise<RefundRequestDto> {
    console.log("🔵 [RefundRequestService] Starting processRefundRequest:", {
      requestId,
      adminId: admin._id,
      payload,
    });

    try {
      const request = await this.refundRequestModel.findById(requestId);
      console.log("🔵 [RefundRequestService] Request found:", request ? "Yes" : "No");

      if (!request) {
        throw new NotFoundException("Yêu cầu hoàn tiền không tồn tại");
      }

      if (request.status !== REFUND_REQUEST_STATUS.PENDING) {
        throw new BadRequestException("Yêu cầu hoàn tiền đã được xử lý");
      }

      const order = await this.orderModel.findById(request.orderId);
      console.log("🔵 [RefundRequestService] Order found:", order ? "Yes" : "No");

      if (!order) {
        throw new NotFoundException("Đơn hàng không tồn tại");
      }

      if (order.status === ORDER_STATUS.REFUNDED) {
        throw new BadRequestException("Đơn hàng đã được hoàn tiền");
      }

      if (order.ghnOrderCode && order.ghnOrderCode.trim() !== "") {
        throw new BadRequestException(
          "Đơn hàng đã được tạo trên GHN, không thể hoàn tiền",
        );
      }

      console.log("🔵 [RefundRequestService] Checking wallet for user:", request.userId.toString());
      const wallet = await this.walletService.findByOwner(
        request.userId.toString(),
        WALLET_OWNER_TYPE.USER,
      );

      if (!wallet) {
        console.log("🔵 [RefundRequestService] Wallet not found, creating new wallet");
        await this.walletService.createWallet(
          request.userId.toString(),
          WALLET_OWNER_TYPE.USER,
        );
      }

      console.log("🔵 [RefundRequestService] Processing refund without transaction (standalone MongoDB)");
      
      try {
        console.log("🔵 [RefundRequestService] Calling walletService.refund");
        await this.walletService.refund(
          request.userId.toString(),
          WALLET_OWNER_TYPE.USER,
          request.amount,
          request.orderId.toString(),
          `Hoàn tiền đơn hàng #${request.orderNumber}`,
        );
        console.log("🔵 [RefundRequestService] Wallet refund successful");

        console.log("🔵 [RefundRequestService] Updating order status");
        const orderToUpdate = await this.orderModel.findById(request.orderId);
        if (!orderToUpdate) {
          throw new NotFoundException("Đơn hàng không tồn tại");
        }
        orderToUpdate.status = ORDER_STATUS.REFUNDED;
        orderToUpdate.paymentStatus = PAYMENT_STATUS.REFUNDED;
        await orderToUpdate.save();
        console.log("🔵 [RefundRequestService] Order updated successfully");

        console.log("🔵 [RefundRequestService] Updating refund request status");
        const requestToUpdate = await this.refundRequestModel.findById(requestId);
        if (!requestToUpdate) {
          throw new NotFoundException("Yêu cầu hoàn tiền không tồn tại");
        }
        requestToUpdate.status = REFUND_REQUEST_STATUS.APPROVED;
        requestToUpdate.processedBy = toObjectId(admin._id);
        requestToUpdate.processedAt = new Date();
        requestToUpdate.adminNote = payload.adminNote || "";
        await requestToUpdate.save();
        console.log("🔵 [RefundRequestService] Refund request updated successfully");

        const updatedRequest = await this.refundRequestModel.findById(requestId).lean();
        if (!updatedRequest) {
          throw new NotFoundException("Không thể tải lại yêu cầu hoàn tiền sau khi xử lý");
        }
        
        console.log("🔵 [RefundRequestService] Process completed successfully");
        return new RefundRequestDto(updatedRequest);
      } catch (error: any) {
        console.error("❌ [RefundRequestService] Error processing refund:", error);
        console.error("❌ [RefundRequestService] Error message:", error?.message);
        console.error("❌ [RefundRequestService] Error stack:", error?.stack);
        
        if (error?.code === 20 || error?.message?.includes("Transaction numbers")) {
          console.log("⚠️ [RefundRequestService] MongoDB standalone detected, retrying without transaction");
          throw new BadRequestException(
            "MongoDB đang chạy ở chế độ standalone. Vui lòng cấu hình MongoDB replica set để sử dụng transactions, hoặc liên hệ admin để xử lý thủ công."
          );
        }
        
        throw error;
      }
    } catch (error: any) {
      console.error("❌ [RefundRequestService] Error in processRefundRequest:", error);
      console.error("❌ [RefundRequestService] Error message:", error?.message);
      console.error("❌ [RefundRequestService] Error stack:", error?.stack);
      throw error;
    }
  }

  async rejectRefundRequest(
    admin: any,
    requestId: string,
    payload: ProcessRefundRequestPayload,
  ): Promise<RefundRequestDto> {
    const request = await this.refundRequestModel.findById(requestId);

    if (!request) {
      throw new NotFoundException("Yêu cầu hoàn tiền không tồn tại");
    }

    if (request.status !== REFUND_REQUEST_STATUS.PENDING) {
      throw new BadRequestException("Yêu cầu hoàn tiền đã được xử lý");
    }

    request.status = REFUND_REQUEST_STATUS.REJECTED;
    request.processedBy = toObjectId(admin._id);
    request.processedAt = new Date();
    request.adminNote = payload.adminNote || "";
    await request.save();

    return new RefundRequestDto(request.toObject());
  }
}
