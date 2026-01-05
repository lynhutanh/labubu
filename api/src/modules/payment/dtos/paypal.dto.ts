import { Expose } from "class-transformer";
import {
  IPayPalCreateOrderResponse,
  IPayPalCaptureOrderResponse,
} from "../interfaces";

export class PayPalOrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  status: string;

  @Expose()
  approvalUrl?: string;

  @Expose()
  exchangeInfo?: {
    originalAmountVND: number;
    amountUSD: number;
    exchangeRate: number;
    originalCurrency: string;
  };

  constructor(data: IPayPalCreateOrderResponse) {
    this.id = data.id;
    this.status = data.status;
    const approveLink = data.links?.find((link) => link.rel === "approve");
    this.approvalUrl = approveLink?.href;
  }
}

export class PayPalCaptureResponseDto {
  @Expose()
  id: string;

  @Expose()
  status: string;

  @Expose()
  captureId?: string;

  @Expose()
  amount?: string;

  @Expose()
  currency?: string;

  @Expose()
  payerEmail?: string;

  @Expose()
  payerName?: string;

  constructor(data: IPayPalCaptureOrderResponse) {
    this.id = data.id;
    this.status = data.status;

    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    if (capture) {
      this.captureId = capture.id;
      this.amount = capture.amount?.value;
      this.currency = capture.amount?.currency_code;
    }

    if (data.payer) {
      this.payerEmail = data.payer.email_address;
      this.payerName =
        `${data.payer.name?.given_name || ""} ${data.payer.name?.surname || ""}`.trim();
    }
  }
}
