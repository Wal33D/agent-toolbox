import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { speechConfig } from '../../utils/azureSpeechConfig';
import { cloudinaryConfig } from '../../utils/cloudinaryConfig';
import { promises as fsPromises, createReadStream } from 'fs';
import { AudioConfig, SpeechSynthesizer, ResultReason, SpeechSynthesisOutputFormat } from 'microsoft-cognitiveservices-speech-sdk';

const initializeSynthesizer = (filePath: string): SpeechSynthesizer => {
	if (!global.speechSynthesizer) {
		const audioConfig = AudioConfig.fromAudioFileOutput(filePath);
		global.speechSynthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
	}
	return global.speechSynthesizer as SpeechSynthesizer;
};

export const textToAudioFile = async ({ body }: { body: any }): Promise<any> => {
	const startTime = Date.now();
	const { text } = body;

	if (!text?.trim()) {
		throw new Error('Text to convert cannot be empty.');
	}

	const uploadFolderName = 'ai_upload_text_to_speech';
	const filePath = path.join(uploadFolderName, `${uuidv4()}.mp3`);

	speechConfig.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3;

	const synthesizer = initializeSynthesizer(filePath);
	let response: any = { success: false, timestamp: new Date(), duration: `${Date.now() - startTime} ms` };

	try {
		// Synthesize speech to audio file
		await new Promise<void>((resolve, reject) => {
			synthesizer.speakTextAsync(
				text,
				result => {
					if (result.reason === ResultReason.SynthesizingAudioCompleted) {
						resolve();
					} else {
						reject(new Error(result.errorDetails));
					}
				},
				error => reject(new Error(error))
			);
		});

		// Upload the file to Cloudinary
		const cloudinaryResult = await new Promise<any>((resolve, reject) => {
			const uploadStream = cloudinaryConfig.uploader.upload_stream({ folder: uploadFolderName, resource_type: 'auto' }, (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
			createReadStream(filePath).pipe(uploadStream);
		});
		const baseUrl = cloudinaryResult.secure_url.replace('.mp3', '');
		const urls = {
			original: cloudinaryResult.secure_url,
			mp3: `${baseUrl}.mp3`,
			aac: `${baseUrl}.aac`,
			ogg: `${baseUrl}.ogg`,
			wav: `${baseUrl}.wav`,
		};
		response = {
			success: true,
			urls,
			timestamp: new Date(),
			duration: `${Date.now() - startTime} ms`,
		};
	} catch (error: any) {
		response.error = error.message;
	} finally {
		try {
			await fsPromises.unlink(filePath);
		} catch (cleanupError) {
			// Cleanup errors are non-critical
		}
		return response;
	}
};
