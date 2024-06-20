import { VercelRequest } from '@vercel/node';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

export const sendTextMessage = async (request: VercelRequest) => {
	const { to, body } = request.body;

	if (!to || !body) {
		throw new Error('Missing required parameters: to, body');
	}

	try {
		const message = await client.messages.create({
			body,
			from: twilioPhoneNumber,
			to,
		});
		return {
			status: 'success',
			message: 'Message sent successfully',
			data: message,
		};
	} catch (error) {
		return {
			status: 'error',
			message: error.message,
		};
	}
};
