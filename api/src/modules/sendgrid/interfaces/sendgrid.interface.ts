export interface ISendgridSettings {
    sendgridApiKey: string;
    sendgridEnabled: string;
    sendgridFromEmail: string;
    sendgridFromName: string;
}

export interface ISendgridTemplate {
    id: string;
    name: string;
    generation: string;
    updated_at?: string;
}

export interface ISendgridTemplatesResponse {
    result: ISendgridTemplate[];
}

export enum SendgridTemplatePurpose {
    PASSWORD_RESET = "PASSWORD_RESET",
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

