import axios from 'axios';
import cheerio from 'cheerio';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { parseQueryParams } from '../utils/parseQueryParams';

interface ScrapeRequestBody {
	url: string;
}

const handler = async (request: VercelRequest, response: VercelResponse) => {
	if (request.method === 'OPTIONS') {
		const interfaceDescription = {
			description: 'This endpoint scrapes a webpage and returns its text content.',
			requiredParams: {
				url: 'The URL of the webpage to scrape (required)',
			},
			demoBody: [
				{
					url: 'https://example.com',
				},
			],
			demoResponse: {
				status: true,
				message: 'Webpage text content retrieved successfully.',
				data: 'Example Domain...',
			},
		};

		return response.status(200).json(interfaceDescription);
	}

	try {
		let requests: ScrapeRequestBody[];

		if (request.method === 'GET') {
			requests = [parseQueryParams(request.query) as ScrapeRequestBody];
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
			requests.map(async ({ url }) => {
				if (!url) {
					return {
						status: false,
						message: 'URL is required',
					};
				}

				try {
					const axiosResponse = await axios.get(url);
					const $ = cheerio.load(axiosResponse.data);
					const textContent = $('body').text().trim();
					return {
						status: true,
						data: textContent,
					};
				} catch (error) {
					return {
						status: false,
						message: `Failed to retrieve content for URL "${url}": ${error.message}`,
					};
				}
			})
		);

		return response.status(200).json({
			status: true,
			message: 'Webpage text content retrieved successfully.',
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
