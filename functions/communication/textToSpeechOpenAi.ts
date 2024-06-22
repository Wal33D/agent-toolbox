import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { cloudinaryConfig } from '../../utils/cloudinaryConfig';

const openai = new OpenAI();

export const textToAudioFileOpenai = async (request: any): Promise<{ success: boolean; url?: string; error?: string }> => {
	const { text, voice = 'alloy', outputFormat = 'mp3' } = request.body;

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
