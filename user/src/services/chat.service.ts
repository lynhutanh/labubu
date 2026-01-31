import { APIRequest } from "./api-request";

export interface Message {
  _id: string;
  userId: string;
  adminId?: string;
  content: string;
  isFromAdmin: boolean;
  read: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export class ChatService extends APIRequest {
  public async getMessages(limit?: number, skip?: number): Promise<Message[]> {
    const params: any = {};
    if (limit) params.limit = limit;
    if (skip) params.skip = skip;
    const url = this.buildUrl("/chat/messages", params);
    const response = await this.get(url);
    return response.data?.data || response.data || [];
  }

  public async getUnreadCount(): Promise<number> {
    const response = await this.get("/chat/unread-count");
    return response.data?.data || response.data || 0;
  }

  public async markAsRead(): Promise<void> {
    await this.post("/chat/messages/read");
  }
}

export const chatService = new ChatService();
