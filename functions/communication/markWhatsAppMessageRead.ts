import axios from 'axios';

interface MarkWhatsAppMessageReadRequestParams {
	body: {
		messageId: string;
	};
}

interface MarkMessageReadResponse {
	success: boolean;
	messageId: string;
	duration: string;
	timestamp: Date;
	error?: string;
}

export const markWhatsAppMessageRead = async (request: MarkWhatsAppMessageReadRequestParams): Promise<MarkMessageReadResponse> => {
	const { WHATSAPP_GRAPH_API_TOKEN, WHATSAPP_GRAPH_API_URL } = process.env;
	const { messageId } = request.body;

	if (!WHATSAPP_GRAPH_API_TOKEN?.trim() || !WHATSAPP_GRAPH_API_URL?.trim()) {
		throw new Error('Error: Missing or invalid configuration. Please contact the administrator.');
	}

	if (!messageId?.trim()) {
		throw new Error('Error: Missing required parameter: messageId. Please provide the message ID.');
	}

	const startTimestamp = Date.now();
	const timestamp = new Date();

	let success = false;
	let error: string | undefined;

	try {
		await axios.post(
			`${WHATSAPP_GRAPH_API_URL}/364023890121748/messages`,
			{
				messaging_product: 'whatsapp',
				status: 'read',
				message_id: messageId,
			},
			{
				headers: {
					Authorization: `Bearer ${WHATSAPP_GRAPH_API_TOKEN}`,
					'Content-Type': 'application/json',
				},
			}
		);

		success = true;
	} catch (err: any) {
		error = `Error marking message as read: ${err.response ? err.response.data : err.message}. Please ensure the API URL and token are correct.`;
	} finally {
		const duration = `${Date.now() - startTimestamp} ms`;
		return {
			success,
			messageId,
			duration,
			timestamp,
			error,
		};
	}
};
