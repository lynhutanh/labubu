import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { RoleGuard } from "src/modules/auth/guards";
import { Role } from "src/modules/auth/decorators";
import { ROLE } from "src/modules/user/constants";
import { GhnService, GhnCreateOrderPayload } from "../services/ghn.service";
import { DataResponse } from "src/kernel";
import { SettingService } from "src/modules/settings/services";
import { forwardRef, Inject } from "@nestjs/common";

@ApiTags("GHN")
@Controller("ghn")
export class GhnController {
  constructor(
    private readonly ghnService: GhnService,
    @Inject(forwardRef(() => SettingService))
    private readonly settingService: SettingService,
  ) { }

  @Get("provinces")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lấy danh sách tỉnh/thành phố" })
  async getProvinces() {
    try {
      const data = await this.ghnService.getProvinces();
      return DataResponse.ok(data);
    } catch (error: any) {
      console.error("GhnController getProvinces error:", {
        message: error?.message,
        statusCode: error?.statusCode,
        response: error?.response,
        stack: error?.stack,
      });
      throw error;
    }
  }

  @Post("districts")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lấy danh sách quận/huyện" })
  async getDistricts(@Body("province_id") provinceId: number) {
    const data = await this.ghnService.getDistricts(provinceId);
    return DataResponse.ok(data);
  }

  @Get("wards")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lấy danh sách phường/xã" })
  async getWards(@Query("district_id") districtId: number) {
    const data = await this.ghnService.getWards(Number(districtId));
    return DataResponse.ok(data);
  }

  @Post("create-order")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Tạo đơn GHN" })
  async createOrder(@Body() payload: GhnCreateOrderPayload) {
    const data = await this.ghnService.createOrder(payload);
    return DataResponse.ok(data);
  }

  @Post("print-token")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Gen token in bill" })
  async printToken(@Body("order_codes") orderCodes: string[]) {
    const data = await this.ghnService.genPrintToken(orderCodes);
    return DataResponse.ok(data);
  }

  @Get("print-url")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lấy URL in bill GHN" })
  async getPrintUrl(@Query("orderCode") orderCode: string) {
    const data = await this.ghnService.getPrintUrl(orderCode);
    return DataResponse.ok(data);
  }

  @Get("print-url-by-ghn-code")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lấy URL in bill GHN bằng GHN order code" })
  async getPrintUrlByGhnCode(@Query("ghnOrderCode") ghnOrderCode: string) {
    if (!ghnOrderCode) {
      throw new BadRequestException("ghnOrderCode là bắt buộc");
    }
    try {
      const tokenResponse = await this.ghnService.genPrintToken([ghnOrderCode]);
      const tokenData = tokenResponse?.data || tokenResponse;
      const token = tokenData?.token;

      if (!token) {
        throw new BadRequestException("Không thể tạo token để in bill từ GHN");
      }

      const baseUrl = await this.settingService.get("GHN_BASE_URL") || "https://dev-online-gateway.ghn.vn";
      const printUrl = `${baseUrl}/a5/public-api/print52x70?token=${token}`;

      return DataResponse.ok({ token, printUrl, ghnOrderCode });
    } catch (error: any) {
      throw new BadRequestException(
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tạo URL in bill từ GHN",
      );
    }
  }

  @Post("tracking/ghn-code")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Tra cứu đơn GHN theo mã GHN" })
  async detailByGhn(@Body("order_code") orderCode: string) {
    const data = await this.ghnService.getOrderDetailByGhnCode(orderCode);
    return DataResponse.ok(data);
  }

  @Post("tracking/client-code")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Tra cứu đơn GHN theo client_order_code" })
  async detailByClient(@Body("client_order_code") clientOrderCode: string) {
    const data =
      await this.ghnService.getOrderDetailByClientCode(clientOrderCode);
    return DataResponse.ok(data);
  }
}
