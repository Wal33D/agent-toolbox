import axios from 'axios';
import { ensureEnv } from '../../utils/validateEnv';

// Validate WhatsApp environment variables on import
ensureEnv();

interface RequestWhatsAppLocationParams {
	body: {
		to: string;
		text: string;
	};
}

interface RequestLocationMessageResponse {
	success: boolean;
	msgId?: string;
	platform: string;
	type: string;
	to: string;
	from: string;
	duration: string;
	timestamp: Date;
	error?: string;
}

export const requestWhatsAppLocation = async (request: RequestWhatsAppLocationParams): Promise<RequestLocationMessageResponse> => {
	const { WHATSAPP_GRAPH_API_TOKEN, WHATSAPP_GRAPH_API_URL, WHATSAPP_ASSISTANT_PHONE_NUMBER, WHATSAPP_PHONE_ID } = process.env;
	const { to, text } = request.body;

	if (
		!WHATSAPP_GRAPH_API_TOKEN?.trim() ||
		!WHATSAPP_GRAPH_API_URL?.trim() ||
		!WHATSAPP_PHONE_ID?.trim() ||
		!WHATSAPP_ASSISTANT_PHONE_NUMBER?.trim()
	) {
		throw new Error('Error: Missing or invalid configuration. Please contact the administrator.');
	}

	if (!to?.trim()) {
		throw new Error('Error: Missing required parameter: to. Please provide the recipient number.');
	}
	if (!text?.trim()) {
		throw new Error('Error: Missing required parameter: text. Please provide the message body text.');
	}

	const platform = 'whatsapp';
	const type = 'interactive';
	const from = WHATSAPP_ASSISTANT_PHONE_NUMBER;
	const startTimestamp = Date.now();
	const timestamp = new Date();

	let success = false;
	let msgId: string | undefined;
	let error: string | undefined;

	try {
		const { data: response } = await axios.post(
			`${WHATSAPP_GRAPH_API_URL}/${WHATSAPP_PHONE_ID}/messages`,
			{
				messaging_product: platform,
				recipient_type: 'individual',
				to,
				type,
				interactive: {
					type: 'location_request_message',
					body: {
						text,
					},
					action: {
						name: 'send_location',
					},
				},
			},
			{
				headers: {
					Authorization: `Bearer ${WHATSAPP_GRAPH_API_TOKEN}`,
					'Content-Type': 'application/json',
				},
			}
		);

		success = true;
		msgId = response.messages?.[0]?.id;
	} catch (err: any) {
		error = `Error sending location request message: ${
			err.response ? err.response.data : err.message
		}. Please ensure the API URL and token are correct.`;
	} finally {
		const duration = `${Date.now() - startTimestamp} ms`;
		return {
			success,
			platform,
			type,
			to,
			from,
			msgId,
			duration,
			timestamp,
			error,
		};
	}
};
