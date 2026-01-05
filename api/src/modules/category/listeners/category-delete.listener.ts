import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { QueueEventListener, QueueMessageService } from "src/kernel";
import { EVENT } from "src/kernel/constants";
import { SocketUserService } from "src/modules/websocket/services/socket-user.service";
import { logError } from "src/lib/utils";
import { CATEGORY_CHANNEL, CATEGORY_DELETE_TOPIC } from "../constants";

@Injectable()
export class CategoryDeleteListener {
  constructor(
    private readonly queueEventService: QueueMessageService,
    @Inject(forwardRef(() => SocketUserService))
    private readonly socketUserService: SocketUserService,
  ) {
    this.queueEventService.subscribe(
      CATEGORY_CHANNEL,
      CATEGORY_DELETE_TOPIC,
      this.handleCategoryDelete.bind(this),
    );
  }

  public async handleCategoryDelete({ data: event }: QueueEventListener) {
    const { eventName, data } = event;
    if (eventName !== EVENT.DELETED) return;

    try {
      const category = data;
      if (!category || !category._id) return;

      await this.socketUserService.emitToAll("category:deleted", {
        categoryId: category._id.toString(),
        category,
        message: "Danh mục đã bị xóa",
      });
    } catch (e) {
      logError("handleCategoryDelete", e);
    }
  }
}
