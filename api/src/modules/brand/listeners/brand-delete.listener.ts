import { Injectable, Inject } from "@nestjs/common";
import { Model } from "mongoose";
import { QueueEventListener, QueueMessageService } from "src/kernel";
import { EVENT } from "src/kernel/constants";
import { logError } from "src/lib/utils";
import { BRAND_CHANNEL, BRAND_DELETE_TOPIC } from "../constants";
import { PRODUCT_PROVIDER } from "src/modules/products/constants";
import { ProductModel } from "src/modules/products/models";

@Injectable()
export class BrandDeleteListener {
  constructor(
    private readonly queueEventService: QueueMessageService,
    @Inject(PRODUCT_PROVIDER)
    private readonly productModel: Model<ProductModel>,
  ) {
    this.queueEventService.subscribe(
      BRAND_CHANNEL,
      BRAND_DELETE_TOPIC,
      this.handleBrandDelete.bind(this),
    );
  }

  public async handleBrandDelete({ data: event }: QueueEventListener) {
    const { eventName, data } = event;
    if (eventName !== EVENT.DELETED) return;

    try {
      const brand = data;
      if (!brand || !brand._id) return;

      await this.productModel.updateMany(
        { brandId: brand._id },
        { $set: { brandId: null } },
      );
    } catch (e) {
      logError("handleBrandDelete", e);
    }
  }
}
