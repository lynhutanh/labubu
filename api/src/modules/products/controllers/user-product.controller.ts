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
import { UserProductService } from "../services";
import { ProductDto, ProductListDto, ProductSearchResponseDto } from "../dtos";
import { ProductSearchPayload } from "../payloads";

@ApiTags("Products")
@Controller("products")
export class UserProductController {
  constructor(private readonly userProductService: UserProductService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Search products" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async search(
    @Query() query: ProductSearchPayload,
  ): Promise<DataResponse<ProductSearchResponseDto>> {
    const result = await this.userProductService.search(query);
    return DataResponse.ok(result);
  }

  @Get("featured")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get featured products" })
  async getFeaturedProducts(
    @Query("limit") limit?: number,
  ): Promise<DataResponse<ProductListDto[]>> {
    const products = await this.userProductService.getFeaturedProducts(
      limit || 10,
    );
    return DataResponse.ok(products);
  }

  @Get("new")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get new products" })
  async getNewProducts(
    @Query("limit") limit?: number,
  ): Promise<DataResponse<ProductListDto[]>> {
    const products = await this.userProductService.getNewProducts(limit || 10);
    return DataResponse.ok(products);
  }

  @Get("best-sellers")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get best seller products" })
  async getBestSellerProducts(
    @Query("limit") limit?: number,
  ): Promise<DataResponse<ProductListDto[]>> {
    const products = await this.userProductService.getBestSellerProducts(
      limit || 10,
    );
    return DataResponse.ok(products);
  }

  @Get("sale")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get sale products" })
  async getSaleProducts(
    @Query("limit") limit?: number,
  ): Promise<DataResponse<ProductListDto[]>> {
    const products = await this.userProductService.getSaleProducts(limit || 20);
    return DataResponse.ok(products);
  }

  @Get("category/:categoryId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get products by category" })
  async getProductsByCategory(
    @Param("categoryId") categoryId: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number,
  ): Promise<DataResponse<ProductSearchResponseDto>> {
    const result = await this.userProductService.getProductsByCategory(
      categoryId,
      limit || 20,
      page || 1,
    );
    return DataResponse.ok(result);
  }

  @Get("brand/:brandId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get products by brand" })
  async getProductsByBrand(
    @Param("brandId") brandId: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number,
  ): Promise<DataResponse<ProductSearchResponseDto>> {
    const result = await this.userProductService.getProductsByBrand(
      brandId,
      limit || 20,
      page || 1,
    );
    return DataResponse.ok(result);
  }

  @Get(":id/related")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get related products" })
  async getRelatedProducts(
    @Param("id") id: string,
    @Query("limit") limit?: number,
  ): Promise<DataResponse<ProductListDto[]>> {
    const products = await this.userProductService.getRelatedProducts(
      id,
      limit || 8,
    );
    return DataResponse.ok(products);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get product by ID" })
  async findById(
    @Param("id") id: string,
  ): Promise<DataResponse<ProductDto | null>> {
    const product = await this.userProductService.findById(id);
    return DataResponse.ok(product);
  }

  @Get("slug/:slug")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get product by slug" })
  async findBySlug(
    @Param("slug") slug: string,
  ): Promise<DataResponse<ProductDto | null>> {
    const product = await this.userProductService.findBySlug(slug);
    return DataResponse.ok(product);
  }
}
