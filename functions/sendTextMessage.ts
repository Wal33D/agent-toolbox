import { VercelRequest } from '@vercel/node';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

interface SendTextMessageResponse {
	status: string;
	message: string;
	sent: boolean | string;
	to: string;
	messaging_product: string;
}

export const sendTextMessage = async (request: VercelRequest): Promise<SendTextMessageResponse> => {
	const { to, body } = request.body;

	let response: SendTextMessageResponse = {
		status: 'error',
		message: 'An unknown error occurred',
		sent: false,
		to: '',
		messaging_product: 'twilio_sms',
	};

	if (!to || !body) {
		response.message = 'Error: Missing required parameters: to, body. Please provide both the recipient number and the message content.';
		response.to = to || '';
		return response;
	}

	try {
		const message = await client.messages.create({
			body,
			from: twilioPhoneNumber,
			to,
		});

		response = {
			status: 'success',
			message: `Message sent successfully to ${to}. Message SID: ${message.sid}, Status: ${message.status}.`,
			sent: message.status,
			to,
			messaging_product: 'twilio_sms',
		};
	} catch (error: any) {
		response = {
			status: 'error',
			message: `Error sending message: ${error.message}. Please check the Twilio credentials and the recipient number.`,
			sent: false,
			to,
			messaging_product: 'twilio_sms',
		};
	} finally {
		console.log('Return value:', response);
		return response;
	}
};
