import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import axios, { AxiosError } from "axios";
import { IPayPalAccessTokenResponse } from "../interfaces";
import { getPayPalBaseUrl } from "../helpers";

type TokenCacheEntry = {
  accessToken: string;
  expiresAtMs: number;
  inflight?: Promise<string>;
};

@Injectable()
export class PayPalAuthService {
  private readonly logger = new Logger(PayPalAuthService.name);
  private cache: TokenCacheEntry | null = null;

  async getAccessToken(params: {
    mode: string;
    clientId: string;
    clientSecret: string;
  }): Promise<string> {
    const { mode, clientId, clientSecret } = params;

    if (!clientId || !clientSecret) {
      throw new BadRequestException("Missing PayPal credentials");
    }

    const now = Date.now();
    const cached = this.cache;
    if (cached && cached.accessToken && cached.expiresAtMs > now) {
      return cached.accessToken;
    }

    if (cached?.inflight) {
      return cached.inflight;
    }

    const inflight = this.fetchAccessToken({ mode, clientId, clientSecret })
      .then((token) => {
        return token;
      })
      .finally(() => {
        if (this.cache) {
          delete this.cache.inflight;
        }
      });

    this.cache = { accessToken: "", expiresAtMs: 0, inflight };
    return inflight;
  }

  private async fetchAccessToken(params: {
    mode: string;
    clientId: string;
    clientSecret: string;
  }): Promise<string> {
    const { mode, clientId, clientSecret } = params;
    const baseUrl = getPayPalBaseUrl(mode);
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

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

      const safetyWindowMs = 30_000;
      const expiresAtMs = Date.now() + response.data.expires_in * 1000 - safetyWindowMs;

      this.cache = {
        accessToken: response.data.access_token,
        expiresAtMs,
      };

      return response.data.access_token;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Failed to get PayPal access token: ${axiosError.response?.status} ${axiosError.message}`,
      );
      throw new BadRequestException(
        `Failed to get PayPal access token: ${axiosError.response?.data || axiosError.message}`,
      );
    }
  }
}

