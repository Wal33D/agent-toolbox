import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { getNextEnvKey } from 'envholster';
import { parseQueryParams } from '../utils/parseQueryParams';

interface SerpSearchRequest {
	q: string;
	location?: string;
	hl?: string;
	gl?: string;
	device?: string;
	num?: number;
	max_page?: number;
	include_html?: string;
	output?: string;
	include_answer_box?: string;
	time_period?: string;
}

const handler = async (request: VercelRequest, response: VercelResponse) => {
	if (request.method === 'OPTIONS') {
		const interfaceDescription = {
			description: 'This endpoint performs a SERP search using the Scale SERP API.',
			requiredParams: {
				q: 'Search query (required)',
				location: 'Location (optional)',
				hl: 'Host language (optional)',
				gl: 'Geolocation (optional)',
				device: 'Device type (optional)',
				num: 'Number of search results (optional)',
				max_page: 'Maximum pages to fetch (optional)',
				include_html: 'Include HTML in results (optional)',
				output: 'Output format (optional, default: json)',
				include_answer_box: 'Include answer box in results (optional)',
				time_period: 'Time period for results (optional)',
			},
			demoBody: [
				{
					q: 'Birria Tacos',
					location: 'Austin, Texas',
					hl: 'en',
					gl: 'us',
					device: 'desktop',
					num: '3',
					max_page: '2',
					include_html: 'true',
					output: 'json',
					include_answer_box: 'true',
					time_period: 'last_week',
				},
				{
					q: 'Best Coffee Shops',
					location: 'New York, NY',
					hl: 'en',
					gl: 'us',
					device: 'mobile',
					num: '5',
					max_page: '3',
					include_html: 'false',
					output: 'json',
					include_answer_box: 'false',
					time_period: 'last_month',
				},
			],
			demoResponse: {
				status: true,
				message: 'SERP search results retrieved successfully.',
				data: [
					{
						searchQuery: 'Birria Tacos',
						results: {
							/* SERP results here */
						},
					},
					{
						searchQuery: 'Best Coffee Shops',
						results: {
							/* SERP results here */
						},
					},
				],
			},
			message: 'To use this endpoint, provide search parameters in the request body or as query parameters.',
		};

		return response.status(200).json(interfaceDescription);
	}

	try {
		const { key: apiKey } = await getNextEnvKey({ baseEnvName: 'SCALE_SERP_API_KEY_' });

		let requests: SerpSearchRequest[];

		if (request.method === 'GET') {
			requests = [parseQueryParams(request.query) as SerpSearchRequest];
		} else if (request.method === 'POST') {
			requests = Array.isArray(request.body) ? request.body : [request.body];
		} else {
			throw new Error('Invalid request method');
		}

		if (requests.length > 50) {
			return response.status(400).json({
				status: false,
				message: 'Too many requests. Please provide 50 or fewer requests in a single call.',
				data: [],
			});
		}

		const results = await Promise.all(
			requests.map(async req => {
				const params = {
					api_key: apiKey,
					q: req.q,
					location: req.location || '',
					hl: req.hl || 'en',
					gl: req.gl || 'us',
					device: req.device || 'desktop',
					num: req.num || 1,
					max_page: req.max_page || 1,
					include_html: req.include_html || 'false',
					output: req.output || 'json',
					include_answer_box: req.include_answer_box || 'false',
					time_period: req.time_period || '',
				};

				try {
					const response = await axios.get('https://api.scaleserp.com/search', { params });
					return {
						searchQuery: req.q,
						results: response.data,
					};
				} catch (error) {
					throw new Error(`Failed to retrieve results for query "${req.q}": ${error.message}`);
				}
			})
		);

		return response.status(200).json({
			status: true,
			message: 'SERP search results retrieved successfully.',
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
