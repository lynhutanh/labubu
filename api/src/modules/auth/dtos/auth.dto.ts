import { ObjectId } from "mongodb";
import { pick } from "lodash";

export class AuthCreateDto {
  source: string;

  sourceId: ObjectId;

  type: string;

  key: string;

  value: string;

  constructor(data?: Partial<AuthCreateDto>) {
    Object.assign(
      this,
      pick(data, ["source", "sourceId", "type", "key", "value"]),
    );
  }
}

export class AuthDto {
  _id: ObjectId;

  source: string;

  sourceId: ObjectId;

  type: string;

  key: string;

  value: string;

  salt: string;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<AuthDto>) {
    Object.assign(
      this,
      pick(data, [
        "_id",
        "source",
        "sourceId",
        "type",
        "key",
        "value",
        "salt",
        "createdAt",
        "updatedAt",
      ]),
    );
  }

  static fromModel(model: any): AuthDto | null {
    if (!model) return null;
    return new AuthDto(model);
  }
}
