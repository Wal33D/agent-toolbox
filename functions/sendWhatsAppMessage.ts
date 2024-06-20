import { VercelRequest } from '@vercel/node';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const fallbackToNumber = '+12695010475'; // Fallback number

export const sendWhatsAppMessage = async (request: VercelRequest) => {
	let { to, body } = request.body;

	// Use fallback number if 'to' is not provided
	to = to || fallbackToNumber;

	if (!body) {
		throw new Error('Missing required parameter: body');
	}

	try {
		const message = await client.messages.create({
			body,
			from: `whatsapp:${twilioWhatsAppNumber}`,
			to: `whatsapp:${to}`,
		});
		return {
			status: 'success',
			message: 'WhatsApp message sent successfully',
			data: message,
		};
	} catch (error) {
		return {
			status: 'error',
			message: error.message,
		};
	}
};
