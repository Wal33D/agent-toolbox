import { Readable } from 'stream';
import { VercelRequest } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';

// Environment variables are validated at application startup

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadRequest {
	url?: string;
	base64?: string;
	stream?: Readable;
	fileName?: string;
	cloudinaryAssetFolder?: string;
}

interface UploadResponse {
	message: string;
	result?: any;
	fileName?: string;
	error?: string;
	details?: string;
}

const uploadSingleToCloudinary = async (uploadRequest: UploadRequest): Promise<UploadResponse> => {
	const { url, base64, stream, fileName, cloudinaryAssetFolder } = uploadRequest;

	if (!url && !base64 && !stream) {
		return { message: 'Missing required fields' };
	}

	const options: any = { folder: cloudinaryAssetFolder || 'serverlessUpload' };
	if (fileName) {
		options.public_id = fileName;
	}

	try {
		let result: any;
		if (base64) {
			result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64}`, options);
		} else if (url) {
			result = await cloudinary.uploader.upload(url, options);
		} else if (stream) {
			result = await new Promise((resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
					if (error) reject(error);
					else resolve(result);
				});
				stream.pipe(uploadStream);
			});
		}

		return {
			message: 'Image uploaded successfully',
			result,
			fileName: result.public_id,
		};
	} catch (error: any) {
		return {
			message: 'Failed to upload image',
			error: error.message,
			details: error,
		};
	}
};

export const uploadToCloudinary = async (request: VercelRequest): Promise<UploadResponse | UploadResponse[]> => {
	const uploadRequests = Array.isArray(request.body) ? request.body : [request.body];
	const uploadResults = await Promise.all(uploadRequests.map(uploadSingleToCloudinary));
	return Array.isArray(request.body) ? uploadResults : uploadResults[0];
};
