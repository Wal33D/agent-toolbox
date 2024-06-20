import axios from 'axios';
import { VercelRequest } from '@vercel/node';

const GRAPH_API_URL = 'https://graph.facebook.com/v19.0';
const fallbackToNumber = '+12695010475'; // Fallback number
const { GRAPH_API_TOKEN } = process.env;

export const sendWhatsAppMessage = async (request: VercelRequest) => {
	let { to, body } = request.body;

	// Use fallback number if 'to' is not provided
	to = to || fallbackToNumber;
	if (!body) {
		throw new Error('Missing required parameter: body');
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
	} catch (error: any) {
		console.error('Error sending message:', error.response ? error.response.data : error.message);
		throw new Error(`Error sending message: ${error.response ? error.response.data : error.message}`);
	}
};
