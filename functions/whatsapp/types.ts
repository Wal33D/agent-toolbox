export interface WhatsAppMessageResponse {
	status: boolean;
	messaging_product: string;
	wa_message_id?: string;
	phone?: string;
	wa_id?: string;
	message: string;
}

export interface WhatsAppApiResponse {
	messages?: Array<{ id: string }>;
	contacts?: Array<{ input: string; wa_id: string }>;
}

export interface WhatsAppMessageRequestBody {
	to?: string;
	body: string;
}
