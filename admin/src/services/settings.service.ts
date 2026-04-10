import { APIRequest } from "./api-request";
import axios from "axios";
import { isUrl } from "@lib/string";
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

  async downloadBackup(): Promise<void> {
    const baseUrl = this.getBaseApiEndpoint();
    const token = this.getToken();
    const response = await axios.get(`${baseUrl}/admin/backup/download`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `backup_${date}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async restoreBackup(file: File): Promise<any> {
    const baseUrl = this.getBaseApiEndpoint();
    const token = this.getToken();
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${baseUrl}/admin/backup/restore`, formData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
}

export const settingsService = new SettingsService();


