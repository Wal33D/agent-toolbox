import fs from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';
import OpenAI from 'openai';

const openai = new OpenAI();

export const audioFileToText = async (request: any): Promise<{ success: boolean; data?: string; error?: string }> => {
	const { fileUrl } = request.body;

	if (!fileUrl) {
		return { success: false, error: 'Missing required parameter: fileUrl' };
	}

        const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'audio-'));
        const filePath = path.join(tempDir, 'audio.mp3');

	try {
		// Step 1: Download the audio file from the URL
		await new Promise<void>((resolve, reject) => {
			const writer = fs.createWriteStream(filePath);
			https.get(fileUrl, response => {
				response.pipe(writer);
				writer.on('finish', resolve);
				writer.on('error', reject);
			});
		});

		// Step 2: Transcribe the downloaded audio file
		const transcription = await openai.audio.transcriptions.create({
			file: fs.createReadStream(filePath),
			model: 'whisper-1',
		});

		// Step 3: Return the transcription result
		return { success: true, data: transcription.text };
        } catch (error: any) {
                return { success: false, error: error.message };
        } finally {
                // Clean up the temporary file
                await fs.promises.unlink(filePath).catch(() => undefined);
        }
};
