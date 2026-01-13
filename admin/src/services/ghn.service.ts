import { APIRequest } from "./api-request";

interface PrintUrlResponse {
  token: string;
  printUrl: string;
  ghnOrderCode?: string;
}

class GhnService extends APIRequest {
  async getPrintUrl(orderCode: string): Promise<PrintUrlResponse> {
    const response = await this.get(`/ghn/print-url?orderCode=${encodeURIComponent(orderCode)}`);
    return response.data;
  }

  async getPrintUrlByGhnCode(ghnOrderCode: string): Promise<PrintUrlResponse> {
    const response = await this.get(`/ghn/print-url-by-ghn-code?ghnOrderCode=${encodeURIComponent(ghnOrderCode)}`);
    return response.data;
  }
}

export const ghnService = new GhnService();
