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
import { CategoryService } from "../services";
import { CategoryDto } from "../dtos";
import { CategorySearchPayload } from "../payloads";

@ApiTags("Categories")
@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all categories" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(
    @Query() query: CategorySearchPayload,
  ): Promise<DataResponse<CategoryDto[]>> {
    const categories = await this.categoryService.findAll(query);
    return DataResponse.ok(categories);
  }

  @Get("public")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get public categories" })
  async getPublicCategories(): Promise<DataResponse<CategoryDto[]>> {
    const categories = await this.categoryService.getPublicCategories();
    return DataResponse.ok(categories);
  }

  @Get("featured")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get featured categories" })
  async getFeaturedCategories(): Promise<DataResponse<CategoryDto[]>> {
    const categories = await this.categoryService.getPublicCategories();
    return DataResponse.ok(categories);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get category by ID" })
  async findById(
    @Param("id") id: string,
  ): Promise<DataResponse<CategoryDto | null>> {
    const category = await this.categoryService.findById(id);
    if (!category) {
      return DataResponse.ok(null);
    }
    return DataResponse.ok(category);
  }

  @Get("slug/:slug")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get category by slug" })
  async findBySlug(
    @Param("slug") slug: string,
  ): Promise<DataResponse<CategoryDto | null>> {
    const category = await this.categoryService.findBySlug(slug);
    if (!category) {
      return DataResponse.ok(null);
    }
    return DataResponse.ok(category);
  }
}
