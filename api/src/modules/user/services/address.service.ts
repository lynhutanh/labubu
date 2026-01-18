import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { ADDRESS_MODEL_PROVIDER } from "../providers/address.provider";
import { AddressModel } from "../models/address.model";
import { AddressDto } from "../dtos/address.dto";
import {
  CreateAddressPayload,
  UpdateAddressPayload,
} from "../payloads";

@Injectable()
export class AddressService {
  constructor(
    @Inject(ADDRESS_MODEL_PROVIDER)
    private readonly addressModel: Model<AddressModel>,
  ) {}

  async createAddress(
    user: any,
    payload: CreateAddressPayload,
  ): Promise<AddressDto> {
    const userId = new ObjectId(user._id);

    if (payload.isDefault) {
      await this.addressModel.updateMany(
        { userId },
        { $set: { isDefault: false } },
      );
    }

    const address = await this.addressModel.create({
      userId,
      fullName: payload.fullName,
      phone: payload.phone,
      address: payload.address,
      ward: payload.ward || "",
      wardCode: payload.wardCode || "",
      district: payload.district || "",
      districtId: payload.districtId || null,
      city: payload.city,
      provinceId: payload.provinceId || null,
      isDefault: payload.isDefault || false,
      note: payload.note || "",
    });

    return new AddressDto(address);
  }

  async getAddresses(user: any): Promise<AddressDto[]> {
    const userId = new ObjectId(user._id);
    const addresses = await this.addressModel
      .find({ userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return addresses.map((addr) => new AddressDto(addr));
  }

  async getAddressById(user: any, addressId: string): Promise<AddressDto> {
    const userId = new ObjectId(user._id);
    const address = await this.addressModel
      .findOne({ _id: new ObjectId(addressId), userId })
      .lean();

    if (!address) {
      throw new NotFoundException("Địa chỉ không tồn tại");
    }

    return new AddressDto(address);
  }

  async updateAddress(
    user: any,
    addressId: string,
    payload: UpdateAddressPayload,
  ): Promise<AddressDto> {
    const userId = new ObjectId(user._id);
    const address = await this.addressModel.findOne({
      _id: new ObjectId(addressId),
      userId,
    });

    if (!address) {
      throw new NotFoundException("Địa chỉ không tồn tại");
    }

    if (payload.isDefault === true) {
      await this.addressModel.updateMany(
        { userId, _id: { $ne: new ObjectId(addressId) } },
        { $set: { isDefault: false } },
      );
    }

    const updateData: any = { updatedAt: new Date() };
    if (payload.fullName !== undefined) updateData.fullName = payload.fullName;
    if (payload.phone !== undefined) updateData.phone = payload.phone;
    if (payload.address !== undefined) updateData.address = payload.address;
    if (payload.ward !== undefined) updateData.ward = payload.ward;
    if (payload.wardCode !== undefined) updateData.wardCode = payload.wardCode;
    if (payload.district !== undefined) updateData.district = payload.district;
    if (payload.districtId !== undefined)
      updateData.districtId = payload.districtId;
    if (payload.city !== undefined) updateData.city = payload.city;
    if (payload.provinceId !== undefined)
      updateData.provinceId = payload.provinceId;
    if (payload.isDefault !== undefined)
      updateData.isDefault = payload.isDefault;
    if (payload.note !== undefined) updateData.note = payload.note;

    const updatedAddress = await this.addressModel.findByIdAndUpdate(
      addressId,
      { $set: updateData },
      { new: true },
    );

    return new AddressDto(updatedAddress);
  }

  async deleteAddress(user: any, addressId: string): Promise<void> {
    const userId = new ObjectId(user._id);
    const address = await this.addressModel.findOne({
      _id: new ObjectId(addressId),
      userId,
    });

    if (!address) {
      throw new NotFoundException("Địa chỉ không tồn tại");
    }

    await this.addressModel.findByIdAndDelete(addressId);
  }

  async setDefaultAddress(user: any, addressId: string): Promise<AddressDto> {
    const userId = new ObjectId(user._id);
    const address = await this.addressModel.findOne({
      _id: new ObjectId(addressId),
      userId,
    });

    if (!address) {
      throw new NotFoundException("Địa chỉ không tồn tại");
    }

    await this.addressModel.updateMany(
      { userId },
      { $set: { isDefault: false } },
    );

    const updatedAddress = await this.addressModel.findByIdAndUpdate(
      addressId,
      { $set: { isDefault: true } },
      { new: true },
    );

    return new AddressDto(updatedAddress);
  }
}
