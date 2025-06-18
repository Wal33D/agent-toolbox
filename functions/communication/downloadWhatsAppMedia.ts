import fs from 'fs';
import axios from 'axios';
import OpenAI from 'openai';
import { cloudinaryConfig } from '../../utils/cloudinaryConfig';
import { updateCloudinaryMetadata } from '../../utils/updateCloudinaryMetadata';

const openai = new OpenAI();

interface DownloadWhatsAppMediaParams {
	body: {
		mediaId: string;
		analysisQuality?: string;
	};
}

interface DownloadMediaResponse {
	success: boolean;
	type?: string;
	source?: string;
	id?: string;
	url?: string;
	mime_type?: string;
	sha256?: string;
	file_size?: number;
	width?: number;
	height?: number;
	analysis?: string;
	tags?: string[];
	completionTokens?: number;
	alreadyExists?: boolean;
	error?: string;
	etag?: string;
}

const scaleDownUrlTransform = (url: string): string => {
	const parts = url.split('/upload/');
	return `${parts[0]}/upload/w_500,q_auto:low/${parts[1]}`;
};

export const downloadWhatsAppMedia = async (request: DownloadWhatsAppMediaParams): Promise<DownloadMediaResponse> => {
	const { mediaId, analysisQuality = 'standard' } = request.body;
	const { WHATSAPP_GRAPH_API_TOKEN, WHATSAPP_GRAPH_API_URL } = process.env;

	if (!WHATSAPP_GRAPH_API_TOKEN?.trim() || !WHATSAPP_GRAPH_API_URL?.trim()) {
		throw new Error('Error: Missing or invalid configuration. Please contact the administrator.');
	}

	if (!mediaId?.trim()) {
		throw new Error('Error: Missing required parameter: mediaId. Please provide the media ID.');
	}

	let cloudinaryResult: any;
	let alreadyExists = false;
	const source = 'whatsapp';

	try {
		// Check if the media already exists in Cloudinary
		try {
			cloudinaryResult = await cloudinaryConfig.api.resource(mediaId);
			alreadyExists = true;
		} catch (cloudinaryError) {
			// Media does not exist in Cloudinary, proceed with download and upload
			const { data } = await axios.get(`${WHATSAPP_GRAPH_API_URL}/${mediaId}`, {
				headers: {
					Authorization: `Bearer ${WHATSAPP_GRAPH_API_TOKEN}`,
					'Content-Type': 'application/json',
				},
			});

			const mediaUrl = data.url;
			const { data: mediaData } = await axios.get(mediaUrl, {
				headers: {
					Authorization: `Bearer ${WHATSAPP_GRAPH_API_TOKEN}`,
				},
				responseType: 'stream',
			});

			const filePath = `${mediaId}.${data.mime_type.split('/')[1]}`;
			const writer = fs.createWriteStream(filePath);
			mediaData.pipe(writer);

			await new Promise((resolve, reject) => {
				writer.on('finish', async () => {
					try {
						cloudinaryResult = await new Promise<any>((resolve, reject) => {
							const uploadStream = cloudinaryConfig.uploader.upload_stream(
								{ resource_type: 'auto', public_id: mediaId },
								(error, result) => {
									if (error) {
										reject(error);
									} else {
										resolve(result);
									}
								}
							);
							fs.createReadStream(filePath).pipe(uploadStream);
						});

						fs.unlinkSync(filePath);
						resolve(null);
					} catch (error: any) {
						reject(error);
					}
				});
				writer.on('error', err => reject(err));
			});
		}

		const cloudinaryUrl = cloudinaryResult.secure_url;
		const analysisUrl = analysisQuality === 'detailed' ? cloudinaryUrl : scaleDownUrlTransform(cloudinaryUrl);

		const analysisMessage =
			analysisQuality === 'detailed'
				? 'What’s in this image? Analyze it to the best of your abilities, give an extremely detailed breakdown and explanation and classify the image to the best of your knowledge. Be specific.'
				: 'What’s in this image?';

		const [imageAnalysisResponse, imageTagsResponse] = await Promise.all([
			openai.chat.completions.create({
				model: 'gpt-4o',
				messages: [
					{
						role: 'user',
						content: [
							{ type: 'text', text: analysisMessage },
							{
								type: 'image_url',
								image_url: { url: analysisUrl },
							},
						],
					},
				],
			}),
			openai.chat.completions.create({
				response_format: { type: 'json_object' },
				model: 'gpt-4o',
				messages: [
					{
						role: 'user',
						content: [
							{ type: 'text', text: 'Generate tags for this image in JSON, as many as 10.' },
							{
								type: 'image_url',
								image_url: { url: analysisUrl },
							},
						],
					},
				],
			}),
		]);

		const totalTokens = (imageAnalysisResponse?.usage?.total_tokens || 0) + (imageTagsResponse?.usage?.total_tokens || 0);
		// Update metadata on Cloudinary
		if (!alreadyExists && imageAnalysisResponse.choices[0].message.content && imageTagsResponse.choices[0].message.content) {
			await updateCloudinaryMetadata(
				mediaId,
				imageAnalysisResponse.choices[0].message.content,
				JSON.parse(imageTagsResponse.choices[0].message.content as string).tags
			);
		}

		return {
			success: true,
			source,
			alreadyExists,
			type: 'image_upload',
			id: mediaId,
			url: cloudinaryUrl,
			mime_type: cloudinaryResult.format,
			file_size: cloudinaryResult.bytes,
			width: cloudinaryResult.width,
			height: cloudinaryResult.height,
			etag: cloudinaryResult.etag,
			completionTokens: totalTokens || undefined,
			analysis: imageAnalysisResponse.choices[0].message.content || undefined,
			tags: JSON.parse(imageTagsResponse.choices[0].message.content as string).tags || undefined,
		};
	} catch (err: any) {
		return {
			success: false,
			error: `Error downloading media: ${err.response ? err.response.data : err.message}. Please ensure the API URL and token are correct.`,
		};
	}
};
