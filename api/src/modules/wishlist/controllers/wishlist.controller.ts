import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "src/modules/auth/guards";
import { CurrentUser } from "src/modules/auth/decorators";
import { DataResponse } from "src/kernel";
import { WishlistService } from "../services";
import { WishlistDto } from "../dtos";
import { AddToWishlistPayload, RemoveFromWishlistPayload } from "../payloads";

@ApiTags("Wishlist")
@Controller("wishlist")
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get current user wishlist" })
  async getWishlist(
    @CurrentUser() user: any,
  ): Promise<DataResponse<WishlistDto>> {
    const wishlist = await this.wishlistService.getWishlist(user);
    return DataResponse.ok(wishlist);
  }

  @Post("items")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add item to wishlist" })
  async addToWishlist(
    @CurrentUser() user: any,
    @Body() payload: AddToWishlistPayload,
  ): Promise<DataResponse<WishlistDto>> {
    const wishlist = await this.wishlistService.addToWishlist(user, payload);
    return DataResponse.ok(wishlist);
  }

  @Delete("items")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remove item from wishlist" })
  async removeFromWishlist(
    @CurrentUser() user: any,
    @Body() payload: RemoveFromWishlistPayload,
  ): Promise<DataResponse<WishlistDto>> {
    const wishlist = await this.wishlistService.removeFromWishlist(
      user,
      payload,
    );
    return DataResponse.ok(wishlist);
  }

  @Delete()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Clear all items from wishlist" })
  async clearWishlist(
    @CurrentUser() user: any,
  ): Promise<DataResponse<WishlistDto>> {
    const wishlist = await this.wishlistService.clearWishlist(user);
    return DataResponse.ok(wishlist);
  }

  @Get("check")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Check if product is in wishlist" })
  async checkProduct(
    @CurrentUser() user: any,
    @Query("productId") productId: string,
  ): Promise<DataResponse<{ isInWishlist: boolean }>> {
    const isInWishlist = await this.wishlistService.isInWishlist(
      user,
      productId,
    );
    return DataResponse.ok({ isInWishlist });
  }
}
