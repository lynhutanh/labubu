import { APIRequest } from "./api-request";

export interface Setting {
  _id: string;
  key: string;
  value: any;
  name: string;
  description?: string;
  type?: string;
  meta?: any;
  public?: boolean;
  visible?: boolean;
  editable?: boolean;
  group?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  workingHours?: string;
  workingHoursNote?: string;
  facebook?: string;
  instagram?: string;
  zalo?: string;
  whatsapp?: string;
}

export interface TeamMember {
  name?: string;
  description?: string;
  whatsapp?: string;
  whatsappLink?: string;
  telegram?: string;
  telegramLink?: string;
  avatar?: string;
}

export interface TeamInfo {
  member1?: TeamMember;
  member2?: TeamMember;
}

export class SettingService extends APIRequest {
  public async getPublicSettings(): Promise<Setting[]> {
    const response = await this.get(`/settings?t=${Date.now()}`);
    return response.data?.data || response.data || [];
  }

  public async getContactInfo(): Promise<ContactInfo> {
    const settings = await this.getPublicSettings();
    const contactInfo: ContactInfo = {};

    settings.forEach((setting) => {
      const key = setting.key.toLowerCase();
      if (key.includes("phone") || key.includes("hotline")) {
        contactInfo.phone = setting.value;
      } else if (key.includes("email")) {
        contactInfo.email = setting.value;
      } else if (key.includes("address")) {
        contactInfo.address = setting.value;
      } else if (key.includes("working") && key.includes("hour")) {
        contactInfo.workingHours = setting.value;
      } else if (key.includes("facebook")) {
        contactInfo.facebook = setting.value;
      } else if (key.includes("instagram")) {
        contactInfo.instagram = setting.value;
      } else if (key.includes("zalo")) {
        contactInfo.zalo = setting.value;
      } else if (key.includes("whatsapp")) {
        contactInfo.whatsapp = setting.value;
      }
    });

    return contactInfo;
  }

  public async getTeamInfo(): Promise<TeamInfo> {
    const settings = await this.getPublicSettings();
    const teamInfo: TeamInfo = {};

    settings.forEach((setting) => {
      const key = setting.key.toLowerCase();
      if (key.startsWith("team_member1_")) {
        const field = key.replace("team_member1_", "");
        if (!teamInfo.member1) {
          teamInfo.member1 = {};
        }
        if (field === "name") {
          teamInfo.member1.name = setting.value;
        } else if (field === "description") {
          teamInfo.member1.description = setting.value;
        } else if (field === "whatsapp") {
          teamInfo.member1.whatsapp = setting.value;
        } else if (field === "whatsapp_link") {
          teamInfo.member1.whatsappLink = setting.value;
        } else if (field === "telegram") {
          teamInfo.member1.telegram = setting.value;
        } else if (field === "telegram_link") {
          teamInfo.member1.telegramLink = setting.value;
        } else if (field === "avatar") {
          teamInfo.member1.avatar = setting.value;
        }
      } else if (key.startsWith("team_member2_")) {
        const field = key.replace("team_member2_", "");
        if (!teamInfo.member2) {
          teamInfo.member2 = {};
        }
        if (field === "name") {
          teamInfo.member2.name = setting.value;
        } else if (field === "description") {
          teamInfo.member2.description = setting.value;
        } else if (field === "whatsapp") {
          teamInfo.member2.whatsapp = setting.value;
        } else if (field === "whatsapp_link") {
          teamInfo.member2.whatsappLink = setting.value;
        } else if (field === "telegram") {
          teamInfo.member2.telegram = setting.value;
        } else if (field === "telegram_link") {
          teamInfo.member2.telegramLink = setting.value;
        } else if (field === "avatar") {
          teamInfo.member2.avatar = setting.value;
        }
      }
    });

    return teamInfo;
  }
}

export const settingService = new SettingService();
