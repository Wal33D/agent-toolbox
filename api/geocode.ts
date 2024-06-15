import NodeGeocoder from 'node-geocoder';
import { parseQueryParams } from '../utils/parseQueryParams';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize NodeGeocoder with Google as the provider
const geocoder = NodeGeocoder({
	provider: 'google',
	apiKey: process.env.GOOGLE_API_KEY, // replace with your Google API key
});

export const handler = async (request: VercelRequest, response: VercelResponse) => {
	if (request.method === 'OPTIONS') {
		const interfaceDescription = {
			description: 'This endpoint retrieves geolocation information based on an address or zip code using the Google Geocoding API.',
			requiredParams: {
				address: 'The address to geocode (optional)',
				zipCode: 'The zip code to geocode (optional)',
			},
			demoBody: [
				{
					address: '1600 Amphitheatre Parkway, Mountain View, CA',
				},
				{
					zipCode: '94043',
				},
			],
			demoResponse: {
				status: true,
				data: [
					{
						latitude: 37.4224764,
						longitude: -122.0842499,
						formattedAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
						country: 'United States',
						city: 'Mountain View',
						state: 'California',
						zipcode: '94043',
					},
				],
			},
		};

		return response.status(200).json(interfaceDescription);
	}

	try {
		let requests: any[];

		if (request.method === 'GET') {
			requests = [parseQueryParams(request.query)];
		} else if (request.method === 'POST') {
			requests = Array.isArray(request.body) ? request.body : [request.body];
		} else {
			throw new Error('Invalid request method');
		}

		if (requests.length > 50) {
			return response.status(400).json({
				data: {
					status: false,
					message: 'Too many requests. Please provide 50 or fewer requests in a single call.',
					geocodes: [],
				},
			});
		}

		const results: any[] = [];

		for (const req of requests) {
			const { address, zipCode } = req;

			if (!address && !zipCode) {
				results.push({
					status: false,
					message: 'Address or zip code is required in the query or body parameters.',
					address,
					zipCode,
				});
				continue;
			}

			const location = address || zipCode;
			const geocodeResult = await geocoder.geocode(location);

			if (!geocodeResult.length) {
				results.push({
					status: false,
					message: 'Unable to find the location.',
					address,
					zipCode,
				});
			} else {
				results.push({
					status: true,
					data: geocodeResult,
				});
			}
		}

		return response.status(200).json({
			status: true,
			message: 'Geocode requests processed successfully.',
			geocodes: results,
		});
	} catch (error: any) {
		return response.status(500).json({
			status: false,
			message: `Error: ${error.message}`,
		});
	}
};

export default handler;
