import axios from 'axios';
import { load } from 'cheerio';
import { VercelRequest } from '@vercel/node';
import { parseQueryParams } from '../../utils/parseQueryParams';

const openaiApiKey = process.env.OPENAI_API_KEY;

interface ScrapeRequestBody {
	url: string;
}

const generateHtmlLandingPage = async (content: string): Promise<string> => {
	const openAiResponse = await axios.post(
		'https://api.openai.com/v1/chat/completions',
		{
			model: 'gpt-4o',
			messages: [
				{
					role: 'system',
					content:
						'You are an AI that generates high-quality single-page landing pages to help sell or market products or services. The HTML should be clean, include inline CSS, and be optimized for user engagement and conversion. The main feature should be a prominent buy button for a single product.',
				},
				{
					role: 'system',
					content:
						'Your task is to create an engaging and visually appealing landing page. Ensure that the HTML is fully renderable and includes necessary elements such as headers, paragraphs, images, and a prominent call-to-action buy button.',
				},
				{
					role: 'user',
					content: `Generate an HTML landing page with the following content that I have scraped from my product/businesses website. Only return the HTML and inline CSS itself, starting with <html>. Ensure it is renderable:\n${content}`,
				},
			],
		},
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${openaiApiKey}`,
			},
		}
	);

	let responseMessage = openAiResponse.data.choices[0].message.content;
	responseMessage = responseMessage
		.replace(/^```html/, '')
		.replace(/```$/, '')
		.trim();
	return responseMessage;
};

export const generateLandingPage = async (request: VercelRequest) => {
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
			return {
				status: false,
				message: 'Too many requests. Please provide 50 or fewer requests in a single call.',
				data: [],
			};
		}

		const results = await Promise.all(
			requests.map(async ({ url }) => {
				if (!url) {
					return { status: false, message: 'URL is required' };
				}
				try {
					const axiosResponse = await axios.get(url);
					const $ = load(axiosResponse.data);
					const textContent = $('body').text().trim();
					const htmlContent = await generateHtmlLandingPage(textContent);
					return { status: true, data: htmlContent };
				} catch (error: any) {
					return { status: false, message: `Failed to retrieve content for URL "${url}": ${error.message}` };
				}
			})
		);

		const successfulResults = results.filter(result => result.status);
		if (successfulResults.length > 0) {
			return { status: true, data: successfulResults[0].data };
		}
		return { status: false, message: 'Failed to generate HTML landing page from provided URLs.', data: results };
	} catch (error: any) {
		return { status: false, message: `Error: ${error.message}` };
	}
};
