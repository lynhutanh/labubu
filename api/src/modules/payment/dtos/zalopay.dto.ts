import { Expose } from "class-transformer";

export class ZaloPayResponseDto {
  @Expose()
  returncode: number;

  @Expose()
  returnmessage: string;

  @Expose()
  orderurl: string;

  @Expose()
  zptranstoken: string;

  @Expose()
  apptransid?: string;

  constructor(init?: Partial<ZaloPayResponseDto>) {
    if (init) {
      this.returncode = init.returncode ?? 0;
      this.returnmessage = init.returnmessage ?? "";
      this.orderurl = init.orderurl ?? "";
      this.zptranstoken = init.zptranstoken ?? "";
      this.apptransid = init.apptransid;
    }
  }
}

export class ZaloPayCallbackResponseDto {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  @Expose()
  orderId?: string;

  @Expose()
  transactionId?: string;

  constructor(init?: Partial<ZaloPayCallbackResponseDto>) {
    if (init) {
      this.success = init.success ?? false;
      this.message = init.message ?? "";
      this.orderId = init.orderId;
      this.transactionId = init.transactionId;
    }
  }
}

export class ZaloPayStatusResponseDto {
  @Expose()
  returncode: number;

  @Expose()
  returnmessage: string;

  @Expose()
  isprocessing: boolean;

  @Expose()
  amount: number;

  @Expose()
  zptransid: string;

  constructor(init?: any) {
    if (init) {
      this.returncode = init.return_code ?? init.returncode ?? 0;
      this.returnmessage = init.return_message ?? init.returnmessage ?? "";
      this.isprocessing = init.is_processing ?? init.isprocessing ?? false;
      this.amount = init.amount ?? 0;
      this.zptransid = init.zp_trans_id ?? init.zptransid ?? "";
    }
  }
}
