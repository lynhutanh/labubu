import { Injectable, Inject } from "@nestjs/common";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { MessageModel } from "../models/message.model";
import { MessageDto } from "../dtos/message.dto";
import { MESSAGE_MODEL_PROVIDER } from "../providers/message.provider";

export interface ICreateMessagePayload {
  userId: string;
  adminId?: string;
  content: string;
  isFromAdmin: boolean;
  metadata?: any;
}

@Injectable()
export class MessageService {
  constructor(
    @Inject(MESSAGE_MODEL_PROVIDER)
    private readonly messageModel: Model<MessageModel>,
  ) {}

  async create(payload: ICreateMessagePayload): Promise<MessageDto> {
    const message = await this.messageModel.create({
      userId: new ObjectId(payload.userId),
      adminId: payload.adminId ? new ObjectId(payload.adminId) : null,
      content: payload.content,
      isFromAdmin: payload.isFromAdmin,
      read: false,
      metadata: payload.metadata || null,
    });

    return new MessageDto(message.toObject());
  }

  async findByUserId(
    userId: string,
    limit = 50,
    skip = 0,
  ): Promise<MessageDto[]> {
    const messages = await this.messageModel
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return messages.map((msg) => new MessageDto(msg));
  }

  async findUsersWithMessages(adminId?: string): Promise<any[]> {
    const pipeline: any[] = [
      {
        $group: {
          _id: "$userId",
          lastMessage: { $max: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$isFromAdmin", false] }, { $eq: ["$read", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          userId: "$_id",
          userName: "$user.name",
          userEmail: "$user.email",
          userAvatar: "$user.avatarPath",
          lastMessage: 1,
          unreadCount: 1,
        },
      },
      {
        $sort: { lastMessage: -1 },
      },
    ];

    const results = await this.messageModel.aggregate(pipeline);
    return results;
  }

  async markAsRead(userId: string, adminId?: string): Promise<void> {
    const query: any = {
      userId: new ObjectId(userId),
      isFromAdmin: false,
      read: false,
    };

    if (adminId) {
      query.adminId = new ObjectId(adminId);
    }

    await this.messageModel.updateMany(query, { read: true });
  }

  async markAsReadForUser(userId: string): Promise<void> {
    await this.messageModel.updateMany(
      {
        userId: new ObjectId(userId),
        isFromAdmin: true,
        read: false,
      },
      { read: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      userId: new ObjectId(userId),
      isFromAdmin: true,
      read: false,
    });
  }

  async getTotalUnreadCountForAdmin(): Promise<number> {
    return this.messageModel.countDocuments({
      isFromAdmin: false,
      read: false,
    });
  }
}
