import * as crypto from "crypto";
import { IZaloPayRawCallbackData, IZaloPayCallbackData } from "../interfaces";

export function getVNTimePrefix(): string {
  const vnTime = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return vnTime.toISOString().slice(2, 10).replace(/-/g, "");
}

export function generateZaloPayMAC(data: string, key: string): string {
  return crypto.createHmac("sha256", key).update(data).digest("hex");
}

export function generateZaloPayOrderData(
  appId: string,
  transId: string,
  appUser: string,
  amount: number,
  appTime: number,
  embedData: string,
  items: string,
): string {
  return `${appId}|${transId}|${appUser}|${amount}|${appTime}|${embedData}|${items}`;
}

export function generateZaloPayStatusMAC(
  appId: string,
  appTransId: string,
  key: string,
): string {
  const macData = `${appId}|${appTransId}|${key}`;
  return crypto.createHmac("sha256", key).update(macData).digest("hex");
}

export function generateZaloPayBankListMAC(
  appId: string,
  reqTime: number,
  key: string,
): string {
  const data = `${appId}|${reqTime}`;
  return crypto.createHmac("sha256", key).update(data).digest("hex");
}

export function generateZaloPayChecksumData(
  appid: number,
  apptransid: string,
  pmcid: number,
  bankcode: string,
  amount: number,
  discountamount: number,
  status: number,
): string {
  return `${appid}|${apptransid}|${pmcid}|${bankcode}|${amount}|${discountamount}|${status}`;
}

export function normalizeZaloPayCallbackData(
  data: IZaloPayRawCallbackData,
): IZaloPayCallbackData {
  return {
    appid:
      typeof data.appid === "string" ? parseInt(data.appid, 10) : data.appid,
    apptransid: data.apptransid,
    pmcid:
      typeof data.pmcid === "string" ? parseInt(data.pmcid, 10) : data.pmcid,
    bankcode: data.bankcode,
    amount:
      typeof data.amount === "string" ? parseInt(data.amount, 10) : data.amount,
    discountamount:
      typeof data.discountamount === "string"
        ? parseInt(data.discountamount, 10)
        : data.discountamount || 0,
    status:
      typeof data.status === "string" ? parseInt(data.status, 10) : data.status,
    checksum: data.checksum,
  };
}

export async function validateZaloPayChecksum(
  callbackData: IZaloPayCallbackData,
  key2: string,
): Promise<boolean> {
  try {
    const data = generateZaloPayChecksumData(
      callbackData.appid,
      callbackData.apptransid,
      callbackData.pmcid,
      callbackData.bankcode,
      callbackData.amount,
      callbackData.discountamount,
      callbackData.status,
    );
    const expectedChecksum = crypto
      .createHmac("sha256", key2)
      .update(data)
      .digest("hex");
    return expectedChecksum === callbackData.checksum;
  } catch {
    return false;
  }
}
