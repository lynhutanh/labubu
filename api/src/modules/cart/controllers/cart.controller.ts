import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "src/modules/auth/guards";
import { CurrentUser } from "src/modules/auth/decorators";
import { DataResponse } from "src/kernel";
import { CartService } from "../services";
import { CartDto } from "../dtos";
import {
  AddToCartPayload,
  UpdateCartItemPayload,
  RemoveFromCartPayload,
} from "../payloads";

@ApiTags("Cart")
@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get current user cart" })
  async getCart(@CurrentUser() user: any): Promise<DataResponse<CartDto>> {
    const cart = await this.cartService.getCart(user);
    return DataResponse.ok(cart);
  }

  @Post("items")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add item to cart" })
  async addToCart(
    @CurrentUser() user: any,
    @Body() payload: AddToCartPayload,
  ): Promise<DataResponse<CartDto>> {
    const cart = await this.cartService.addToCart(user, payload);
    return DataResponse.ok(cart);
  }

  @Put("items")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update cart item quantity" })
  async updateCartItem(
    @CurrentUser() user: any,
    @Body() payload: UpdateCartItemPayload,
  ): Promise<DataResponse<CartDto>> {
    const cart = await this.cartService.updateCartItem(user, payload);
    return DataResponse.ok(cart);
  }

  @Delete("items")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remove item from cart" })
  async removeFromCart(
    @CurrentUser() user: any,
    @Body() payload: RemoveFromCartPayload,
  ): Promise<DataResponse<CartDto>> {
    const cart = await this.cartService.removeFromCart(user, payload);
    return DataResponse.ok(cart);
  }

  @Delete()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Clear all items from cart" })
  async clearCart(@CurrentUser() user: any): Promise<DataResponse<CartDto>> {
    const cart = await this.cartService.clearCart(user);
    return DataResponse.ok(cart);
  }
}
