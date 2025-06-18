import { VercelRequest } from '@vercel/node';
import { resolveLocation } from './resolveLocation';
import { LocationInput, LocationOutput } from '../../types/location';

export const getLocationData = async (request: VercelRequest): Promise<any> => {
	try {
		let locations: LocationInput[] = Array.isArray(request.body) ? request.body : [request.body];

		if (request.method === 'POST') {
			locations = Array.isArray(request.body) ? request.body : [request.body];
		}

		if (locations.length > 50) {
			return {
				status: false,
				message: 'Too many locations requested. Please provide 50 or fewer locations in a single request.',
				locations: [],
			};
		}

		const results: LocationOutput[] = [];

		for (const location of locations) {
			const locationInput: LocationInput = {
				zipCode: location.zipCode ? String(location.zipCode) : undefined,
				lat: location.lat ? parseFloat(String(location.lat)) : undefined,
				lon: location.lon ? parseFloat(String(location.lon)) : undefined,
				city: location.city ? String(location.city) : undefined,
				state: location.state ? String(location.state) : undefined,
				country: location.country ? String(location.country) : undefined,
			};

			const locationOutput = await resolveLocation(locationInput);
			results.push(locationOutput);
		}

		return {
			status: true,
			message: 'Locations resolved successfully.',
			locations: results,
		};
	} catch (error: any) {
		return {
			status: false,
			message: `Error: ${error.message}`,
			locations: [],
		};
	}
};
