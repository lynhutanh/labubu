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
import { AuthGuard, RoleGuard } from "src/modules/auth/guards";
import { CurrentUser, Role } from "src/modules/auth/decorators";
import { ROLE } from "src/modules/user/constants";
import { RefundRequestService } from "../services";
import {
  CreateRefundRequestPayload,
  RefundRequestSearchPayload,
  ProcessRefundRequestPayload,
} from "../payloads";

@ApiTags("Refund Requests")
@Controller("refund-requests")
export class RefundRequestController {
  constructor(private readonly refundRequestService: RefundRequestService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo yêu cầu hoàn tiền" })
  async createRefundRequest(
    @CurrentUser() user: any,
    @Body() payload: CreateRefundRequestPayload,
  ) {
    const request = await this.refundRequestService.createRefundRequest(
      user,
      payload,
    );
    return DataResponse.ok(request.toResponse());
  }

  @Get("admin")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lấy danh sách yêu cầu hoàn tiền (Admin)" })
  async getRefundRequests(@Query() payload: RefundRequestSearchPayload) {
    try {
      const result = await this.refundRequestService.getRefundRequests(payload);
      return DataResponse.ok({
        data: result.requests.map((req) => req.toResponse()),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      console.error("Error in getRefundRequests controller:", error);
      throw error;
    }
  }

  @Get("admin/pending-count")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Đếm số yêu cầu hoàn tiền chưa xử lý" })
  async getPendingCount() {
    const count = await this.refundRequestService.getPendingCount();
    return DataResponse.ok({ count });
  }

  @Put("admin/:id/approve")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Xác nhận hoàn tiền (Admin)" })
  async approveRefundRequest(
    @CurrentUser() admin: any,
    @Param("id") id: string,
    @Body() payload: ProcessRefundRequestPayload,
  ) {
    try {
      const request = await this.refundRequestService.processRefundRequest(
        admin,
        id,
        payload,
      );
      return DataResponse.ok(request.toResponse());
    } catch (error: any) {
      console.error("Error in approveRefundRequest controller:", error);
      throw error;
    }
  }

  @Put("admin/:id/reject")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Từ chối yêu cầu hoàn tiền (Admin)" })
  async rejectRefundRequest(
    @CurrentUser() admin: any,
    @Param("id") id: string,
    @Body() payload: ProcessRefundRequestPayload,
  ) {
    const request = await this.refundRequestService.rejectRefundRequest(
      admin,
      id,
      payload,
    );
    return DataResponse.ok(request.toResponse());
  }
}
