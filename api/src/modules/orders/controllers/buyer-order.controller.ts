import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { AuthGuard } from "src/modules/auth/guards";
import { CurrentUser } from "src/modules/auth/decorators";
import { BuyerOrderService } from "../services";
import {
  CreateOrderPayload,
  OrderSearchPayload,
  CancelOrderPayload,
} from "../payloads";

@ApiTags("Orders")
@Controller("orders")
export class BuyerOrderController {
  constructor(private readonly buyerOrderService: BuyerOrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create new order" })
  async createOrder(
    @CurrentUser() user: any,
    @Body() payload: CreateOrderPayload,
  ) {
    const order = await this.buyerOrderService.createOrder(user, payload);
    return DataResponse.ok(order.toResponse());
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get my orders" })
  async getMyOrders(
    @CurrentUser() user: any,
    @Query() payload: OrderSearchPayload,
  ) {
    const result = await this.buyerOrderService.getMyOrders(user, payload);
    return DataResponse.ok({
      data: result.orders.map((order) => order.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get order by ID" })
  async getOrderById(@CurrentUser() user: any, @Param("id") id: string) {
    const order = await this.buyerOrderService.findById(user, id);
    return DataResponse.ok(order ? order.toResponse() : null);
  }

  @Put(":id/cancel")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel order" })
  async cancelOrder(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() payload: CancelOrderPayload,
  ) {
    const order = await this.buyerOrderService.cancelOrder(user, id, payload);
    return DataResponse.ok(order.toResponse());
  }
}
