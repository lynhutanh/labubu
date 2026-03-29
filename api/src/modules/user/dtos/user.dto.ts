import { ObjectId } from "mongodb";
import { pick } from "lodash";

export class UserDto {
  _id: ObjectId;

  name: string;

  username: string;

  email: string;

  phone: string;

  role: string;

  avatarId: ObjectId;

  avatarPath: string;

  status: string;

  dateOfBirth: Date;

  gender: string;

  address: string;

  rank: string;

  totalSpent: number;

  receivedRewards: string[];

  petBalance: number;

  bonusPetPoints: number;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: any) {
    Object.assign(
      this,
      pick(data, [
        "_id",
        "name",
        "username",
        "email",
        "phone",
        "role",
        "avatarId",
        "avatarPath",
        "status",
        "dateOfBirth",
        "gender",
        "address",
        "rank",
        "totalSpent",
        "receivedRewards",
        "petBalance",
        "bonusPetPoints",
        "createdAt",
        "updatedAt",
      ]),
    );
  }

  toResponse(includePrivate = false, isAdmin = false) {
    const publicData = {
      _id: this._id,
      name: this.name,
      username: this.username,
      avatarPath: this.avatarPath,
      role: this.role,
    };

    if (!includePrivate && !isAdmin) {
      return publicData;
    }

    return {
      ...publicData,
      email: this.email,
      phone: this.phone,
      status: this.status,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      address: this.address,
      rank: this.rank,
      totalSpent: this.totalSpent,
      receivedRewards: this.receivedRewards,
      petBalance: this.petBalance,
      bonusPetPoints: this.bonusPetPoints,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
