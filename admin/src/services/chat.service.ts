import { APIRequest } from './api-request';

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

export interface UserWithMessages {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  lastMessage: string;
  unreadCount: number;
}

export class ChatService extends APIRequest {
  public async getUsersWithMessages(): Promise<UserWithMessages[]> {
    const response = await this.get('/chat/users');
    return response.data?.data || response.data || [];
  }

  public async getMessagesByUserId(
    userId: string,
    limit?: number,
    skip?: number
  ): Promise<Message[]> {
    const params: any = {};
    if (limit) params.limit = limit;
    if (skip) params.skip = skip;
    const url = this.buildUrl(`/chat/messages/${userId}`, params);
    const response = await this.get(url);
    return response.data?.data || response.data || [];
  }

  public async markAsRead(userId: string): Promise<void> {
    await this.post(`/chat/messages/${userId}/read`);
  }

  public async getTotalUnreadCount(): Promise<number> {
    const response = await this.get('/chat/admin/unread-count');
    return response.data?.data || response.data || 0;
  }
}

export const chatService = new ChatService();
