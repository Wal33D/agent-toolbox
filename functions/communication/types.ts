export interface SendMessageResponse {
	success: boolean;
	platform: string;
	type: string;
	to?: string;
	from?: string;
	msgId?: string;
	timestamp: Date;
	duration: string;
	error?: string;
}

interface SendMessageRequestParams {
	body: {
		to: string;
		url?: string;
		body: string;
		from?: string;
		subject?: string;
	};
}

export interface SendWhatsAppMessageRequestParams extends SendMessageRequestParams {}

export interface SendTextMessageRequestParams extends SendMessageRequestParams {}

export interface SendEmailMessageRequestParams extends SendMessageRequestParams {}
export interface SendWhatsAppDocumentRequestParams extends SendMessageRequestParams {}
