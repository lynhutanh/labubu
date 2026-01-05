import { Injectable, Inject } from "@nestjs/common";
import { Model } from "mongoose";
import { SETTING_MODEL_PROVIDER } from "../providers";

interface SettingModel {
  _id: any;
  key: string;
  value: any;
  name: string;
  description: string;
  type: string;
  meta: any;
  public: boolean;
  visible: boolean;
  editable: boolean;
  group: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SettingService {
  private settingsCache = new Map<string, any>();

  constructor(
    @Inject(SETTING_MODEL_PROVIDER)
    private readonly settingModel: Model<SettingModel>,
  ) {}

  async syncCache() {
    const settings = await this.settingModel.find().lean();
    settings.forEach((setting) => {
      this.settingsCache.set(setting.key, setting.value);
    });
  }

  async get(key: string): Promise<any> {
    if (this.settingsCache.has(key)) {
      return this.settingsCache.get(key);
    }
    const setting = await this.settingModel.findOne({ key }).lean();
    if (setting) {
      this.settingsCache.set(key, setting.value);
      return setting.value;
    }
    return null;
  }

  async set(key: string, value: any): Promise<void> {
    await this.settingModel.updateOne(
      { key },
      { $set: { value, updatedAt: new Date() } },
      { upsert: true },
    );
    this.settingsCache.set(key, value);
  }

  async getPublicSettings(): Promise<any[]> {
    const settings = await this.settingModel.find({ public: true }).lean();
    return settings;
  }

  async getAllSettings(): Promise<any[]> {
    const settings = await this.settingModel.find().lean();
    return settings;
  }

  async getKeyValues(keys: string[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    for (const key of keys) {
      result[key] = await this.get(key);
    }
    return result;
  }

  async getEditableSettings(group?: string): Promise<any[]> {
    const query: any = { editable: true, visible: true };
    if (group) {
      query.group = group;
    }
    const settings = await this.settingModel
      .find(query)
      .sort({ group: 1, order: 1 })
      .lean();
    return settings;
  }
}
