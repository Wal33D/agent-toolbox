import axios from 'axios';
import { VercelRequest } from '@vercel/node';
import { WhatsAppMessageResponse, WhatsAppMessageRequestBody, WhatsAppApiResponse } from './types';

const messaging_product = 'whatsapp';
const { GRAPH_API_TOKEN, GRAPH_API_URL, PRIMARY_USER_WHATSAPP_NUMBER } = process.env;

export const sendWhatsAppMessage = async ({ body }: VercelRequest): Promise<WhatsAppMessageResponse> => {
	const { to, body: messageBody }: WhatsAppMessageRequestBody = body;
	const recipient = to || PRIMARY_USER_WHATSAPP_NUMBER;

	let status = false;
	let wa_message_id: string | undefined;
	let phone: string | undefined;
	let wa_id: string | undefined;
	let message = '';

	if (!messageBody) {
		message = 'Error: Missing required parameter: body. Please provide the message content.';
		return { status, message, messaging_product };
	}

	try {
		const apiResponse = await axios.post(
			`${GRAPH_API_URL}/364023890121748/messages`,
			{
				messaging_product,
				to: recipient,
				type: 'text',
				text: { body: messageBody },
			},
			{
				headers: {
					Authorization: `Bearer ${GRAPH_API_TOKEN}`,
					'Content-Type': 'application/json',
				},
			}
		);

		status = true;
		const response: WhatsAppApiResponse = apiResponse.data;
		wa_message_id = response.messages?.[0]?.id;
		phone = response.contacts?.[0]?.input;
		wa_id = response.contacts?.[0]?.wa_id;
		message = `Message sent successfully to ${recipient}. Message ID: ${wa_message_id}, Phone: ${phone}, WhatsApp ID: ${wa_id}.`;
	} catch (error: any) {
		message = `Error sending message: ${error.response ? error.response.data : error.message}. Please ensure the API URL and token are correct.`;
	} finally {
		return {
			status,
			messaging_product,
			wa_message_id,
			phone,
			wa_id,
			message,
		} as WhatsAppMessageResponse;
	}
};
