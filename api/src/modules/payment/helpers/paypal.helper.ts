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
  const auth = Buffer.from(
    `${settings.paypalClientId}:${settings.paypalClientSecret}`,
  ).toString("base64");

  try {
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

    return response.data.access_token;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new BadRequestException(
      `Failed to get PayPal access token: ${axiosError.response?.data || axiosError.message}`,
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
