import axios from 'axios';

interface SendWhatsAppLocationRequestParams {
	body: {
		to: string;
		latitude: string;
		longitude: string;
		name?: string;
		address?: string;
	};
}

interface SendLocationMessageResponse {
	success: boolean;
	msgId?: string;
	platform: string;
	type: string;
	to: string;
	from: string;
	duration: string;
	timestamp: Date;
	error?: string;
}

export const sendWhatsAppLocation = async (request: SendWhatsAppLocationRequestParams): Promise<SendLocationMessageResponse> => {
	const { WHATSAPP_GRAPH_API_TOKEN, WHATSAPP_GRAPH_API_URL, WHATSAPP_ASSISTANT_PHONE_NUMBER } = process.env;
	const { to, latitude, longitude, name, address } = request.body;

	if (!WHATSAPP_GRAPH_API_TOKEN?.trim() || !WHATSAPP_GRAPH_API_URL?.trim() || !WHATSAPP_ASSISTANT_PHONE_NUMBER?.trim()) {
		throw new Error('Error: Missing or invalid configuration. Please contact the administrator.');
	}

	if (!to?.trim()) {
		throw new Error('Error: Missing required parameter: to. Please provide the recipient number.');
	}
	if (!latitude?.trim() || !longitude?.trim()) {
		throw new Error('Error: Missing required parameters: latitude and longitude. Please provide the location coordinates.');
	}

	const platform = 'whatsapp';
	const type = 'location';
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
				recipient_type: 'individual',
				to,
				type,
				location: {
					latitude,
					longitude,
					name,
					address,
				},
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
		error = `Error sending location message: ${err.response ? err.response.data : err.message}. Please ensure the API URL and token are correct.`;
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
