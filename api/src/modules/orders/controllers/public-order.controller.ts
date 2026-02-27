import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { BuyerOrderService } from "../services";

@ApiTags("Public Orders")
@Controller("orders/public")
export class PublicOrderController {
    constructor(
        private readonly buyerOrderService: BuyerOrderService,
    ) { }

    @Get("recent")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get recent successful orders for ticker" })
    async getRecentOrders() {
        const data = await this.buyerOrderService.getRecentPublicOrders();
        return DataResponse.ok(data);
    }
}
