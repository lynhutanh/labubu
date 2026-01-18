import { ObjectId } from "mongodb";
import { pick } from "lodash";

export class AddressDto {
  _id: ObjectId;

  userId: ObjectId;

  fullName: string;

  phone: string;

  address: string;

  ward?: string;

  wardCode?: string;

  district?: string;

  districtId?: number;

  city: string;

  provinceId?: number;

  isDefault: boolean;

  note?: string;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: any) {
    Object.assign(
      this,
      pick(data, [
        "_id",
        "userId",
        "fullName",
        "phone",
        "address",
        "ward",
        "wardCode",
        "district",
        "districtId",
        "city",
        "provinceId",
        "isDefault",
        "note",
        "createdAt",
        "updatedAt",
      ]),
    );
  }

  toResponse() {
    return {
      _id: this._id,
      userId: this.userId,
      fullName: this.fullName,
      phone: this.phone,
      address: this.address,
      ward: this.ward,
      wardCode: this.wardCode,
      district: this.district,
      districtId: this.districtId,
      city: this.city,
      provinceId: this.provinceId,
      isDefault: this.isDefault,
      note: this.note,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
