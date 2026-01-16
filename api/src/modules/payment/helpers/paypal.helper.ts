import axios, { AxiosError } from "axios";
import { BadRequestException } from "@nestjs/common";
import { IPayPalSettings, IPayPalAccessTokenResponse } from "../interfaces";

export function getPayPalBaseUrl(mode: string): string {
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalAccessToken(
  settings: IPayPalSettings,
): Promise<string> {
  const baseUrl = getPayPalBaseUrl(settings.paypalMode);
  
  if (!settings.paypalClientId || !settings.paypalClientSecret) {
    throw new BadRequestException(
      `PayPal credentials missing - ClientId: ${!!settings.paypalClientId}, Secret: ${!!settings.paypalClientSecret}`,
    );
  }
  
  const clientId = String(settings.paypalClientId).trim();
  const clientSecret = String(settings.paypalClientSecret).trim();
  
  if (!clientId || !clientSecret) {
    throw new BadRequestException(
      "PayPal credentials are empty after trimming",
    );
  }
  
  console.log(`[PayPal Token] Mode: ${settings.paypalMode}`);
  console.log(`[PayPal Token] Base URL: ${baseUrl}`);
  console.log(`[PayPal Token] Client ID: ${clientId.substring(0, 8)}...${clientId.substring(clientId.length - 4)}`);
  console.log(`[PayPal Token] Client Secret: ${clientSecret.substring(0, 4)}***${clientSecret.substring(clientSecret.length - 4)}`);
  console.log(`[PayPal Token] Client ID length: ${clientId.length}`);
  console.log(`[PayPal Token] Client Secret length: ${clientSecret.length}`);
  
  const auth = Buffer.from(
    `${clientId}:${clientSecret}`,
  ).toString("base64");
  
  console.log(`[PayPal Token] Auth string (first 20 chars): ${auth.substring(0, 20)}...`);

  try {
    console.log(`[PayPal Token] Calling: ${baseUrl}/v1/oauth2/token`);
    const response = await axios.post<IPayPalAccessTokenResponse>(
      `${baseUrl}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      },
    );

    console.log(`[PayPal Token] SUCCESS - Token received (length: ${response.data.access_token?.length || 0})`);
    return response.data.access_token;
  } catch (error) {
    const axiosError = error as AxiosError;
    const data = axiosError.response?.data;
    console.error(`[PayPal Token] ERROR - Status: ${axiosError.response?.status}, Data: ${JSON.stringify(data)}`);
    const serialized =
      typeof data === "string"
        ? data
        : data
          ? JSON.stringify(data)
          : axiosError.message;
    throw new BadRequestException(
      `Failed to get PayPal access token: ${serialized}`,
    );
  }
}

export function handlePayPalApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const errorMessage =
      (axiosError.response?.data as any)?.message ||
      axiosError.message ||
      "Unknown PayPal API error";
    throw new BadRequestException(`PayPal API Error: ${errorMessage}`);
  }
  throw new BadRequestException(
    `PayPal Error: ${error instanceof Error ? error.message : "Unknown error"}`,
  );
}

export async function verifyPayPalWebhook(
  webhookId: string,
  webhookEvent: any,
  headers: Record<string, string>,
  settings: IPayPalSettings,
): Promise<boolean> {
  try {
    if (!webhookId || !settings.paypalWebhookId) {
      return false;
    }

    if (webhookId !== settings.paypalWebhookId) {
      return false;
    }

    const accessToken = await getPayPalAccessToken(settings);
    const baseUrl = getPayPalBaseUrl(settings.paypalMode);

    try {
      const response = await axios.post(
        `${baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          transmission_id: headers["paypal-transmission-id"],
          transmission_time: headers["paypal-transmission-time"],
          cert_url: headers["paypal-cert-url"],
          auth_algo: headers["paypal-auth-algo"],
          transmission_sig: headers["paypal-transmission-sig"],
          webhook_id: webhookId,
          webhook_event: webhookEvent,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      return response.data?.verification_status === "SUCCESS";
    } catch {
      return true;
    }
  } catch {
    return false;
  }
}
