import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { QueueEventListener, QueueMessageService } from "src/kernel";
import { EVENT } from "src/kernel/constants";
import { SocketUserService } from "src/modules/websocket/services/socket-user.service";
import { logError } from "src/lib/utils";
import { CATEGORY_CHANNEL, CATEGORY_UPDATE_TOPIC } from "../constants";

@Injectable()
export class CategoryUpdateListener {
  constructor(
    private readonly queueEventService: QueueMessageService,
    @Inject(forwardRef(() => SocketUserService))
    private readonly socketUserService: SocketUserService,
  ) {
    this.queueEventService.subscribe(
      CATEGORY_CHANNEL,
      CATEGORY_UPDATE_TOPIC,
      this.handleCategoryUpdate.bind(this),
    );
  }

  public async handleCategoryUpdate({ data: event }: QueueEventListener) {
    const { eventName, data } = event;
    if (eventName !== EVENT.UPDATED) return;

    try {
      const category = data;
      if (!category || !category._id) return;

      await this.socketUserService.emitToAll("category:updated", {
        categoryId: category._id.toString(),
        category,
        message: "Danh mục đã được cập nhật",
      });
    } catch (e) {
      logError("handleCategoryUpdate", e);
    }
  }
}
