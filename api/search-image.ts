import { VercelRequest, VercelResponse } from '@vercel/node';
import gis from 'g-i-s';
import { parseQueryParams } from '../utils/parseQueryParams';

interface ImageSearchOptions {
	searchTerm: string;
	queryStringAddition?: string;
	filterOutDomains?: string[];
	size?: string;
}

interface ImageResult {
	url: string;
	width: number;
	height: number;
}

const imageSearch = (options: ImageSearchOptions): Promise<ImageResult[]> => {
	if (options.size) {
		const sizeMap: { [key: string]: string } = {
			small: 'isz:i,s',
			medium: 'isz:m',
			large: 'isz:l',
			icon: 'isz:i',
		};
		if (sizeMap[options.size]) {
			options.queryStringAddition = `${options.queryStringAddition || ''}&${sizeMap[options.size]}`;
		}
	}

	return new Promise((resolve, reject) => {
		gis(options, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});
};

const handler = async (request: VercelRequest, response: VercelResponse) => {
	if (request.method === 'OPTIONS') {
		const interfaceDescription = {
			description: 'This endpoint retrieves images based on a search term using the g-i-s package.',
			requiredParams: {
				searchTerm: 'string (required)',
				queryStringAddition: 'string (optional)',
				filterOutDomains: 'string[] (optional)',
				size: 'string (optional, one of "small", "medium", "large", "icon")',
			},
			demoBody: [
				{
					searchTerm: 'cats',
					size: 'large',
				},
				{
					searchTerm: 'dogs',
					queryStringAddition: '&tbs=ic:trans',
					filterOutDomains: ['pinterest.com', 'deviantart.com'],
					size: 'medium',
				},
			],
			demoResponse: [
				{
					url: 'https://i.ytimg.com/vi/mW3S0u8bj58/maxresdefault.jpg',
					width: 1280,
					height: 720,
				},
				{
					url: 'https://i.ytimg.com/vi/tntOCGkgt98/maxresdefault.jpg',
					width: 1600,
					height: 1200,
				},
			],
		};

		return response.status(200).json(interfaceDescription);
	}

	try {
		let requestBody: ImageSearchOptions[];

		if (request.method === 'GET') {
			requestBody = [parseQueryParams(request.query) as ImageSearchOptions];
		} else if (request.method === 'POST') {
			requestBody = Array.isArray(request.body) ? request.body : [request.body];
		} else {
			throw new Error('Invalid request method');
		}

		if (requestBody.length > 50) {
			return response.status(400).json({
				status: false,
				message: 'Too many requests. Please provide 50 or fewer requests in a single call.',
				data: [],
			});
		}

		const results = await Promise.all(
			requestBody.map(async options => {
				if (!options.searchTerm) {
					throw new Error('Search term is required');
				}

				const images = await imageSearch(options);
				return images;
			})
		);

		return response.status(200).json({
			status: true,
			message: 'Images retrieved successfully.',
			data: results,
		});
	} catch (error: any) {
		return response.status(500).json({
			status: false,
			message: `Error: ${error.message}`,
		});
	}
};

export default handler;
