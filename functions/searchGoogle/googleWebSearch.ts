import axios from 'axios';
import { parseQueryParams } from '../../utils/parseQueryParams';
import { SerpSearchRequest, WebSearchResponse, WebSearchResult } from './searchGoogleTypes';
import { VercelRequest } from '@vercel/node';

// Environment variables are validated at application startup

export const searchGoogle = async (request: VercelRequest): Promise<WebSearchResponse> => {
	try {
		const apiKey = process.env.SCALE_SERP_API_KEY;
		if (!apiKey) {
			throw new Error('SCALE_SERP_API_KEY environment variable is not set');
		}

		let requests: SerpSearchRequest[];

		if (request.method === 'GET') {
			requests = [parseQueryParams(request.query) as SerpSearchRequest];
		} else if (request.method === 'POST') {
			requests = Array.isArray(request.body) ? request.body : [request.body];
		} else {
			throw new Error('Invalid request method');
		}

		if (requests.length > 50) {
			return {
				status: false,
				message: 'Too many requests. Please provide 50 or fewer requests in a single call.',
				data: [],
			};
		}

		const results: WebSearchResult[] = await Promise.all(
			requests.map(async req => {
				const params: any = {
					api_key: apiKey,
					q: req.searchTerm,
					location: req.location || '',
					hl: req.hostLanguage || 'en',
					gl: req.geolocation || 'us',
					device: req.device || 'desktop',
					num: req.numberOfResults ? req.numberOfResults.toString() : '4',
					max_page: req.max_page || '1',
					include_html: req.include_html || 'false',
					output: req.output || 'json',
					include_answer_box: req.include_answer_box || 'false',
					time_period: req.time_period || '',
				};

				try {
					const response = await axios.get('https://api.scaleserp.com/search', { params });
					const { organic_results } = response.data;
					const { engine_url, json_url } = response.data.search_metadata.pages[0];

					// Filter out the unwanted fields
					const filteredResults = organic_results.map((result: any) => {
						const { prerender, page, position, position_overall, block_position, ...filteredResult } = result;
						return filteredResult;
					});

					return {
						searchQuery: req.searchTerm,
						organic_results: filteredResults,
						searchUrl: engine_url,
						metaDataUrl: json_url,
					};
				} catch (error: any) {
					throw new Error(`Failed to retrieve results for query "${req.searchTerm}": ${error.message}`);
				}
			})
		);

		if (results.length === 1) {
			return {
				status: true,
				message: 'SERP search result retrieved successfully.',
				data: results[0],
			};
		}

		return {
			status: true,
			message: 'SERP search results retrieved successfully.',
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
