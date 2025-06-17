import fs from 'fs';
import path from 'path';
import axios from 'axios';
import stream from 'stream';
import OpenAI from 'openai';
import { promisify } from 'util';
import { cloudinaryConfig as cloudinary } from '../../utils/cloudinaryConfig';

const openai = new OpenAI();
const pipeline = promisify(stream.pipeline);

interface ListenToWhatsAppVoiceAudioParams {
	body: {
		mediaId: string;
	};
}

export const listenToWhatsAppVoiceAudio = async (request: ListenToWhatsAppVoiceAudioParams): Promise<any> => {
	const { mediaId } = request.body;

	try {
		const { data: mediaData } = await axios.get(`${process.env.WHATSAPP_GRAPH_API_URL}/${mediaId}`, {
			headers: {
				Authorization: `Bearer ${process.env.WHATSAPP_GRAPH_API_TOKEN}`,
				'Content-Type': 'application/json',
			},
		});

		const mediaUrl = mediaData.url;
		const { data: mediaStream } = await axios.get(mediaUrl, {
			headers: {
				Authorization: `Bearer ${process.env.WHATSAPP_GRAPH_API_TOKEN}`,
			},
			responseType: 'stream',
		});

		const uploadResult: any = await new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream({ folder: 'ai_temp_audio', resource_type: 'auto' }, (error, result) => {
				if (error) {
					reject(new Error('Cloudinary upload failed'));
				} else {
					resolve(result);
				}
			});
			pipeline(mediaStream, uploadStream).catch(reject);
		});

		if (!uploadResult || !uploadResult.url) {
			throw new Error('Upload result is invalid');
		}

		const filePath = path.join('temp_audio_file.mp3');
		const audioUrl = uploadResult.secure_url;

		const { data: audioStream } = await axios.get(audioUrl, {
			responseType: 'stream',
		});

		await new Promise<void>((resolve, reject) => {
			const writer = fs.createWriteStream(filePath);
			audioStream.pipe(writer);
			writer.on('finish', resolve);
			writer.on('error', reject);
		});

		const transcription = await openai.audio.transcriptions.create({
			file: fs.createReadStream(filePath),
			model: 'whisper-1',
		});

		fs.unlinkSync(filePath);
		cloudinary.uploader.destroy(uploadResult.public_id);

		return `Please respond with a WhatsApp Voice message, the user says : "${transcription.text}"`;
	} catch (error: any) {
		return {
			success: false,
			message: error.message,
		};
	}
};
