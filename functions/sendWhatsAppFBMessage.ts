import axios from 'axios';
import { VercelRequest } from '@vercel/node';

const GRAPH_API_URL = 'https://graph.facebook.com/v19.0';
const { GRAPH_API_TOKEN, PRIMARY_USER_WHATSAPP_NUMBER } = process.env;

interface WhatsAppMessageResponse {
	status: boolean;
	response: any;
	message: string;
}

export const sendWhatsAppMessage = async (request: VercelRequest): Promise<WhatsAppMessageResponse> => {
	let { to, body } = request.body;

	// Use fallback number if 'to' is not provided
	to = to || (PRIMARY_USER_WHATSAPP_NUMBER as string);
	if (!body) {
		return {
			status: false,
			response: null,
			message: 'Missing required parameter: body',
		};
	}

	try {
		const response = await axios.post(
			`${GRAPH_API_URL}/364023890121748/messages`,
			{
				messaging_product: 'whatsapp',
				to: to,
				type: 'text',
				text: {
					body,
				},
			},
			{
				headers: {
					Authorization: `Bearer ${GRAPH_API_TOKEN}`,
					'Content-Type': 'application/json',
				},
			}
		);
		console.log('Message sent successfully:', response.data);
		return {
			status: true,
			response: response.data,
			message: 'Message sent successfully',
		};
	} catch (error: any) {
		console.error('Error sending message:', error.response ? error.response.data : error.message);
		return {
			status: false,
			response: error.response ? error.response.data : null,
			message: `Error sending message: ${error.response ? error.response.data : error.message}`,
		};
	}
};
