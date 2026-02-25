import { APIRequest } from "./api-request";

export interface Voucher {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed" | "shipping";
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  totalQuantity: number;
  usedQuantity: number;
  startDate: string;
  endDate: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  applicableUsers?: string[];
  maxUsesPerUser?: number;
  status: "active" | "inactive" | "expired";
  image?: string;
}

export interface VouchersResponse {
  vouchers: Voucher[];
  total: number;
  page: number;
  limit: number;
}

export interface VoucherValidation {
  valid: boolean;
  discount: number;
  message?: string;
}

export class VoucherService extends APIRequest {
  public async getActiveVouchers(): Promise<VouchersResponse> {
    const response = await this.get("/vouchers");
    return response.data?.data || response.data;
  }

  public async validateVoucher(
    code: string,
    orderAmount: number
  ): Promise<VoucherValidation> {
    const response = await this.get(
      `/vouchers/validate?code=${code}&orderAmount=${orderAmount}`
    );
    return response.data?.data || response.data;
  }
}

export const voucherService = new VoucherService();
