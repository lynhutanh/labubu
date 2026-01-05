import { ObjectId } from "mongodb";
import { pick } from "lodash";

export class ForgotDto {
  _id: ObjectId;

  token: string;

  source: string;

  sourceId: ObjectId;

  authId: ObjectId;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<ForgotDto>) {
    Object.assign(
      this,
      pick(data, [
        "_id",
        "token",
        "source",
        "sourceId",
        "authId",
        "createdAt",
        "updatedAt",
      ]),
    );
  }

  static fromModel(model: any): ForgotDto | null {
    if (!model) return null;
    return new ForgotDto(model);
  }
}
