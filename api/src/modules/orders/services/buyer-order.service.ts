import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  forwardRef,
} from "@nestjs/common";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { QueueMessageService } from "src/kernel";
import { ConfigService } from "@nestjs/config";
import { EVENT } from "src/kernel/constants";
import { OrderModel, IOrderItem } from "../models";
import { OrderDto, OrderSearchResponseDto } from "../dtos";
import {
  CreateOrderPayload,
  OrderSearchPayload,
  CancelOrderPayload,
} from "../payloads";
import {
  ORDER_PROVIDER,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  BUYER_TYPE,
  ORDER_CHANNELS,
} from "../constants";
import {
  generateOrderNumber,
  buildOrderSearchFilter,
  buildOrderSortOptions,
  calculateOffset,
} from "../helpers";
import { ProductModel } from "src/modules/products/models";
import {
  PRODUCT_PROVIDER,
  PRODUCT_STATUS,
} from "src/modules/products/constants";
import { FileDto } from "src/modules/file/dtos";
import {
  WalletService,
  ZaloPayService,
  PayPalService,
  TransactionService,
  GhnService,
} from "src/modules/payment/services";
import { WALLET_OWNER_TYPE } from "src/modules/payment/constants";
import { CreateTransactionDto } from "src/modules/payment/dtos";
import { SettingService } from "src/modules/settings/services";

interface IPaymentResult {
  paymentUrl?: string;
  transactionId?: string;
  externalTransactionId?: string;
}

@Injectable()
export class BuyerOrderService {
  constructor(
    @Inject(ORDER_PROVIDER)
    private readonly orderModel: Model<OrderModel>,
    @Inject(PRODUCT_PROVIDER)
    private readonly productModel: Model<ProductModel>,
    private readonly queueEventService: QueueMessageService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    @Inject(forwardRef(() => ZaloPayService))
    private readonly zaloPayService: ZaloPayService,
    @Inject(forwardRef(() => PayPalService))
    private readonly payPalService: PayPalService,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
    @Inject(forwardRef(() => GhnService))
    private readonly ghnService: GhnService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => SettingService))
    private readonly settingService: SettingService,
  ) {}

  private getBuyerInfo(user: any): { buyerId: ObjectId; buyerType: string } {
    return {
      buyerId: new ObjectId(user._id),
      buyerType: BUYER_TYPE.USER,
    };
  }

  async createOrder(user: any, payload: CreateOrderPayload): Promise<OrderDto> {
    const { buyerId, buyerType } = this.getBuyerInfo(user);
    const { items, shippingAddress, paymentMethod } = payload;

    if (!items || items.length === 0) {
      throw new BadRequestException("Danh sách sản phẩm không được trống");
    }

    const orderItems: IOrderItem[] = [];
    const productUpdates: Array<{ productId: ObjectId; quantity: number }> = [];

    for (const item of items) {
      const product = await this.productModel
        .findById(item.productId)
        .populate("fileIds")
        .lean();

      if (!product) {
        throw new NotFoundException(`Sản phẩm ${item.productId} không tồn tại`);
      }

      if (product.status !== PRODUCT_STATUS.ACTIVE) {
        throw new BadRequestException(
          `Sản phẩm "${product.name}" không còn được bán`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho`,
        );
      }

      const itemPrice =
        product.salePrice && product.salePrice > 0
          ? product.salePrice
          : product.price;

      let coverImage = "";
      if (product.fileIds && product.fileIds.length > 0) {
        const fileData = product.fileIds[0] as any;
        if (fileData) {
          const fileDto = new FileDto(fileData);
          coverImage = fileDto.getUrl();
        }
      }

      orderItems.push({
        productId: new ObjectId(item.productId),
        name: product.name,
        slug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        quantity: item.quantity,
        subtotal: itemPrice * item.quantity,
        coverImage,
      });

      productUpdates.push({
        productId: new ObjectId(item.productId),
        quantity: item.quantity,
      });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const shippingFee = 0;
    const discount = 0;
    const total = subtotal + shippingFee - discount;

    const walletTransactionId = null;
    let paymentStatus: string = PAYMENT_STATUS.PENDING;
    let paidAt: Date | null = null;

    // Handle wallet payment first
    if (paymentMethod === PAYMENT_METHOD.WALLET) {
      const wallet = await this.walletService.findByOwner(
        buyerId.toString(),
        WALLET_OWNER_TYPE.USER,
      );

      if (!wallet) {
        throw new BadRequestException("Ví của bạn chưa được tạo");
      }

      if (wallet.balance < total) {
        throw new BadRequestException(
          `Số dư ví không đủ. Cần ${total.toLocaleString("vi-VN")}đ, hiện có ${wallet.balance.toLocaleString("vi-VN")}đ`,
        );
      }

      await this.walletService.purchase(
        buyerId.toString(),
        WALLET_OWNER_TYPE.USER,
        {
          amount: total,
          description: `Thanh toán đơn hàng`,
          orderId: "pending",
        },
      );

      paymentStatus = PAYMENT_STATUS.PAID;
      paidAt = new Date();
    }

    // Generate order number first
    const orderNumber = generateOrderNumber();

    // Generate payment_ref for SePay
    let paymentRef = "";
    if (paymentMethod === PAYMENT_METHOD.SEPAY) {
      paymentRef = `SP_${orderNumber}`;
      console.log("=== SePay Order Created ===");
      console.log("Order Number:", orderNumber);
      console.log("Payment Ref (nội dung CK):", paymentRef);
      console.log(
        "⚠️ QUAN TRỌNG: User phải chuyển khoản với nội dung:",
        paymentRef,
      );
      console.log("⚠️ Nếu nội dung không khớp → SePay KHÔNG gửi webhook");
      console.log("===========================");
    }

    // Create order first
    const order = await this.orderModel.create({
      orderNumber,
      buyerId,
      buyerType,
      items: orderItems,
      totalItems,
      subtotal,
      shippingFee,
      discount,
      total,
      shippingAddress,
      paymentMethod: paymentMethod || PAYMENT_METHOD.COD,
      paymentRef,
      paymentStatus,
      walletTransactionId,
      paidAt,
      status: ORDER_STATUS.PENDING,
    });

    // Handle online payment methods (ZaloPay, PayPal)
    let paymentResult: IPaymentResult = {};

    if (paymentMethod === PAYMENT_METHOD.ZALOPAY) {
      paymentResult = await this.handleZaloPayPayment(
        user,
        order,
        orderItems,
        total,
      );
    } else if (paymentMethod === PAYMENT_METHOD.PAYPAL) {
      paymentResult = await this.handlePayPalPayment(
        user,
        order,
        orderItems,
        total,
      );
    }

    for (const update of productUpdates) {
      await this.productModel.findByIdAndUpdate(update.productId, {
        $inc: { stock: -update.quantity, soldCount: update.quantity },
      });
    }

    await this.createGhnOrder(order, shippingAddress);

    const orderDto = new OrderDto(order);

    // Add payment URL to response if available
    if (paymentResult.paymentUrl) {
      (orderDto as any).paymentUrl = paymentResult.paymentUrl;
    }

    await this.queueEventService.publish(ORDER_CHANNELS.ORDER_CREATED, {
      eventName: EVENT.CREATED,
      data: orderDto,
    });

    return orderDto;
  }

  /**
   * Handle ZaloPay payment
   */
  private async handleZaloPayPayment(
    user: any,
    order: OrderModel,
    orderItems: IOrderItem[],
    totalAmount: number,
  ): Promise<IPaymentResult> {
    try {
      const zaloPayItems = orderItems.map((item, index) => ({
        itemid: item.productId.toString() || `item_${index}`,
        itemname: item.name || "Sản phẩm",
        itemprice: item.price || 0,
        itemquantity: item.quantity || 1,
      }));

      const payload = {
        amount: totalAmount,
        appUser: user._id.toString(),
        items: zaloPayItems,
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || "",
      };

      const zaloPayPayment = await this.zaloPayService.createOrder(payload);

      if (zaloPayPayment.returncode !== 1) {
        throw new BadRequestException(
          zaloPayPayment.returnmessage ||
            "Không thể tạo đơn thanh toán ZaloPay",
        );
      }

      // Create transaction record
      const transactionData: CreateTransactionDto = {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: user._id.toString(),
        userEmail: user.email || "",
        userName: user.name || user.email || user._id.toString(),
        amount: totalAmount,
        currency: "VND",
        description: `ZaloPay payment for order ${order.orderNumber}`,
        paymentMethod: PAYMENT_METHOD.ZALOPAY,
        paymentProvider: "zalopay",
        externalTransactionId: zaloPayPayment.apptransid || "",
        providerData: {
          appTransId: zaloPayPayment.apptransid,
          orderUrl: zaloPayPayment.orderurl,
          zpTransToken: zaloPayPayment.zptranstoken,
          returnCode: zaloPayPayment.returncode,
          returnMessage: zaloPayPayment.returnmessage,
        },
      };

      const transaction =
        await this.transactionService.createTransaction(transactionData);

      // Update order with transaction ID
      await this.orderModel.updateOne(
        { _id: order._id },
        { paymentTransactionId: transaction._id },
      );

      return {
        transactionId: transaction._id.toString(),
        externalTransactionId: zaloPayPayment.apptransid || "",
        paymentUrl: zaloPayPayment.orderurl,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Lỗi tạo thanh toán ZaloPay: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Handle PayPal payment
   */
  private async handlePayPalPayment(
    user: any,
    order: OrderModel,
    orderItems: IOrderItem[],
    totalAmount: number,
  ): Promise<IPaymentResult> {
    try {
      const paypalItems = orderItems.map((item) => ({
        name: item.name || "Product",
        quantity: item.quantity || 1,
        unitAmount: item.price || 0,
        description: item.name,
      }));

      const payload = {
        amount: totalAmount,
        currency: "VND",
        description: `Payment for order ${order.orderNumber}`,
        referenceId: order._id.toString(),
        customId: order.orderNumber,
        items: paypalItems,
      };

      const paypalPayment = await this.payPalService.createOrder(payload);

      if (!paypalPayment.approvalUrl) {
        throw new BadRequestException("Không thể tạo đơn thanh toán PayPal");
      }

      // Create transaction record
      const transactionData: CreateTransactionDto = {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: user._id.toString(),
        userEmail: user.email || "",
        userName: user.name || user.email || user._id.toString(),
        amount: totalAmount,
        currency: "VND",
        description: `PayPal payment for order ${order.orderNumber}`,
        paymentMethod: PAYMENT_METHOD.PAYPAL,
        paymentProvider: "paypal",
        externalTransactionId: paypalPayment.id || "",
        providerData: {
          paypalOrderId: paypalPayment.id,
          status: paypalPayment.status,
          approvalUrl: paypalPayment.approvalUrl,
          exchangeInfo: (paypalPayment as any).exchangeInfo,
        },
      };

      const transaction =
        await this.transactionService.createTransaction(transactionData);

      // Update order with transaction ID
      await this.orderModel.updateOne(
        { _id: order._id },
        { paymentTransactionId: transaction._id },
      );

      return {
        transactionId: transaction._id.toString(),
        externalTransactionId: paypalPayment.id || "",
        paymentUrl: paypalPayment.approvalUrl,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Lỗi tạo thanh toán PayPal: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async cancelOrder(
    user: any,
    orderId: string,
    payload: CancelOrderPayload,
  ): Promise<OrderDto> {
    const { buyerId, buyerType } = this.getBuyerInfo(user);

    const order = await this.orderModel.findOne({
      _id: orderId,
      buyerId,
      buyerType,
    });

    if (!order) {
      throw new NotFoundException("Đơn hàng không tồn tại");
    }

    const cancellableStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED];
    if (!cancellableStatuses.includes(order.status as any)) {
      throw new BadRequestException(
        "Không thể hủy đơn hàng ở trạng thái hiện tại",
      );
    }

    if (
      order.paymentMethod === PAYMENT_METHOD.WALLET &&
      order.paymentStatus === PAYMENT_STATUS.PAID
    ) {
      order.paymentStatus = PAYMENT_STATUS.REFUNDED;
    }

    order.status = ORDER_STATUS.CANCELLED;
    order.cancelReason = payload.reason || "Người mua hủy đơn";
    order.cancelledAt = new Date();
    await order.save();

    const orderDto = new OrderDto(order);

    await this.queueEventService.publish(ORDER_CHANNELS.ORDER_CANCELLED, {
      eventName: EVENT.UPDATED,
      data: orderDto,
    });

    return orderDto;
  }

  async findById(user: any, orderId: string): Promise<OrderDto | null> {
    const { buyerId, buyerType } = this.getBuyerInfo(user);

    const order = await this.orderModel
      .findOne({
        _id: orderId,
        buyerId,
        buyerType,
      })
      .lean();

    return order ? new OrderDto(order) : null;
  }

  async findByOrderNumber(
    user: any,
    orderNumber: string,
  ): Promise<OrderDto | null> {
    const { buyerId, buyerType } = this.getBuyerInfo(user);

    const order = await this.orderModel
      .findOne({
        orderNumber,
        buyerId,
        buyerType,
      })
      .lean();

    return order ? new OrderDto(order) : null;
  }

  async getMyOrders(
    user: any,
    payload: OrderSearchPayload,
  ): Promise<OrderSearchResponseDto> {
    const { buyerId, buyerType } = this.getBuyerInfo(user);
    const {
      status,
      paymentStatus,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = payload;

    const query = buildOrderSearchFilter({
      status,
      paymentStatus,
      buyerId: buyerId.toString(),
      buyerType,
    });

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

  private async createGhnOrder(order: OrderModel, shippingAddress: any): Promise<void> {
    try {
      console.log("=== GHN Create Order Debug ===");
      console.log("Order Info:", {
        orderNumber: order.orderNumber,
        orderId: order._id,
        total: order.total,
        paymentMethod: order.paymentMethod,
        itemsCount: order.items.length,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
        })),
      });

      console.log("Shipping Address:", {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        ward: shippingAddress.ward,
        wardCode: shippingAddress.wardCode,
        district: shippingAddress.district,
        districtId: shippingAddress.districtId,
        city: shippingAddress.city,
        provinceId: shippingAddress.provinceId,
        note: shippingAddress.note,
      });

      if (!shippingAddress.wardCode || !shippingAddress.districtId) {
        console.warn(
          `❌ Order ${order.orderNumber} missing wardCode or districtId, skipping GHN order creation`,
        );
        console.log("Missing fields:", {
          hasWardCode: !!shippingAddress.wardCode,
          hasDistrictId: !!shippingAddress.districtId,
        });
        return;
      }

      const shopName = await this.settingService.get("siteName");
      const shopPhoneRaw = await this.settingService.get("contactPhone");
      const shopAddress = await this.settingService.get("contactAddress");
      const shopWard = await this.settingService.get("contactWard");
      const shopDistrict = await this.settingService.get("contactDistrict");
      const shopProvince = await this.settingService.get("contactProvince");

      console.log("Shop Info from Settings:", {
        siteName: shopName,
        contactPhone: shopPhoneRaw,
        contactAddress: shopAddress,
        contactWard: shopWard,
        contactDistrict: shopDistrict,
        contactProvince: shopProvince,
      });

      if (!shopName || !shopPhoneRaw || !shopAddress) {
        console.warn("❌ Shop info not configured in settings, skipping GHN order creation");
        console.log("Missing shop fields:", {
          hasShopName: !!shopName,
          hasShopPhone: !!shopPhoneRaw,
          hasShopAddress: !!shopAddress,
        });
        return;
      }

      const shopPhone = String(shopPhoneRaw).replace(/\s+/g, "").trim();
      
      console.log("Shop Phone Processing:", {
        raw: shopPhoneRaw,
        processed: shopPhone,
        length: shopPhone.length,
      });

      if (!shopPhone || shopPhone.length < 10) {
        console.warn("❌ Shop phone number invalid, skipping GHN order creation");
        return;
      }

      const totalWeight = order.items.reduce((sum, item) => {
        const estimatedWeight = 200;
        return sum + estimatedWeight * item.quantity;
      }, 0);

      const ghnPayload = {
        orderCode: order.orderNumber,
        toName: shippingAddress.fullName,
        toPhone: shippingAddress.phone,
        toAddress: shippingAddress.address,
        toWardCode: shippingAddress.wardCode,
        toDistrictId: shippingAddress.districtId,
        fromName: shopName || "Shop",
        fromPhone: shopPhone,
        fromAddress: shopAddress || "",
        fromWardName: shopWard || "",
        fromDistrictName: shopDistrict || "",
        fromProvinceName: shopProvince || "",
        weight: Math.max(totalWeight, 100),
        length: 20,
        width: 15,
        height: 10,
        codAmount:
          order.paymentMethod === PAYMENT_METHOD.COD ? order.total : 0,
        serviceTypeId: 2,
        paymentTypeId: order.paymentMethod === PAYMENT_METHOD.COD ? 2 : 1,
        requiredNote: "KHONGCHOXEMHANG",
        content: `Đơn hàng ${order.orderNumber}`,
      };

      console.log("GHN Payload (Full):", JSON.stringify(ghnPayload, null, 2));
      console.log("GHN Payload Summary:", {
        orderCode: ghnPayload.orderCode,
        toName: ghnPayload.toName,
        toPhone: ghnPayload.toPhone,
        toAddress: ghnPayload.toAddress,
        toWardCode: ghnPayload.toWardCode,
        toDistrictId: ghnPayload.toDistrictId,
        fromName: ghnPayload.fromName,
        fromPhone: ghnPayload.fromPhone,
        fromAddress: ghnPayload.fromAddress,
        fromWardName: ghnPayload.fromWardName,
        fromDistrictName: ghnPayload.fromDistrictName,
        fromProvinceName: ghnPayload.fromProvinceName,
        weight: ghnPayload.weight,
        dimensions: `${ghnPayload.length}x${ghnPayload.width}x${ghnPayload.height}`,
        codAmount: ghnPayload.codAmount,
        serviceTypeId: ghnPayload.serviceTypeId,
        paymentTypeId: ghnPayload.paymentTypeId,
        requiredNote: ghnPayload.requiredNote,
        content: ghnPayload.content,
      });

      console.log("Calling GHN API...");
      const ghnResponse = await this.ghnService.createOrder(ghnPayload);
      
      console.log("GHN API Response:", {
        fullResponse: ghnResponse,
        orderCode: ghnResponse?.data?.order_code,
        code: ghnResponse?.code,
        message: ghnResponse?.message,
      });

      const ghnOrderCode = ghnResponse?.data?.order_code;

      if (ghnOrderCode) {
        await this.orderModel.updateOne(
          { _id: order._id },
          { ghnOrderCode },
        );
        console.log(
          `✅ GHN order created successfully: ${ghnOrderCode} for order ${order.orderNumber}`,
        );
      } else {
        console.warn("⚠️ GHN order created but no order_code in response");
      }
      console.log("=============================");
    } catch (error: any) {
      console.error("❌ Failed to create GHN order:", {
        orderNumber: order.orderNumber,
        error: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        stack: error?.stack,
      });
      console.log("=============================");
    }
  }
}
