import { GmailMailer } from 'gmail-node-mailer';
import { validateEnv } from '../../utils/validateEnv';
import { encodeEmailContent, EncodingType } from '../../utils/encodeEmailContent';
import { SendEmailMessageRequestParams, SendMessageResponse } from './types';

// Ensure required environment variables are set when the module is imported
validateEnv();

export const sendEmail = async (request: SendEmailMessageRequestParams): Promise<SendMessageResponse> => {
	const { to, body, from, subject } = request.body;

	const defaultSenderName = process.env.GMAIL_MAILER_ASSISTANT_NAME;
	if (!defaultSenderName?.trim()) {
		throw new Error('Error: Missing or invalid GMAIL_MAILER_ASSISTANT_NAME in environment variables.');
	}

	const senderName = from?.trim() || defaultSenderName;

	if (!to?.trim()) {
		throw new Error('Error: Missing required parameter: to. Please provide the recipient email.');
	}
	if (!body?.trim()) {
		throw new Error('Error: Missing required parameter: body. Please provide the email content.');
	}

	const platform = 'gmail';
	const type = 'email';
	const startTimestamp = Date.now();
	const timestamp = new Date();

	let success = false;
	let error: string | undefined;
	let msgId: string | undefined;

	if (!global.gmailClient) {
		const mailer = new GmailMailer();
		try {
			await mailer.initializeClient({});
			global.gmailClient = mailer;
		} catch (err: any) {
			error = `Error initializing mailer client: ${err.message}`;
			const duration = `${Date.now() - startTimestamp} ms`;
			return {
				success,
				platform,
				type,
				to,
				from: senderName,
				msgId,
				duration,
				timestamp,
				error,
			};
		}
	}

	const gmailClient = global.gmailClient as GmailMailer;

	try {
		const encodedSubjectResponse = encodeEmailContent({ content: subject ?? '', type: EncodingType.Subject });
		if (!encodedSubjectResponse.isEncoded) {
			throw new Error(`Error encoding subject: ${encodedSubjectResponse.message}`);
		}
		const encodedSubject = encodedSubjectResponse.encodedContent;

		const result = await gmailClient.sendEmail({
			recipientEmail: to,
			senderName,
			subject: encodedSubject,
			message: body,
		});

		if (result.sent) {
			success = true;
			msgId = result.gmailResponse.data.id;
		} else {
			throw new Error(result.message);
		}
	} catch (err: any) {
		error = `Error sending email: ${err.message}. Please check the Gmail service account credentials and the recipient email.`;
	} finally {
		const duration = `${Date.now() - startTimestamp} ms`;
		return {
			success,
			platform,
			type,
			to,
			from: senderName,
			msgId,
			duration,
			timestamp,
			error,
		};
	}
};
