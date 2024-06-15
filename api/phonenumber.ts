import { VercelRequest, VercelResponse } from '@vercel/node';
import { parsePhoneNumber, validatePhoneNumberLength } from 'libphonenumber-js';
import { parseQueryParams } from '../utils/parseQueryParams';

interface PhoneNumberRequest {
	number: string;
	country?: string;
}

interface PhoneNumberResponse {
	country?: string;
	number: string;
	isValid: boolean;
	isPossible: boolean;
	internationalFormat?: string;
	nationalFormat?: string;
	uri?: string;
	validationError?: string;
}

const handler = async (request: VercelRequest, response: VercelResponse) => {
	if (request.method === 'OPTIONS') {
		const interfaceDescription = {
			description: 'This endpoint parses, validates, and formats phone numbers using the libphonenumber-js package.',
			requiredParams: {
				number: 'Phone number string (required)',
				country: 'Country code string (optional)',
			},
			demoBody: [
				{
					number: '8 (800) 555-35-35',
					country: 'RU',
				},
				{
					number: '+12133734253',
				},
			],
			demoResponse: [
				{
					country: 'RU',
					number: '+78005553535',
					isValid: true,
					isPossible: true,
					internationalFormat: '+7 800 555 35 35',
					nationalFormat: '8 (800) 555-35-35',
					uri: 'tel:+78005553535',
				},
				{
					country: 'US',
					number: '+12133734253',
					isValid: true,
					isPossible: true,
					internationalFormat: '+1 213 373 4253',
					nationalFormat: '(213) 373-4253',
					uri: 'tel:+12133734253',
				},
			],
		};

		return response.status(200).json(interfaceDescription);
	}

	try {
		let requests: PhoneNumberRequest[];

		if (request.method === 'GET') {
			requests = [parseQueryParams(request.query) as PhoneNumberRequest];
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

		const results: PhoneNumberResponse[] = requests.map(req => {
			const { number, country }: any = req;

			try {
				const phoneNumber = parsePhoneNumber(number, country);
				const validationError = validatePhoneNumberLength(number, country);

				return {
					country: phoneNumber?.country,
					number: phoneNumber?.number,
					isValid: phoneNumber?.isValid() || false,
					isPossible: phoneNumber?.isPossible() || false,
					internationalFormat: phoneNumber?.formatInternational(),
					nationalFormat: phoneNumber?.formatNational(),
					uri: phoneNumber?.getURI(),
					validationError: validationError || undefined,
				};
			} catch (error) {
				return {
					number,
					isValid: false,
					isPossible: false,
					validationError: error.message,
				};
			}
		});

		return response.status(200).json({
			status: true,
			message: 'Phone number information retrieved successfully.',
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
