import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard, RoleGuard } from "src/modules/auth/guards";
import { Role } from "src/modules/auth/decorators";
import { ROLE } from "src/modules/user/constants";
import { GhnService, GhnCreateOrderPayload } from "../services/ghn.service";
import { DataResponse } from "src/kernel";

@ApiTags("GHN")
@Controller("ghn")
export class GhnController {
  constructor(private readonly ghnService: GhnService) { }

  @Get("provinces")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lấy danh sách tỉnh/thành phố" })
  async getProvinces() {
    const data = await this.ghnService.getProvinces();
    return DataResponse.ok(data);
  }

  @Post("districts")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lấy danh sách quận/huyện" })
  async getDistricts(@Body("province_id") provinceId: number) {
    const data = await this.ghnService.getDistricts(provinceId);
    return DataResponse.ok(data);
  }

  @Get("wards")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
    const data = await this.ghnService.getOrderDetailByClientCode(
      clientOrderCode,
    );
    return DataResponse.ok(data);
  }
}
