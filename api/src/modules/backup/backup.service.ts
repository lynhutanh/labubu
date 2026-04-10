import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import * as mongoose from "mongoose";
import * as crypto from "crypto";
import { ObjectId } from "mongodb";
import { MONGO_DB_PROVIDER } from "src/kernel";

const SKIP_COLLECTIONS = ["migrations"];
const DEFAULT_ADMIN_PASSWORD = "adminadmin";

// Các field thường chứa ObjectId
const OBJECT_ID_FIELDS = new Set([
  "_id", "sourceId", "userId", "productId", "categoryId", "orderId",
  "brandId", "cartId", "voucherId", "fileId", "authId", "rankId",
  "walletId", "petId", "userPetId", "configId",
]);

@Injectable()
export class BackupService {
  constructor(
    @Inject(MONGO_DB_PROVIDER)
    private readonly mongooseInstance: typeof mongoose,
  ) {}

  async exportAllData(): Promise<Record<string, any>> {
    const db = this.mongooseInstance.connection.db;
    const collectionInfos = await db.listCollections().toArray();
    const collectionNames = collectionInfos.map((c) => c.name);

    const backup: Record<string, any> = {
      metadata: {
        createdAt: new Date().toISOString(),
        totalCollections: collectionNames.length,
      },
      collections: {},
    };

    for (const name of collectionNames) {
      const documents = await db.collection(name).find({}).toArray();
      backup.collections[name] = documents;
    }

    backup.metadata.totalDocuments = Object.values(backup.collections).reduce(
      (sum: number, docs: any[]) => sum + docs.length,
      0,
    );

    return backup;
  }

  async restoreFromData(buffer: Buffer): Promise<Record<string, any>> {
    let data: any;
    try {
      data = JSON.parse(buffer.toString("utf8"));
    } catch {
      throw new HttpException(
        "File backup không hợp lệ (không phải JSON)",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!data.collections || typeof data.collections !== "object") {
      throw new HttpException(
        "File backup không hợp lệ (thiếu trường collections)",
        HttpStatus.BAD_REQUEST,
      );
    }

    const db = this.mongooseInstance.connection.db;
    const result: Record<string, number> = {};

    for (const [name, docs] of Object.entries(data.collections) as [string, any[]][]) {
      if (SKIP_COLLECTIONS.includes(name) || !docs || docs.length === 0) continue;
      const converted = docs.map((doc) => this.restoreObjectIds(doc));
      await db.collection(name).deleteMany({});
      await db.collection(name).insertMany(converted);
      result[name] = converted.length;
    }

    // Tạo lại auth cho admin user sau khi restore
    await this.ensureAdminAuth(db);

    return result;
  }

  /**
   * Convert string 24-hex trở lại ObjectId, và ISO date string trở lại Date
   */
  private restoreObjectIds(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "string") {
      // ObjectId: 24 ký tự hex
      if (/^[0-9a-fA-F]{24}$/.test(obj)) {
        return new ObjectId(obj);
      }
      // ISO Date string
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
        return new Date(obj);
      }
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.restoreObjectIds(item));
    }
    if (typeof obj === "object") {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (OBJECT_ID_FIELDS.has(key) && typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value)) {
          result[key] = new ObjectId(value);
        } else {
          result[key] = this.restoreObjectIds(value);
        }
      }
      return result;
    }
    return obj;
  }

  private async ensureAdminAuth(db: mongoose.mongo.Db): Promise<void> {
    const adminUser = await db.collection("users").findOne({ role: "admin" });
    if (!adminUser) return;

    const salt = crypto.randomBytes(16).toString("base64");
    const hash = crypto
      .pbkdf2Sync(DEFAULT_ADMIN_PASSWORD, salt, 10000, 64, "sha1")
      .toString("base64");

    // Xóa auth cũ của admin
    await db.collection("auths").deleteMany({ sourceId: adminUser._id });

    // Tạo auth mới
    await db.collection("auths").insertMany([
      {
        type: "email",
        source: "user",
        sourceId: adminUser._id,
        key: adminUser.email,
        salt,
        value: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "username",
        source: "user",
        sourceId: adminUser._id,
        key: adminUser.username,
        salt,
        value: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  }
}

