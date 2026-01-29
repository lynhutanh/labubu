import { APIRequest } from "./api-request";

export interface RefundRequest {
  _id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  amount: number;
  reason?: string;
  status: string;
  processedBy?: string;
  processedAt?: Date;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundRequestSearchParams {
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface RefundRequestSearchResponse {
  data: RefundRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProcessRefundRequestPayload {
  adminNote?: string;
}

export class RefundRequestService extends APIRequest {
  public async getRefundRequests(
    params?: RefundRequestSearchParams,
  ): Promise<RefundRequestSearchResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const url = `/refund-requests/admin${queryString ? `?${queryString}` : ""}`;
    const response: any = await this.get(url);
    if (response?.data?.data) {
      return {
        data: response.data.data,
        total: response.data.total || 0,
        page: Number(response.data.page) || 1,
        limit: Number(response.data.limit) || 20,
        totalPages: response.data.totalPages || 1,
      };
    }
    return {
      data: response?.data || [],
      total: response?.total || 0,
      page: Number(response?.page) || 1,
      limit: Number(response?.limit) || 20,
      totalPages: response?.totalPages || 1,
    };
  }

  public async getPendingCount(): Promise<number> {
    const response = await this.get("/refund-requests/admin/pending-count");
    return response.data?.data?.count || 0;
  }

  public async approveRefundRequest(
    requestId: string,
    payload?: ProcessRefundRequestPayload,
  ): Promise<RefundRequest> {
    const response = await this.put(
      `/refund-requests/admin/${requestId}/approve`,
      payload || {},
    );
    return response.data?.data || response.data;
  }

  public async rejectRefundRequest(
    requestId: string,
    payload?: ProcessRefundRequestPayload,
  ): Promise<RefundRequest> {
    const response = await this.put(
      `/refund-requests/admin/${requestId}/reject`,
      payload || {},
    );
    return response.data?.data || response.data;
  }
}

export const refundRequestService = new RefundRequestService();
