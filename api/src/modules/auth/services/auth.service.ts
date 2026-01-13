import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { FilterQuery, Model } from "mongoose";
import { ObjectId } from "mongodb";
import * as moment from "moment";
import { UserService } from "src/modules/user/services";
import { randomString } from "src/kernel/helpers/string.helper";
import { AuthCreateDto, AuthDto } from "../dtos";
import {
  AUTH_MODEL_PROVIDER,
  AUTH_SESSION_MODEL_PROVIDER,
  FORGOT_MODEL_PROVIDER,
  VERIFICATION_MODEL_PROVIDER,
} from "../providers";
import {
  AuthModel,
  AuthSessionModel,
  ForgotModel,
  VerificationModel,
} from "../models";
import { generateSalt, encryptPassword, verifyPassword } from "../helpers";

export interface IUserInfo {
  _id: ObjectId;
  username: string;
  email: string;
  role: string;
  status: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_MODEL_PROVIDER)
    private readonly AuthModel: Model<AuthModel>,
    @Inject(AUTH_SESSION_MODEL_PROVIDER)
    private readonly AuthSessionModel: Model<AuthSessionModel>,
    @Inject(FORGOT_MODEL_PROVIDER)
    private readonly ForgotModel: Model<ForgotModel>,
    @Inject(VERIFICATION_MODEL_PROVIDER)
    private readonly VerificationModel: Model<VerificationModel>,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  public async createAuthPassword(data: AuthCreateDto): Promise<AuthDto> {
    const salt = generateSalt();
    const newVal = data.value && encryptPassword(data.value, salt);

    let auth = await this.AuthModel.findOne({
      type: data.type || "password",
      source: data.source,
      sourceId: data.sourceId,
    });
    if (!auth) {
      auth = new this.AuthModel({
        type: data.type || "password",
        source: data.source,
        sourceId: data.sourceId,
      });
    }
    auth.salt = salt;
    auth.value = newVal;
    auth.key = data.key;

    await auth.save();
    return AuthDto.fromModel(auth);
  }

  public async findBySource(
    options: FilterQuery<AuthModel>,
  ): Promise<AuthDto | null> {
    const item = await this.AuthModel.findOne(options);
    return AuthDto.fromModel(item);
  }

  public async createOrUpdateAuth(data: {
    source: string;
    sourceId: string | ObjectId;
    type: string;
    key: string;
    value?: string;
  }): Promise<AuthDto> {
    const query = {
      source: data.source,
      sourceId: data.sourceId,
      type: data.type,
    };

    let auth = await this.AuthModel.findOne(query);
    if (!auth) {
      auth = new this.AuthModel(query);
    }

    auth.key = data.key;
    auth.value = data.value;

    await auth.save();
    return AuthDto.fromModel(auth);
  }

  public verifyPassword(pw: string, auth: AuthDto): boolean {
    if (!pw || !auth || !auth.salt || !auth.value) {
      return false;
    }
    return verifyPassword(pw, auth.salt, auth.value);
  }

  public async getSourceFromAuthSession(auth: {
    source: string;
    sourceId: ObjectId;
  }): Promise<IUserInfo | null> {
    if (auth.source === "user") {
      return (await this.userService.findById(
        auth.sourceId.toString(),
      )) as unknown as IUserInfo | null;
    }

    return null;
  }

  public async updateAuthSession(
    source: string,
    sourceId: string | ObjectId,
    expiresInSeconds = 60 * 60 * 24,
  ): Promise<string> {
    const session = await this.AuthSessionModel.findOne({
      sourceId,
    });
    const expiryAt = moment().add(expiresInSeconds, "seconds").toDate();
    if (session) {
      await this.AuthSessionModel.updateOne(
        { _id: session._id },
        { $set: { expiryAt } },
      );
      return session.token;
    }

    const token = randomString(15);
    await this.AuthSessionModel.create({
      source,
      sourceId,
      token,
      expiryAt,
      createdAt: new Date(),
    });

    return token;
  }

  public async verifySession(token: string): Promise<AuthSessionModel | false> {
    const session = await this.AuthSessionModel.findOne({ token }).lean();
    if (!session || moment().isAfter(new Date(session.expiryAt))) {
      return false;
    }
    return session as unknown as AuthSessionModel;
  }

  public async getSourceFromSession(token: string): Promise<IUserInfo | null> {
    try {
      const session = await this.verifySession(token);
      if (!session) {
        return null;
      }

      return await this.getSourceFromAuthSession({
        source: session.source,
        sourceId: session.sourceId,
      });
    } catch {
      return null;
    }
  }

  public async create(data: AuthCreateDto): Promise<AuthDto> {
    return this.createAuthPassword(data);
  }

  public async deleteManySession(query: any): Promise<boolean> {
    const result = await this.AuthSessionModel.deleteMany(query);
    return result.deletedCount > 0;
  }

  public generateJWT(): string {
    return "session_token_placeholder";
  }

  public async createForgot(
    source: string,
    sourceId: ObjectId,
    authId: ObjectId,
  ): Promise<string> {
    const token = randomString(20);
    await this.ForgotModel.create({
      token,
      source,
      sourceId,
      authId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return token;
  }

  public async findByForgotToken(token: string): Promise<ForgotModel | null> {
    const forgot = await this.ForgotModel.findOne({ token }).lean();
    if (!forgot) return null;

    // Check if token is expired (1 hour)
    const createdAt = new Date(forgot.createdAt);
    const now = new Date();
    const diffInHours =
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (diffInHours > 1) {
      // Token expired, delete it
      await this.ForgotModel.deleteOne({ _id: forgot._id });
      return null;
    }

    return forgot as unknown as ForgotModel;
  }

  public async deleteForgot(token: string): Promise<boolean> {
    const result = await this.ForgotModel.deleteOne({ token });
    return result.deletedCount > 0;
  }
}
