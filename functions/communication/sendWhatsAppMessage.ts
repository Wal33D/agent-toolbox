import axios from 'axios';
import { validateEnv } from '../../utils/validateEnv';
import { SendWhatsAppMessageRequestParams, SendMessageResponse } from './types';

// Check environment when module loads
validateEnv();

export const sendWhatsAppMessage = async (request: SendWhatsAppMessageRequestParams): Promise<SendMessageResponse> => {
	const { WHATSAPP_GRAPH_API_TOKEN, WHATSAPP_GRAPH_API_URL, WHATSAPP_ASSISTANT_PHONE_NUMBER } = process.env;
	const { to, body } = request.body;

	if (!WHATSAPP_GRAPH_API_TOKEN?.trim() || !WHATSAPP_GRAPH_API_URL?.trim() || !WHATSAPP_ASSISTANT_PHONE_NUMBER?.trim()) {
		throw new Error('Error: Missing or invalid configuration. Please contact the administrator.');
	}

	if (!to?.trim()) {
		throw new Error('Error: Missing required parameter: to. Please provide the recipient number.');
	}
	if (!body?.trim()) {
		throw new Error('Error: Missing required parameter: message. Please provide the message content.');
	}

	const platform = 'whatsapp';
	const type = 'text';
	const from = WHATSAPP_ASSISTANT_PHONE_NUMBER;
	const startTimestamp = Date.now();
	const timestamp = new Date();

	let success = false;
	let msgId: string | undefined;
	let error: string | undefined;

	try {
		const { data: response } = await axios.post(
			`${WHATSAPP_GRAPH_API_URL}/364023890121748/messages`,
			{
				messaging_product: platform,
				to,
				type,
				text: { body },
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
		error = `Error sending message: ${err.response ? err.response.data : err.message}. Please ensure the API URL and token are correct.`;
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
