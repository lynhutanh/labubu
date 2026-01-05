import { APIRequest } from "./api-request";
import type { ISetting } from "src/interfaces";

class SettingsService extends APIRequest {
  async getEditableSettings(group?: string): Promise<ISetting[]> {
    const params = group ? `?group=${group}` : "";
    const response = await this.get(`/admin/settings${params}`);
    return (response as any).data || [];
  }

  async update(key: string, value: any): Promise<ISetting> {
    const response = await this.put(`/admin/settings/${key}`, { value });
    return (response as any).data;
  }

  async getPublicSettings(): Promise<Record<string, any>> {
    const response = await this.get("/settings/public");
    return (response as any).data || {};
  }
}

export const settingsService = new SettingsService();

