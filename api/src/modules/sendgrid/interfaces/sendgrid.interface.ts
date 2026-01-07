export interface ISendgridSettings {
  sendgridApiKey: string;
  sendgridEnabled: string;
  sendgridFromEmail: string;
  sendgridFromName: string;
}

export interface ISendgridSendEmailRequest {
  to: string | string[];
  templateId: string;
  from?: {
    email?: string;
    name?: string;
  };
  dynamicTemplateData?: Record<string, any>;
}

export interface ISendgridSendEmailResponse {
  statusCode: number;
  message: string;
  messageId?: string;
}
