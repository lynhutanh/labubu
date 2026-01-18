import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { CurrentUser } from "src/modules/auth/decorators";
import { AuthGuard } from "src/modules/auth/guards";
import { UserDto } from "../dtos";
import { AddressService } from "../services/address.service";
import {
  CreateAddressPayload,
  UpdateAddressPayload,
} from "../payloads";

@ApiTags("Addresses")
@Controller("addresses")
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new address" })
  async createAddress(
    @CurrentUser() user: UserDto,
    @Body() payload: CreateAddressPayload,
  ): Promise<DataResponse<any>> {
    const address = await this.addressService.createAddress(user, payload);
    return DataResponse.ok(address.toResponse());
  }

  @Get()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all addresses of current user" })
  async getAddresses(@CurrentUser() user: UserDto): Promise<DataResponse<any>> {
    const addresses = await this.addressService.getAddresses(user);
    return DataResponse.ok(addresses.map((addr) => addr.toResponse()));
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get address by ID" })
  async getAddressById(
    @CurrentUser() user: UserDto,
    @Param("id") id: string,
  ): Promise<DataResponse<any>> {
    const address = await this.addressService.getAddressById(user, id);
    return DataResponse.ok(address.toResponse());
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update address" })
  async updateAddress(
    @CurrentUser() user: UserDto,
    @Param("id") id: string,
    @Body() payload: UpdateAddressPayload,
  ): Promise<DataResponse<any>> {
    const address = await this.addressService.updateAddress(user, id, payload);
    return DataResponse.ok(address.toResponse());
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete address" })
  async deleteAddress(
    @CurrentUser() user: UserDto,
    @Param("id") id: string,
  ): Promise<DataResponse<any>> {
    await this.addressService.deleteAddress(user, id);
    return DataResponse.ok({ success: true });
  }

  @Put(":id/default")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Set address as default" })
  async setDefaultAddress(
    @CurrentUser() user: UserDto,
    @Param("id") id: string,
  ): Promise<DataResponse<any>> {
    const address = await this.addressService.setDefaultAddress(user, id);
    return DataResponse.ok(address.toResponse());
  }
}
