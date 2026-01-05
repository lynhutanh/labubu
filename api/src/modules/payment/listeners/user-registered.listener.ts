import { Injectable, forwardRef, Inject } from "@nestjs/common";
import { QueueEventListener, QueueMessageService } from "src/kernel";
import { EVENT } from "src/kernel/constants";
import { USER_CHANNELS, USER_TOPICS } from "src/modules/user/constants";
import { logError } from "src/lib/utils";
import { WalletService } from "../services";
import { WALLET_OWNER_TYPE } from "../constants";

@Injectable()
export class UserRegisteredWalletListener {
  constructor(
    private readonly queueEventService: QueueMessageService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
  ) {
    this.queueEventService.subscribe(
      USER_CHANNELS.USER_REGISTERED,
      USER_TOPICS.USER_REGISTERED + "_WALLET",
      this.handleUserRegistered.bind(this),
    );
  }

  public async handleUserRegistered({ data: event }: QueueEventListener) {
    const { eventName, data } = event;
    if (eventName !== EVENT.CREATED) return;

    try {
      const user = data;
      if (!user || !user._id) return;

      await this.walletService.createWallet(
        user._id.toString(),
        WALLET_OWNER_TYPE.USER,
      );
    } catch (e) {
      logError("handleUserRegistered - Wallet", e);
    }
  }
}
