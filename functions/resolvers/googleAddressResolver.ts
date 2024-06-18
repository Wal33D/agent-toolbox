import NodeGeocoder from 'node-geocoder';
import { VercelRequest } from '@vercel/node';

const geocoder = NodeGeocoder({
	provider: 'google',
	apiKey: process.env.GOOGLE_API_KEY,
});

export const googleAddressResolver = async (request: VercelRequest) => {
	try {
		let address: string;

		if (request.method === 'GET') {
			address = request.query.address as string;
		} else if (request.method === 'POST') {
			address = request.body.address;
		} else {
			return {
				status: false,
				message: 'Invalid request method',
			};
		}

		if (!address) {
			return {
				status: false,
				message: 'Address is required.',
			};
		}

		const geocodeResult = await geocoder.geocode(address);

		if (!geocodeResult.length) {
			return {
				status: false,
				message: 'Unable to find the location.',
			};
		}

		const formattedAddress = geocodeResult[0].formattedAddress;

		return {
			status: true,
			formattedAddress,
		};
	} catch (error: any) {
		return {
			status: false,
			message: `Error: ${error.message}`,
		};
	}
};
