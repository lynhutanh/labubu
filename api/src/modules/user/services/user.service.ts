import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { EntityNotFoundException, QueueMessageService } from "src/kernel";
import { EVENT, STATUS } from "src/kernel/constants";
import { toObjectId } from "src/kernel/helpers/string.helper";
import { UserDto } from "../dtos";
import { ROLE, USER_CHANNELS } from "../constants";
import {
  EmailHasBeenTakenException,
  UsernameExistedException,
} from "../exceptions";
import { UserModel } from "../models";
import { USER_MODEL_PROVIDER } from "../providers";

export interface IUserRegisterPayload {
  name?: string;
  email: string;
  username: string;
  password?: string;
  phone?: string;
  gender?: string;
  address?: string;
  role?: string;
}

export interface IUserUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: string;
  avatarPath?: string;
  avatarId?: string;
  dateOfBirth?: string;
}

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_MODEL_PROVIDER)
    private readonly userModel: Model<UserModel>,
    private readonly queueEventService: QueueMessageService,
  ) {}

  public async findById(id: string | ObjectId): Promise<UserDto> {
    const user = await this.userModel.findById(id).lean();
    return user ? new UserDto(user) : null;
  }

  public async findByEmail(email: string): Promise<UserDto> {
    const user = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .lean();
    return user ? new UserDto(user) : null;
  }

  public async findByUsername(username: string): Promise<UserDto> {
    const user = await this.userModel
      .findOne({ username: username.toLowerCase() })
      .lean();
    return user ? new UserDto(user) : null;
  }

  public async findByUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<UserDto> {
    const query = usernameOrEmail.includes("@")
      ? { email: usernameOrEmail.toLowerCase() }
      : { username: usernameOrEmail.toLowerCase() };
    const user = await this.userModel.findOne(query).lean();
    return user ? new UserDto(user) : null;
  }

  public async findByIds(ids: string[]): Promise<UserDto[]> {
    const users = await this.userModel
      .find({
        _id: { $in: ids.map((id) => toObjectId(id)) },
      })
      .lean();
    return users.map((user) => new UserDto(user));
  }

  public async findOneEvolution(
    query: Record<string, unknown> = {},
    projection: Record<string, unknown> = {},
  ): Promise<UserModel | null> {
    const user = await this.userModel.findOne(query, projection).lean();
    return (user as unknown as UserModel) || null;
  }

  public async register(payload: IUserRegisterPayload): Promise<UserDto> {
    if (!payload || !payload.email) throw new EntityNotFoundException();

    if (payload?.username) {
      const existUserByUsername = await this.userModel
        .findOne({ username: payload.username.trim().toLowerCase() })
        .lean();
      if (existUserByUsername) throw new UsernameExistedException();
    }

    const existUserByEmail = await this.userModel
      .findOne({ email: payload.email.toLowerCase() })
      .lean();
    if (existUserByEmail) throw new EmailHasBeenTakenException();

    const user = await this.userModel.create({
      username: payload.username,
      email: payload.email.toLowerCase(),
      name: payload.name || payload.username,
      gender: payload.gender,
      phone: payload.phone,
      address: payload.address,
      status: STATUS.ACTIVE,
      role: payload.role || ROLE.USER,
    });

    await this.queueEventService.publish(USER_CHANNELS.USER_REGISTERED, {
      eventName: EVENT.CREATED,
      data: user,
    });

    return new UserDto(user);
  }

  public async updateUser(
    user: UserDto,
    payload: IUserUpdatePayload,
  ): Promise<UserDto> {
    const userExists = await this.userModel.exists({ _id: user?._id });
    if (!userExists) throw new NotFoundException();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.email !== undefined) updateData.email = payload.email;
    if (payload.phone !== undefined) updateData.phone = payload.phone;
    if (payload.gender !== undefined) updateData.gender = payload.gender;
    if (payload.address !== undefined) updateData.address = payload.address;
    if (payload.avatarPath !== undefined)
      updateData.avatarPath = payload.avatarPath;
    if (payload.avatarId !== undefined) updateData.avatarId = payload.avatarId;
    if (payload.dateOfBirth !== undefined)
      updateData.dateOfBirth = payload.dateOfBirth;

    const updatedUser = await this.userModel.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true },
    );

    return updatedUser ? new UserDto(updatedUser) : null;
  }

  public async search(req: {
    q?: string;
    role?: string;
    status?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sort?: string;
  }): Promise<{ data: unknown[]; total: number }> {
    const query: any = {};

    if (req.q) {
      const regexp = new RegExp(
        req.q.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, ""),
        "i",
      );
      query.$or = [
        { name: { $regex: regexp.source, $options: "i" } },
        { username: { $regex: regexp.source, $options: "i" } },
        { email: { $regex: regexp.source, $options: "i" } },
      ];
    }

    if (req.role) query.role = req.role;
    if (req.status) query.status = req.status;

    const sortBy = req.sortBy || "updatedAt";
    const sortOrder = req.sort === "asc" ? 1 : -1;
    const limit = req.limit || 10;
    const offset = req.offset || 0;

    const [data, total] = await Promise.all([
      this.userModel
        .find(query)
        .lean()
        .sort({ [sortBy]: sortOrder })
        .limit(limit)
        .skip(offset),
      this.userModel.countDocuments(query),
    ]);

    const responseData = data.map((item) => {
      const userDto = new UserDto(item);
      return userDto.toResponse(false, true);
    });

    return { data: responseData, total };
  }

  public async delete(id: string): Promise<boolean> {
    const user = await this.userModel.findById(id);
    if (!user) throw new EntityNotFoundException();

    await this.userModel.findByIdAndUpdate(id, {
      $set: { status: STATUS.INACTIVE, updatedAt: new Date() },
    });

    return true;
  }

  public async adminCreate(payload: IUserRegisterPayload): Promise<UserDto> {
    if (!payload || !payload.email) throw new EntityNotFoundException();

    if (payload?.username) {
      const existUserByUsername = await this.userModel
        .findOne({ username: payload.username.trim().toLowerCase() })
        .lean();
      if (existUserByUsername) throw new UsernameExistedException();
    }

    const existUserByEmail = await this.userModel
      .findOne({ email: payload.email.toLowerCase() })
      .lean();
    if (existUserByEmail) throw new EmailHasBeenTakenException();

    const user = await this.userModel.create({
      username: payload.username,
      email: payload.email.toLowerCase(),
      name: payload.name || payload.username,
      gender: payload.gender,
      phone: payload.phone,
      address: payload.address,
      status: payload.status || STATUS.ACTIVE,
      role: payload.role || ROLE.USER,
    });

    await this.queueEventService.publish(USER_CHANNELS.USER_REGISTERED, {
      eventName: EVENT.CREATED,
      data: user,
    });

    return new UserDto(user);
  }

  public async adminUpdate(
    id: string,
    payload: IUserUpdatePayload & { role?: string; status?: string },
  ): Promise<UserDto> {
    const userExists = await this.userModel.findById(id);
    if (!userExists) throw new NotFoundException();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.email !== undefined) {
      // Check if email is already taken by another user
      const existUserByEmail = await this.userModel
        .findOne({
          email: payload.email.toLowerCase(),
          _id: { $ne: id },
        })
        .lean();
      if (existUserByEmail) throw new EmailHasBeenTakenException();
      updateData.email = payload.email.toLowerCase();
    }
    if (payload.phone !== undefined) updateData.phone = payload.phone;
    if (payload.gender !== undefined) updateData.gender = payload.gender;
    if (payload.address !== undefined) updateData.address = payload.address;
    if (payload.avatarPath !== undefined)
      updateData.avatarPath = payload.avatarPath;
    if (payload.avatarId !== undefined) updateData.avatarId = payload.avatarId;
    if (payload.dateOfBirth !== undefined)
      updateData.dateOfBirth = payload.dateOfBirth;
    if (payload.role !== undefined) updateData.role = payload.role;
    if (payload.status !== undefined) updateData.status = payload.status;

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    return updatedUser ? new UserDto(updatedUser) : null;
  }
}

