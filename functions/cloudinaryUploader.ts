import axios from 'axios';
import { VercelRequest } from '@vercel/node';
import { getToken } from '../utils/getToken';

interface UploadRequest {
	url?: string;
	fileBuffer?: string;
	fileName?: string;
	cloudinaryAssetFolder?: string;
	imageStream?: string;
}

interface UploadResponse {
	message: string;
	result?: any;
	fileName?: string;
	fileAlreadyExists?: boolean;
	error?: string;
	details?: string;
}

export const cloudinaryUpload = async (request: VercelRequest): Promise<UploadResponse> => {
	try {
		let uploadRequest: UploadRequest;

		if (request.method === 'GET') {
			uploadRequest = request.query as unknown as UploadRequest;
		} else if (request.method === 'POST') {
			uploadRequest = request.body as UploadRequest;
		} else {
			return {
				message: 'Invalid request method',
			};
		}

		if (!uploadRequest.url && !uploadRequest.fileBuffer && !uploadRequest.imageStream) {
			return {
				message: 'Missing required fields',
			};
		}

		const token = await getToken();

		const response = await axios.post('https://cloudinary.aquataze.com', uploadRequest, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return response.data;
	} catch (error: any) {
		return {
			message: 'Failed to upload image',
			error: error.message,
			details: error.response?.data || '',
		};
	}
};
