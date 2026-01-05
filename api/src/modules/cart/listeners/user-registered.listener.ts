import { Injectable, forwardRef, Inject } from "@nestjs/common";
import { QueueEventListener, QueueMessageService } from "src/kernel";
import { EVENT } from "src/kernel/constants";
import { USER_CHANNELS, USER_TOPICS } from "src/modules/user/constants";
import { logError } from "src/lib/utils";
import { CartService } from "../services";
import { CART_OWNER_TYPE } from "../constants";

@Injectable()
export class UserRegisteredListener {
  constructor(
    private readonly queueEventService: QueueMessageService,
    @Inject(forwardRef(() => CartService))
    private readonly cartService: CartService,
  ) {
    this.queueEventService.subscribe(
      USER_CHANNELS.USER_REGISTERED,
      USER_TOPICS.USER_REGISTERED,
      this.handleUserRegistered.bind(this),
    );
  }

  public async handleUserRegistered({ data: event }: QueueEventListener) {
    const { eventName, data } = event;
    if (eventName !== EVENT.CREATED) return;

    try {
      const user = data;
      if (!user || !user._id) return;

      await this.cartService.createCart(user._id, CART_OWNER_TYPE.USER);
    } catch (e) {
      logError("handleUserRegistered", e);
    }
  }
}
