import gis from 'g-i-s';

import { VercelRequest } from '@vercel/node';
import { parseQueryParams } from '../../utils/parseQueryParams';
import { ImageResult, ImageSearchOptions, ImageSearchResponse } from './searchGoogleTypes';

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
		gis(options, (error: any, results: any) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});
};

export const googleImageSearch = async (request: VercelRequest): Promise<ImageSearchResponse> => {
	try {
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

				const images = await imageSearch(options);
				return images;
			})
		);

		return {
			status: true,
			message: 'Images retrieved successfully.',
			data: results,
		};
	} catch (error: any) {
		return {
			status: false,
			message: `Error: ${error.message}`,
			data: [],
		};
	}
};

export default googleImageSearch;
