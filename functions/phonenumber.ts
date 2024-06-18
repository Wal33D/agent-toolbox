import { VercelRequest } from '@vercel/node';
import { parseQueryParams } from '../utils/parseQueryParams';
import { parsePhoneNumber, validatePhoneNumberLength } from 'libphonenumber-js';

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

export const parsePhoneNumberHandler = async (request: VercelRequest): Promise<any> => {
	try {
		let requests: PhoneNumberRequest[];

		if (request.method === 'GET') {
			requests = [parseQueryParams(request.query) as PhoneNumberRequest];
		} else if (request.method === 'POST') {
			requests = Array.isArray(request.body) ? request.body : [request.body];
		} else {
			return {
				status: false,
				message: 'Invalid request method',
			};
		}

		if (requests.length > 50) {
			return {
				status: false,
				message: 'Too many requests. Please provide 50 or fewer requests in a single call.',
				data: [],
			};
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

		return {
			status: true,
			message: 'Phone number information retrieved successfully.',
			data: results,
		};
	} catch (error: any) {
		return {
			status: false,
			message: `Error: ${error.message}`,
		};
	}
};
