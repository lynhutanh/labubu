import { MessageModel } from "../models/message.model";

export class MessageDto {
  _id: string;

  userId: string;

  adminId?: string;

  content: string;

  isFromAdmin: boolean;

  read: boolean;

  metadata?: any;

  createdAt: Date;

  updatedAt: Date;

  constructor(data: Partial<MessageModel>) {
    this._id = data._id?.toString();
    this.userId = data.userId?.toString();
    this.adminId = data.adminId?.toString();
    this.content = data.content;
    this.isFromAdmin = data.isFromAdmin || false;
    this.read = data.read || false;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toResponse(includePrivate = false) {
    const data: any = {
      _id: this._id,
      userId: this.userId,
      content: this.content,
      isFromAdmin: this.isFromAdmin,
      read: this.read,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    if (this.adminId) {
      data.adminId = this.adminId;
    }

    if (this.metadata) {
      data.metadata = this.metadata;
    }

    return data;
  }
}
