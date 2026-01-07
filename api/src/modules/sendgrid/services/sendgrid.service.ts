import { Injectable, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { logError } from "src/lib/utils";
import {
  ISendgridSettings,
  ISendgridSendEmailRequest,
  ISendgridSendEmailResponse,
} from "../interfaces/sendgrid.interface";
import axios, { AxiosResponse } from "axios";

@Injectable()
export class SendgridService {
  private readonly logger = new Logger("SendgridService");
  private readonly baseUrl = "https://api.sendgrid.com/v3";

  constructor(private readonly configService: ConfigService) {}

  private getSettings(): ISendgridSettings {
    const apiKey =
      process.env.SENDGRID_API_KEY ||
      this.configService.get<string>("SENDGRID_API_KEY");
    const enabled =
      process.env.SENDGRID_ENABLED ||
      this.configService.get<string>("SENDGRID_ENABLED") ||
      "true";
    const fromEmail =
      process.env.SENDGRID_FROM_EMAIL ||
      this.configService.get<string>("SENDGRID_FROM_EMAIL");
    const fromName =
      process.env.SENDGRID_FROM_NAME ||
      this.configService.get<string>("SENDGRID_FROM_NAME") ||
      "Labubu Store";

    if (!apiKey) {
      throw new HttpException(
        "Sendgrid chưa được cấu hình. Vui lòng cấu hình SENDGRID_API_KEY trong file .env.",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!fromEmail) {
      throw new HttpException(
        "Email gửi chưa được cấu hình. Vui lòng cấu hình SENDGRID_FROM_EMAIL trong file .env.",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (enabled !== "true") {
      throw new HttpException(
        'Sendgrid chưa được bật. Vui lòng đặt SENDGRID_ENABLED="true" trong file .env.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      sendgridApiKey: apiKey,
      sendgridEnabled: enabled,
      sendgridFromEmail: fromEmail,
      sendgridFromName: fromName,
    };
  }

  getPasswordResetTemplateId(): string | null {
    const templateId =
      process.env.SENDGRID_PASSWORD_RESET_TEMPLATE_ID ||
      this.configService.get<string>("SENDGRID_PASSWORD_RESET_TEMPLATE_ID");
    return templateId || null;
  }

  private getHeaders(apiKey: string): Record<string, string> {
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async sendEmail(
    request: ISendgridSendEmailRequest,
  ): Promise<ISendgridSendEmailResponse> {
    const settings = this.getSettings();
    const maskedApiKey = settings.sendgridApiKey
      ? `${settings.sendgridApiKey.slice(0, 6)}...${settings.sendgridApiKey.slice(-4)}`
      : "missing";

    this.logger.log("[Sendgrid] sendEmail start", {
      templateId: request.templateId,
      to: request.to,
      maskedApiKey,
      enabled: settings.sendgridEnabled,
      fromEmail: settings.sendgridFromEmail,
      fromName: settings.sendgridFromName,
    });

    const recipients = Array.isArray(request.to) ? request.to : [request.to];
    const fromEmail = request.from?.email || settings.sendgridFromEmail;
    const fromName = request.from?.name || settings.sendgridFromName;

    const emailData: any = {
      from: {
        email: fromEmail,
        name: fromName,
      },
      personalizations: recipients.map((to) => ({
        to: [{ email: to }],
        dynamic_template_data: request.dynamicTemplateData || {},
      })),
      template_id: request.templateId,
      tracking_settings: {
        click_tracking: {
          enable: false,
        },
        open_tracking: {
          enable: false,
        },
      },
    };

    this.logger.debug("[Sendgrid] prepared payload", {
      emailData,
      headers: {
        Authorization: `Bearer ${maskedApiKey}`,
        "Content-Type": "application/json",
      },
      baseUrl: this.baseUrl,
    });

    try {
      this.logger.log("[Sendgrid] calling /mail/send", {
        url: `${this.baseUrl}/mail/send`,
      });
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/mail/send`,
        emailData,
        {
          headers: this.getHeaders(settings.sendgridApiKey),
          timeout: 15000,
        },
      );

      if (response.status === 202) {
        this.logger.log("[Sendgrid] sendEmail success", {
          status: response.status,
          messageId: response.headers["x-message-id"],
        });
        return {
          statusCode: 202,
          message: "Email đã được gửi thành công",
          messageId: response.headers["x-message-id"] as string,
        };
      }

      throw new HttpException(
        "Phản hồi không hợp lệ từ Sendgrid API",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error: any) {
      const errorData = error?.response?.data;
      const errorMessages = errorData?.errors || [];
      const errorMessage =
        errorMessages.length > 0
          ? errorMessages.map((e: any) => e.message).join(", ")
          : errorData?.message ||
            error?.message ||
            "Lỗi khi gửi email qua Sendgrid";

      const statusCode =
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const isCreditsError =
        typeof errorMessage === "string" &&
        (errorMessage.toLowerCase().includes("maximum credits exceeded") ||
          errorMessage.toLowerCase().includes("credits")) &&
        statusCode === 401;

      this.logger.error("[Sendgrid] sendEmail failed", {
        status: statusCode,
        message: errorMessage,
        responseData: errorData,
        requestData: {
          to: recipients,
          templateId: request.templateId,
          from: fromEmail,
        },
        isCreditsError,
      });

      logError("Sendgrid sendEmail error", {
        status: statusCode,
        message: errorMessage,
        responseData: errorData,
        requestData: {
          to: recipients,
          templateId: request.templateId,
          from: fromEmail,
        },
        isCreditsError,
      });

      if (isCreditsError) {
        logError("Sendgrid sendEmail - Credits exceeded", error);
        throw new HttpException(
          "Sendgrid đã hết credits. Vui lòng nạp thêm credits trong Sendgrid dashboard.",
          HttpStatus.PAYMENT_REQUIRED,
        );
      }

      logError("Sendgrid sendEmail", error);
      throw new HttpException(errorMessage, statusCode);
    }
  }
}
