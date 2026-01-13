import { Injectable, BadRequestException } from "@nestjs/common";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { GHN_BASE_URL } from "../constants/ghn.constants";

export interface GhnCreateOrderPayload {
  orderCode: string; // client_order_code
  toName: string;
  toPhone: string;
  toAddress: string;
  toWardCode: string;
  toDistrictId: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  codAmount?: number;
  serviceTypeId?: number;
  paymentTypeId?: number;
  requiredNote?: string;
  content?: string;
  fromName: string;
  fromPhone: string;
  fromAddress: string;
  fromWardName: string;
  fromDistrictName: string;
  fromProvinceName: string;
}

@Injectable()
export class GhnService {
  private token: string;
  private shopId: string;
  private baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const ghnConfig = this.configService.get<any>("ghn") || {};
    this.token = process.env.GHN_TOKEN || ghnConfig.token || "";
    this.shopId = process.env.GHN_SHOP_ID || ghnConfig.shopId || "";
    this.baseUrl = ghnConfig.baseUrl || GHN_BASE_URL;
  }

  private getHeaders(includeShopId = false) {
    if (!this.token) {
      throw new BadRequestException("GHN token chưa được cấu hình");
    }
    const headers: Record<string, string> = {
      Token: this.token,
      "Content-Type": "application/json",
    };
    if (includeShopId) {
      if (!this.shopId) {
        throw new BadRequestException("GHN ShopId chưa được cấu hình");
      }
      headers.ShopId = this.shopId;
    }
    return headers;
  }

  async getProvinces() {
    const url = `${this.baseUrl}/shiip/public-api/master-data/province`;
    const resp = await axios.get(url, { headers: this.getHeaders() });
    return resp.data;
  }

  async getDistricts(provinceId: number) {
    if (!provinceId) {
      throw new BadRequestException("province_id là bắt buộc");
    }
    const url = `${this.baseUrl}/shiip/public-api/master-data/district`;
    const resp = await axios.post(
      url,
      { province_id: provinceId },
      { headers: this.getHeaders() },
    );
    return resp.data;
  }

  async getWards(districtId: number) {
    if (!districtId) {
      throw new BadRequestException("district_id là bắt buộc");
    }
    const url = `${this.baseUrl}/shiip/public-api/master-data/ward?district_id=${districtId}`;
    const resp = await axios.get(url, { headers: this.getHeaders() });
    return resp.data;
  }

  async createOrder(payload: GhnCreateOrderPayload) {
    const url = `${this.baseUrl}/shiip/public-api/v2/shipping-order/create`;
    const body = {
      client_order_code: payload.orderCode,
      to_name: payload.toName,
      to_phone: payload.toPhone,
      to_address: payload.toAddress,
      to_ward_code: payload.toWardCode,
      to_district_id: payload.toDistrictId,
      from_name: payload.fromName,
      from_phone: payload.fromPhone,
      from_address: payload.fromAddress,
      from_ward_name: payload.fromWardName,
      from_district_name: payload.fromDistrictName,
      from_province_name: payload.fromProvinceName,
      weight: payload.weight,
      length: payload.length,
      width: payload.width,
      height: payload.height,
      cod_amount: payload.codAmount || 0,
      service_type_id: payload.serviceTypeId || 2,
      payment_type_id: payload.paymentTypeId || 1,
      required_note: payload.requiredNote || "KHONGCHOXEMHANG",
      content: payload.content || `Đơn hàng ${payload.orderCode}`,
    };
    const resp = await axios.post(url, body, {
      headers: this.getHeaders(true),
    });
    return resp.data;
  }

  async genPrintToken(orderCodes: string[]) {
    if (!orderCodes || !orderCodes.length) {
      throw new BadRequestException("order_codes là bắt buộc");
    }
    const url = `${this.baseUrl}/shiip/public-api/v2/a5/gen-token`;
    const resp = await axios.post(
      url,
      { order_codes: orderCodes },
      { headers: this.getHeaders() },
    );
    return resp.data;
  }

  async getOrderDetailByGhnCode(orderCode: string) {
    if (!orderCode) {
      throw new BadRequestException("order_code là bắt buộc");
    }
    const url = `${this.baseUrl}/shiip/public-api/v2/shipping-order/detail`;
    const resp = await axios.post(
      url,
      { order_code: orderCode },
      { headers: this.getHeaders() },
    );
    return resp.data;
  }

  async getOrderDetailByClientCode(clientOrderCode: string) {
    if (!clientOrderCode) {
      throw new BadRequestException("client_order_code là bắt buộc");
    }
    const url = `${this.baseUrl}/shiip/public-api/v2/shipping-order/detail-by-client-code`;
    const resp = await axios.post(
      url,
      { client_order_code: clientOrderCode },
      { headers: this.getHeaders() },
    );
    return resp.data;
  }
}
