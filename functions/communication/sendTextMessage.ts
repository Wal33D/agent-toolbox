import twilio from 'twilio';
import { SendTextMessageRequestParams, SendMessageResponse } from './types';

export const sendTextMessage = async (request: SendTextMessageRequestParams): Promise<SendMessageResponse> => {
	const { TWILIO_ASSISTANT_PHONE_NUMBER, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

	if (!TWILIO_ACCOUNT_SID?.trim() || !TWILIO_AUTH_TOKEN?.trim() || !TWILIO_ASSISTANT_PHONE_NUMBER?.trim()) {
		throw new Error('Error: Missing or invalid configuration. Please contact the administrator.');
	}

	const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
	const { to, body } = request.body;

	if (!to?.trim()) {
		throw new Error('Error: Missing required parameter: to. Please provide the recipient number.');
	}
	if (!body?.trim()) {
		throw new Error('Error: Missing required parameter: message. Please provide the message content.');
	}

	const platform = 'twilio';
	const type = 'text';
	const from = TWILIO_ASSISTANT_PHONE_NUMBER;
	const startTimestamp = Date.now();
	const timestamp = new Date();

	let success = false;
	let msgId: string | undefined;
	let error: string | undefined;

	try {
		const twilioResponse = await client.messages.create({
			body,
			from,
			to,
		});

		if (twilioResponse.status !== 'undelivered' && twilioResponse.status !== 'failed') {
			success = true;
		}

		msgId = twilioResponse.sid;
	} catch (err: any) {
		error = `Error sending message: ${err.message}. Please check the Twilio credentials and the recipient number.`;
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
