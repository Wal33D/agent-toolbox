import axios from 'axios';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { cloudinaryConfig } from '../../utils/cloudinaryConfig';
import { SendWhatsAppMessageRequestParams, SendMessageResponse } from './types';

const openai = new OpenAI();

// Function to convert text to audio and upload it
export const textToAudioFileOpenai = async (
	text: string,
	voice: any = 'alloy',
	outputFormat = 'mp3'
): Promise<{ success: boolean; url?: string; error?: string }> => {
	if (!text) {
		return { success: false, error: 'Missing required parameter: text' };
	}

	const filePath = path.join(__dirname, `speech.${outputFormat}`);

	try {
		// Generate spoken audio from input text
		const audioResponse = await openai.audio.speech.create({
			model: 'tts-1',
			voice: voice,
			input: text,
		});

		// Convert the response to a buffer
		const buffer = Buffer.from(await audioResponse.arrayBuffer());

		// Save the buffer to a file
		await fs.promises.writeFile(filePath, buffer);

		// Upload the file to Cloudinary
		const cloudinaryResult = await new Promise<any>((resolve, reject) => {
			const uploadStream = cloudinaryConfig.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
			fs.createReadStream(filePath).pipe(uploadStream);
		});

		// Clean up the temporary file
		fs.unlinkSync(filePath);

		// Return the Cloudinary URL
		return { success: true, url: cloudinaryResult.secure_url };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
};

// Function to send WhatsApp message with an attachment
export const sendWhatsAppVoiceMessage = async (request: SendWhatsAppMessageRequestParams): Promise<SendMessageResponse> => {
const {
       WHATSAPP_GRAPH_API_TOKEN,
       WHATSAPP_GRAPH_API_URL,
       WHATSAPP_ASSISTANT_PHONE_NUMBER,
       WHATSAPP_PHONE_ID,
} = process.env;
	const { to, body } = request.body;

if (
       !WHATSAPP_GRAPH_API_TOKEN?.trim() ||
       !WHATSAPP_GRAPH_API_URL?.trim() ||
       !WHATSAPP_PHONE_ID?.trim() ||
       !WHATSAPP_ASSISTANT_PHONE_NUMBER?.trim()
) {
       throw new Error('Error: Missing or invalid configuration. Please contact the administrator.');
}

	if (!to?.trim()) {
		throw new Error('Error: Missing required parameter: to. Please provide the recipient number.');
	}

	const audioResult = await textToAudioFileOpenai(body);

	if (!audioResult.success || !audioResult.url) {
		throw new Error(`Error in text to audio conversion: ${audioResult.error}`);
	}

	// Modify the file extension to .aac
	const audioUrl = audioResult.url.replace(/\.\w+$/, '.aac');

	const platform = 'whatsapp';
	const type = 'audio';
	const from = WHATSAPP_ASSISTANT_PHONE_NUMBER;
	const startTimestamp = Date.now();
	const timestamp = new Date();

	let success = false;
	let msgId: string | undefined;
	let error: string | undefined;

	try {
               const { data: response } = await axios.post(
                       `${WHATSAPP_GRAPH_API_URL}/${WHATSAPP_PHONE_ID}/messages`,
			{
				messaging_product: platform,
				recipient_type: 'individual',
				to,
				type,
				audio: {
					link: audioUrl,
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
		error = `Error sending message: ${err.response ? err.response.data : err.message}. Please ensure the API URL and token are correct.`;
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
