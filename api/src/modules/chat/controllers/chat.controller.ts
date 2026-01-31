import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Param,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { CurrentUser } from "src/modules/auth/decorators";
import { AuthGuard, RoleGuard } from "src/modules/auth/guards";
import { UserDto } from "src/modules/user/dtos";
import { MessageService, ICreateMessagePayload } from "../services/message.service";
import { MessageDto } from "../dtos/message.dto";

@ApiTags("Chat")
@Controller("chat")
export class ChatController {
  constructor(private readonly messageService: MessageService) {}

  @Get("messages")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get messages for current user" })
  async getMessages(
    @CurrentUser() user: UserDto,
    @Query("limit") limit?: string,
    @Query("skip") skip?: string,
  ): Promise<DataResponse<MessageDto[]>> {
    const messages = await this.messageService.findByUserId(
      user._id.toString(),
      limit ? parseInt(limit, 10) : 50,
      skip ? parseInt(skip, 10) : 0,
    );
    return DataResponse.ok(messages.reverse());
  }

  @Get("messages/:userId")
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get messages for specific user (Admin only)" })
  async getMessagesByUserId(
    @Param("userId") userId: string,
    @Query("limit") limit?: string,
    @Query("skip") skip?: string,
  ): Promise<DataResponse<MessageDto[]>> {
    const messages = await this.messageService.findByUserId(
      userId,
      limit ? parseInt(limit, 10) : 50,
      skip ? parseInt(skip, 10) : 0,
    );
    return DataResponse.ok(messages.reverse());
  }

  @Get("users")
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get list of users with messages (Admin only)" })
  async getUsersWithMessages(): Promise<DataResponse<any[]>> {
    const users = await this.messageService.findUsersWithMessages();
    return DataResponse.ok(users);
  }

  @Post("messages/:userId/read")
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark messages as read (Admin only)" })
  async markAsRead(@Param("userId") userId: string): Promise<DataResponse<any>> {
    await this.messageService.markAsRead(userId);
    return DataResponse.ok({ success: true });
  }

  @Post("messages/read")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark messages as read for current user" })
  async markAsReadForUser(
    @CurrentUser() user: UserDto,
  ): Promise<DataResponse<any>> {
    await this.messageService.markAsReadForUser(user._id.toString());
    return DataResponse.ok({ success: true });
  }

  @Get("unread-count")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get unread message count" })
  async getUnreadCount(
    @CurrentUser() user: UserDto,
  ): Promise<DataResponse<number>> {
    const count = await this.messageService.getUnreadCount(user._id.toString());
    return DataResponse.ok(count);
  }

  @Get("admin/unread-count")
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get total unread message count for admin" })
  async getTotalUnreadCountForAdmin(): Promise<DataResponse<number>> {
    const count = await this.messageService.getTotalUnreadCountForAdmin();
    return DataResponse.ok(count);
  }
}
