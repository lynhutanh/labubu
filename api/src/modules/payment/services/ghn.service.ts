import { Injectable, BadRequestException, Inject, forwardRef } from "@nestjs/common";
import axios from "axios";
import { GHN_BASE_URL } from "../constants/ghn.constants";
import { SettingService } from "src/modules/settings/services";

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
  private token: string = "";
  private shopId: string = "";
  private baseUrl: string = GHN_BASE_URL;
  private settingService: SettingService;
  private configLoaded: boolean = false;

  constructor(
    @Inject(forwardRef(() => SettingService))
    settingService: SettingService,
  ) {
    this.settingService = settingService;
  }

  private async loadConfig(force = false) {
    if (this.configLoaded && !force && this.token) {
      return;
    }
    try {
      const ghnBaseUrlRaw = await this.settingService.get("GHN_BASE_URL");
      const ghnTokenRaw = await this.settingService.get("GHN_TOKEN");
      const ghnShopIdRaw = await this.settingService.get("GHN_SHOP_ID");

      this.baseUrl = (ghnBaseUrlRaw || GHN_BASE_URL).trim();
      this.token = (ghnTokenRaw ? String(ghnTokenRaw) : "").trim();
      this.shopId = (ghnShopIdRaw ? String(ghnShopIdRaw) : "").trim();

      if (!this.token) {
        console.warn("❌ GHN_TOKEN chưa được cấu hình trong Admin Settings");
        console.warn("Vui lòng vào Admin Settings > Tab GHN để cấu hình");
        console.warn("Debug: ghnTokenRaw =", ghnTokenRaw);
        this.configLoaded = false;
      }
      if (!this.shopId) {
        console.warn("⚠️ GHN_SHOP_ID chưa được cấu hình trong Admin Settings");
      }
      this.configLoaded = true;
    } catch (error) {
      console.error("Failed to load GHN config from settings:", error);
      console.error("Error details:", {
        message: error?.message,
        stack: error?.stack,
      });
      console.error("❌ Không thể load GHN config từ Admin Settings. Vui lòng kiểm tra lại.");
      this.baseUrl = GHN_BASE_URL;
      this.token = "";
      this.shopId = "";
      this.configLoaded = false;
    }
  }

  async refreshConfig() {
    this.configLoaded = false;
    await this.loadConfig();
  }

  private async getHeaders(includeShopId = false) {
    await this.loadConfig(!this.token);

    if (!this.token || this.token.length === 0) {
      console.error("❌ Token is empty when calling getHeaders()!");
      throw new BadRequestException("GHN token chưa được cấu hình. Vui lòng vào Admin Settings > Tab GHN để cấu hình");
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
    try {
      await this.loadConfig(!this.token);
      const url = `${this.baseUrl}/shiip/public-api/master-data/province`;
      const headers = await this.getHeaders();
      const resp = await axios.get(url, { headers });
      const responseData = resp.data;

      if (responseData?.data) {
        return responseData.data;
      }
      return responseData;
    } catch (error: any) {
      console.error("GHN getProvinces error:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        config: {
          url: error?.config?.url,
          method: error?.config?.method,
          headers: error?.config?.headers ? {
            ...error.config.headers,
            Token: error.config.headers.Token ? "***" : "MISSING",
          } : null,
        },
        stack: error?.stack,
      });
      throw new BadRequestException(
        error?.response?.data?.message ||
        error?.response?.data?.code_message ||
        error?.message ||
        "Không thể lấy danh sách tỉnh/thành phố từ GHN",
      );
    }
  }

  async getDistricts(provinceId: number) {
    if (!provinceId) {
      throw new BadRequestException("province_id là bắt buộc");
    }
    try {
      await this.loadConfig(!this.token);
      const url = `${this.baseUrl}/shiip/public-api/master-data/district`;
      const resp = await axios.post(
        url,
        { province_id: provinceId },
        { headers: await this.getHeaders() },
      );
      const responseData = resp.data;
      if (responseData?.data) {
        return responseData.data;
      }
      return responseData;
    } catch (error: any) {
      console.error("GHN getDistricts error:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        provinceId,
      });
      throw new BadRequestException(
        error?.response?.data?.message ||
        error?.message ||
        "Không thể lấy danh sách quận/huyện từ GHN",
      );
    }
  }

  async getWards(districtId: number) {
    if (!districtId) {
      throw new BadRequestException("district_id là bắt buộc");
    }
    try {
      await this.loadConfig(!this.token);
      const url = `${this.baseUrl}/shiip/public-api/master-data/ward?district_id=${districtId}`;
      const resp = await axios.get(url, { headers: await this.getHeaders() });
      const responseData = resp.data;
      if (responseData?.data) {
        return responseData.data;
      }
      return responseData;
    } catch (error: any) {
      console.error("GHN getWards error:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        districtId,
      });
      throw new BadRequestException(
        error?.response?.data?.message ||
        error?.message ||
        "Không thể lấy danh sách phường/xã từ GHN",
      );
    }
  }

  async createOrder(payload: GhnCreateOrderPayload) {
    await this.loadConfig(!this.token);
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
      headers: await this.getHeaders(true),
    });
    return resp.data;
  }

  async genPrintToken(orderCodes: string[]) {
    if (!orderCodes || !orderCodes.length) {
      throw new BadRequestException("order_codes là bắt buộc");
    }
    await this.loadConfig(!this.token);
    const url = `${this.baseUrl}/shiip/public-api/v2/a5/gen-token`;
    const resp = await axios.post(
      url,
      { order_codes: orderCodes },
      { headers: await this.getHeaders() },
    );
    return resp.data;
  }

  async getPrintUrl(clientOrderCode: string) {
    if (!clientOrderCode) {
      throw new BadRequestException("client_order_code là bắt buộc");
    }
    try {
      const orderDetail = await this.getOrderDetailByClientCode(clientOrderCode);
      const responseData = orderDetail?.data || orderDetail;
      const ghnOrderCode = responseData?.order_code;
      if (!ghnOrderCode) {
        throw new BadRequestException(
          "Không tìm thấy đơn hàng GHN. Đơn hàng có thể chưa được tạo trên GHN hoặc đã bị xóa.",
        );
      }

      const tokenResponse = await this.genPrintToken([ghnOrderCode]);
      const tokenData = tokenResponse?.data || tokenResponse;
      const token = tokenData?.token;

      if (!token) {
        throw new BadRequestException(
          "Không thể tạo token để in bill từ GHN",
        );
      }

      const printUrl = `${this.baseUrl}/a5/public-api/print52x70?token=${token}`;
      return { token, printUrl, ghnOrderCode };
    } catch (error: any) {
      console.error("GHN getPrintUrl error:", {
        message: error?.message,
        response: error?.response?.data,
        clientOrderCode,
      });

      if (
        error?.response?.data?.code_message === "ORDER_NOT_FOUND" ||
        error?.message?.includes("ORDER_NOT_FOUND") ||
        error?.response?.data?.message?.includes("không tồn tại")
      ) {
        throw new BadRequestException(
          "Đơn hàng chưa được tạo trên GHN. Vui lòng tạo đơn GHN trước khi in bill.",
        );
      }

      throw new BadRequestException(
        error?.response?.data?.message ||
        error?.response?.data?.code_message_value ||
        error?.message ||
        "Không thể tạo URL in bill từ GHN",
      );
    }
  }

  async getOrderDetailByGhnCode(orderCode: string) {
    if (!orderCode) {
      throw new BadRequestException("order_code là bắt buộc");
    }
    await this.loadConfig();
    const url = `${this.baseUrl}/shiip/public-api/v2/shipping-order/detail`;
    const resp = await axios.post(
      url,
      { order_code: orderCode },
      { headers: await this.getHeaders() },
    );
    return resp.data;
  }

  async getOrderDetailByClientCode(clientOrderCode: string) {
    if (!clientOrderCode) {
      throw new BadRequestException("client_order_code là bắt buộc");
    }
    await this.loadConfig(!this.token);
    const url = `${this.baseUrl}/shiip/public-api/v2/shipping-order/detail-by-client-code`;
    const resp = await axios.post(
      url,
      { client_order_code: clientOrderCode },
      { headers: await this.getHeaders() },
    );
    return resp.data;
  }

  async getStations(provinceId: number, districtId: number) {
    if (!provinceId || !districtId) {
      throw new BadRequestException("province_id và district_id là bắt buộc");
    }
    try {
      await this.loadConfig(!this.token);
      const url = `${this.baseUrl}/shiip/public-api/v2/station/get`;
      const resp = await axios.post(
        url,
        { province_id: provinceId, district_id: districtId },
        { headers: await this.getHeaders() },
      );
      const responseData = resp.data;
      if (responseData?.data) {
        return responseData.data;
      }
      return responseData;
    } catch (error: any) {
      console.error("GHN getStations error:", {
        message: error?.message,
        response: error?.response?.data,
        provinceId,
        districtId,
      });
      throw new BadRequestException(
        error?.response?.data?.message ||
        error?.message ||
        "Không thể lấy danh sách bưu cục từ GHN",
      );
    }
  }

  async trackOrder(orderCode: string) {
    if (!orderCode) {
      throw new BadRequestException("order_code là bắt buộc");
    }
    try {
      await this.loadConfig(!this.token);
      console.log("🔍 [GHN Tracking] Requesting order detail for:", orderCode);
      const detail = await this.getOrderDetailByGhnCode(orderCode);
      console.log("📦 [GHN Tracking] Raw response from GHN API:", JSON.stringify(detail, null, 2));
      const data: any = detail?.data || detail;
      console.log("📦 [GHN Tracking] Parsed data:", JSON.stringify(data, null, 2));

      if (!data) {
        console.error("❌ [GHN Tracking] No data found in response");
        throw new BadRequestException("Không tìm thấy thông tin đơn hàng");
      }

      const status = data.status || "";
      
      const statusMap: Record<string, string> = {
        ready_to_pick: "Chờ lấy hàng",
        picking: "Đang lấy hàng",
        picked: "Lấy hàng thành công",
        storing: "Đang lưu kho",
        transporting: "Đang trung chuyển",
        sorting: "Đang phân loại",
        delivering: "Đang giao hàng",
        delivered: "Đã giao hàng",
        delivery_fail: "Giao hàng thất bại",
        waiting_to_return: "Chờ hoàn",
        return: "Đang hoàn",
        returned: "Đã hoàn",
        cancel: "Đã hủy",
        warehouse_departure: "Xuất hàng đi khỏi kho",
        money_collect_picking: "Thu tiền khi lấy hàng",
      };
      
      const statusName = data.status_name || statusMap[status] || status || "";
      const currentWarehouseId = data.current_warehouse_id || null;
      const nextWarehouseId = data.next_warehouse_id || null;
      const logs = Array.isArray(data.log) ? data.log : [];
      
      console.log("📊 [GHN Tracking] Extracted info:", {
        status,
        statusName,
        currentWarehouseId,
        nextWarehouseId,
        logsCount: logs.length,
        logs: logs,
        hasLogField: !!data.log,
        allDataKeys: Object.keys(data),
      });

      const stationMap: Record<number, string> = {};
      const warehouseIds = new Set<number>();

      logs.forEach((log: any) => {
        if (log.warehouse_id) {
          warehouseIds.add(log.warehouse_id);
        }
      });
      if (currentWarehouseId) {
        warehouseIds.add(currentWarehouseId);
      }
      if (nextWarehouseId) {
        warehouseIds.add(nextWarehouseId);
      }

      if (warehouseIds.size > 0) {
        try {
          const toProvinceId = data.to_province_id || data.to_district_id ? null : null;
          const toDistrictId = data.to_district_id;
          const fromProvinceId = data.from_province_id;
          const fromDistrictId = data.from_district_id;

          const provinceId = toProvinceId || fromProvinceId;
          const districtId = toDistrictId || fromDistrictId;

          console.log("🏢 [GHN Tracking] Getting stations:", { 
            provinceId, 
            districtId, 
            warehouseIds: Array.from(warehouseIds),
            toProvinceId,
            toDistrictId,
            fromProvinceId,
            fromDistrictId,
          });

          if (provinceId && districtId) {
            const stations = await this.getStations(provinceId, districtId);
            const stationsList = Array.isArray(stations) ? stations : [];
            console.log("🏢 [GHN Tracking] Stations received:", stationsList.length, stationsList);

            stationsList.forEach((station: any) => {
              if (station.locationId && warehouseIds.has(station.locationId)) {
                stationMap[station.locationId] = station.locationName || station.name || "";
                console.log(`🏢 [GHN Tracking] Mapped warehouse ${station.locationId} -> ${stationMap[station.locationId]}`);
              }
            });
          } else {
            console.warn("⚠️ [GHN Tracking] Missing provinceId or districtId:", { provinceId, districtId });
          }
        } catch (error) {
          console.warn("⚠️ [GHN Tracking] Không thể lấy danh sách bưu cục:", error);
        }
      }
      
      console.log("🗺️ [GHN Tracking] Station map:", stationMap);

      let timeline: any[] = [];
      
      if (logs.length > 0) {
        timeline = logs.map((log: any) => {
          const warehouseId = log.warehouse_id || null;
          const stationName = warehouseId && stationMap[warehouseId] ? stationMap[warehouseId] : null;
          const logStatus = log.status || "";
          const logStatusName = log.status_name || statusMap[logStatus] || logStatus || "";

          let description = logStatusName;
          const statusLower = logStatusName.toLowerCase();
          const logStatusLower = logStatus.toLowerCase();
          
          if (logStatusLower === "money_collect_picking") {
            description = stationName 
              ? `Nhân viên đang thu tiền khi lấy hàng tại ${stationName}`
              : "Nhân viên đang thu tiền khi lấy hàng";
          } else if (statusLower.includes("trung chuyển") && stationName) {
            description = `Đơn hàng đang trung chuyển đến ${stationName}`;
          } else if (statusLower.includes("xuất") && stationName) {
            description = `Đơn hàng đã xuất khỏi Bưu Cục đến ${stationName}`;
          } else if (statusLower.includes("chờ xuất") && stationName) {
            description = `Đơn hàng chờ xuất đến ${stationName}`;
          } else if (statusLower.includes("lưu tại") && stationName) {
            description = `Đơn hàng lưu tại ${stationName}`;
          } else if (statusLower.includes("lấy thành công") && stationName) {
            description = `Đơn hàng lấy thành công tại ${stationName}`;
          } else if (statusLower.includes("đang lấy") && stationName) {
            description = `Nhân viên đang lấy hàng tại địa chỉ ${stationName}`;
          } else if (stationName) {
            description = `Đơn hàng ${logStatusName.toLowerCase()} tại ${stationName}`;
          } else {
            description = `Đơn hàng ${logStatusName.toLowerCase()}`;
          }

          return {
            time: log.updated_date || log.created_date || log.time || "",
            status: logStatusName,
            description: description,
            station: stationName,
          };
        });
      } else {
        const currentStationName = currentWarehouseId && stationMap[currentWarehouseId] ? stationMap[currentWarehouseId] : null;
        let description = statusName;
        
        if (status === "ready_to_pick") {
          description = currentStationName 
            ? `Đơn hàng chờ lấy hàng tại ${currentStationName}`
            : "Đơn hàng chờ lấy hàng";
        } else if (status === "picking") {
          description = currentStationName
            ? `Nhân viên đang lấy hàng tại địa chỉ ${currentStationName}`
            : "Nhân viên đang lấy hàng";
        } else if (status === "picked") {
          description = currentStationName
            ? `Đơn hàng lấy thành công tại ${currentStationName}`
            : "Đơn hàng lấy thành công";
        } else if (status === "transporting") {
          description = currentStationName
            ? `Đơn hàng đang trung chuyển đến ${currentStationName}`
            : "Đơn hàng đang trung chuyển";
        }
        
        timeline = [{
          time: data.updated_date || data.created_date || data.order_date || "",
          status: statusName,
          description: description,
          station: currentStationName,
        }];
      }
      
      console.log("📋 [GHN Tracking] Timeline created:", JSON.stringify(timeline, null, 2));

      const result = {
        order_code: orderCode,
        current_status: statusName,
        current_station: currentWarehouseId && stationMap[currentWarehouseId] ? stationMap[currentWarehouseId] : null,
        next_station: nextWarehouseId && stationMap[nextWarehouseId] ? stationMap[nextWarehouseId] : null,
        timeline: timeline.reverse(),
      };
      
      console.log("✅ [GHN Tracking] Final result:", JSON.stringify(result, null, 2));
      return result;
    } catch (error: any) {
      console.error("GHN trackOrder error:", {
        message: error?.message,
        response: error?.response?.data,
        orderCode,
      });
      throw new BadRequestException(
        error?.response?.data?.message ||
        error?.response?.data?.code_message_value ||
        error?.message ||
        "Không thể lấy thông tin tracking từ GHN",
      );
    }
  }
}
