import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { BrandService } from "../services";
import { BrandDto } from "../dtos";
import { BrandSearchPayload } from "../payloads";

@ApiTags("Brands")
@Controller("brands")
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all brands" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(
    @Query() query: BrandSearchPayload,
  ): Promise<DataResponse<BrandDto[]>> {
    const brands = await this.brandService.findAll(query);
    return DataResponse.ok(brands);
  }

  @Get("public")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get public brands" })
  async getPublicBrands(): Promise<DataResponse<BrandDto[]>> {
    const brands = await this.brandService.getPublicBrands();
    return DataResponse.ok(brands);
  }

  @Get("list")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all brands for user (no filter)" })
  async getAllBrandsForUser(): Promise<DataResponse<BrandDto[]>> {
    const brands = await this.brandService.getAllBrandsForUser();
    return DataResponse.ok(brands);
  }

  @Get("slug/:slug")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get brand by slug" })
  async findBySlug(
    @Param("slug") slug: string,
  ): Promise<DataResponse<BrandDto | null>> {
    const brand = await this.brandService.findBySlug(slug);
    if (!brand) {
      return DataResponse.ok(null);
    }
    return DataResponse.ok(brand);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get brand by ID" })
  async findById(
    @Param("id") id: string,
  ): Promise<DataResponse<BrandDto | null>> {
    const brand = await this.brandService.findById(id);
    if (!brand) {
      return DataResponse.ok(null);
    }
    return DataResponse.ok(brand);
  }
}
