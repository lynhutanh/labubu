import {
  Controller,
  Get,
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
import { RoleGuard } from "src/modules/auth/guards";
import { Role } from "src/modules/auth/decorators";
import { ROLE } from "src/modules/user/constants";
import { AdminOrderService } from "../services";
import {
  OrderSearchPayload,
  UpdateOrderStatusPayload,
  UpdatePaymentStatusPayload,
} from "../payloads";

@ApiTags("Admin Orders")
@Controller("admin/orders")
export class AdminOrderController {
  constructor(private readonly adminOrderService: AdminOrderService) {}

  @Get()
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Search orders" })
  async search(@Query() payload: OrderSearchPayload) {
    const result = await this.adminOrderService.search(payload);
    return DataResponse.ok({
      data: result.orders.map((order) => order.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }

  @Get("stats")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get order statistics" })
  async getStats() {
    const stats = await this.adminOrderService.getStats();
    return DataResponse.ok(stats);
  }

  @Get(":id")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get order by ID" })
  async findById(@Param("id") id: string) {
    const order = await this.adminOrderService.findById(id);
    return DataResponse.ok(order ? order.toResponse() : null);
  }

  @Put(":id/status")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update order status" })
  async updateStatus(
    @Param("id") id: string,
    @Body() payload: UpdateOrderStatusPayload,
  ) {
    const order = await this.adminOrderService.updateStatus(id, payload);
    return DataResponse.ok(order.toResponse());
  }

  @Put(":id/payment-status")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update payment status" })
  async updatePaymentStatus(
    @Param("id") id: string,
    @Body() payload: UpdatePaymentStatusPayload,
  ) {
    const order = await this.adminOrderService.updatePaymentStatus(id, payload);
    return DataResponse.ok(order.toResponse());
  }
}
