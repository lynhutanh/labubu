import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as sgMail from "@sendgrid/mail";

@Injectable()
export class EmailService {
  private fromEmail: string;
  private fromName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>("email.apiKey");
    if (apiKey && apiKey !== "SG.....") {
      sgMail.setApiKey(apiKey);
    }
    this.fromEmail = process.env.FROM_EMAIL || "noreply@labubu.com";
    this.fromName = process.env.FROM_NAME || "Labubu Store";
  }

  async sendEmail(data: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    try {
      const msg = {
        to: data.to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: data.subject,
        text: data.text || data.subject,
        html: data.html,
      };

      await sgMail.send(msg);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async sendResetPasswordEmail(
    email: string,
    resetLink: string,
    userName?: string,
  ): Promise<void> {
    const subject = "Reset Your Password - Labubu Store";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Labubu Store</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          <p>Hello${userName ? ` ${userName}` : ""},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #667eea; word-break: break-all; font-size: 14px;">${resetLink}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Labubu Store. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }
}
