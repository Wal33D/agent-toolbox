import axios from 'axios';
import { VercelRequest } from '@vercel/node';
import { parseQueryParams } from '../../utils/parseQueryParams';
import { ImageResult, ImageSearchOptions, ImageSearchResponse } from './searchGoogleTypes';

const fetchImages = async (options: ImageSearchOptions, apiKey: string): Promise<ImageResult[]> => {
	const params: Record<string, string> = {
		api_key: apiKey,
		q: options.searchTerm,
		search_type: 'images',
	};

	if (options.size) {
		params.image_size = options.size;
	}

	const response = await axios.get('https://api.scaleserp.com/search', { params });

	return (response.data.image_results || []).map((result: any) => ({
		url: result.image || result.link,
		width: result.width || 0,
		height: result.height || 0,
	}));
};

export const googleImageSearch = async (request: VercelRequest): Promise<ImageSearchResponse> => {
	try {
		const apiKey = process.env.SCALE_SERP_API_KEY;
		if (!apiKey) {
			throw new Error('SCALE_SERP_API_KEY environment variable is not set');
		}

		let requestBody: ImageSearchOptions[];

		if (request.method === 'GET') {
			requestBody = [parseQueryParams(request.query) as ImageSearchOptions];
		} else if (request.method === 'POST') {
			requestBody = Array.isArray(request.body) ? request.body : [request.body];
		} else {
			return {
				status: false,
				message: 'Invalid request method',
				data: [],
			};
		}

		if (requestBody.length > 50) {
			return {
				status: false,
				message: 'Too many requests. Please provide 50 or fewer requests in a single call.',
				data: [],
			};
		}

		const results: ImageResult[][] = await Promise.all(
			requestBody.map(async options => {
				if (!options.searchTerm) {
					throw new Error('Search term is required');
				}

				const images = await fetchImages(options, apiKey);
				return images;
			})
		);

		return {
			status: true,
			message: 'Images retrieved successfully.',
			data: results,
		};
	} catch (error: unknown) {
		return {
			status: false,
			message: `Error: ${(error as Error).message}`,
			data: [],
		};
	}
};

export default googleImageSearch;
