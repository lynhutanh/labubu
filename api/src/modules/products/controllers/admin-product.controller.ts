import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { RoleGuard } from "src/modules/auth/guards";
import { Role } from "src/modules/auth/decorators";
import { ROLE } from "src/modules/user/constants";
import { AdminProductService } from "../services";
import { ProductDto, ProductSearchResponseDto, ProductStatsDto } from "../dtos";
import {
  CreateProductPayload,
  UpdateProductPayload,
  ProductSearchPayload,
  ProductBulkOperationPayload,
} from "../payloads";

@ApiTags("Admin Products")
@Controller("admin/products")
export class AdminProductController {
  constructor(private readonly adminProductService: AdminProductService) {}
  @Get()
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all products (alias search)" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getAll(
    @Query() query: ProductSearchPayload,
  ): Promise<DataResponse<ProductSearchResponseDto>> {
    const result = await this.adminProductService.search(query);
    return DataResponse.ok(result);
  }

  @Get("search")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Search products" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async search(
    @Query() query: ProductSearchPayload,
  ): Promise<DataResponse<ProductSearchResponseDto>> {
    const result = await this.adminProductService.search(query);
    return DataResponse.ok(result);
  }

  @Get("stats")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get product statistics" })
  async getStats(): Promise<DataResponse<ProductStatsDto>> {
    const stats = await this.adminProductService.getStats();
    return DataResponse.ok(stats);
  }

  @Get(":id")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get product by ID" })
  async findById(
    @Param("id") id: string,
  ): Promise<DataResponse<ProductDto | null>> {
    const product = await this.adminProductService.findById(id);
    return DataResponse.ok(product);
  }

  @Post()
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create new product" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() payload: CreateProductPayload,
  ): Promise<DataResponse<ProductDto>> {
    try {
      const product = await this.adminProductService.create(payload);
      return DataResponse.ok(product);
    } catch (error) {
      throw error;
    }
  }

  @Put(":id")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update product" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param("id") id: string,
    @Body() payload: UpdateProductPayload,
  ): Promise<DataResponse<ProductDto>> {
    const product = await this.adminProductService.update(id, payload);
    return DataResponse.ok(product);
  }

  @Delete(":id")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete product" })
  async delete(
    @Param("id") id: string,
  ): Promise<DataResponse<{ success: boolean }>> {
    const success = await this.adminProductService.delete(id);
    return DataResponse.ok({ success });
  }

  @Post("bulk")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Bulk operation on products" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async bulkOperation(
    @Body() payload: ProductBulkOperationPayload,
  ): Promise<DataResponse<{ success: number; failed: number }>> {
    const result = await this.adminProductService.bulkOperation(payload);
    return DataResponse.ok(result);
  }

  @Put(":id/approve")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Approve product" })
  async approveProduct(
    @Param("id") id: string,
  ): Promise<DataResponse<ProductDto>> {
    const product = await this.adminProductService.approveProduct(id);
    return DataResponse.ok(product);
  }

  @Put(":id/reject")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reject product" })
  async rejectProduct(
    @Param("id") id: string,
  ): Promise<DataResponse<ProductDto>> {
    const product = await this.adminProductService.rejectProduct(id);
    return DataResponse.ok(product);
  }
}
