import { parseQueryParams } from '../utils/parseQueryParams';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveLocation, LocationInput, LocationOutput } from '../functions/resolveLocation';

const handler = async (request: VercelRequest, response: VercelResponse) => {
	try {
		let locations: LocationInput[] = Array.isArray(request.body) ? request.body : [request.body];

		if (request.method === 'OPTIONS') {
			const interfaceDescription = {
				description: 'This endpoint resolves location details based on address, zip code, or geo-coordinates (lat, lon).',
				requiredParams: {
					zipCode: 'Zip code (optional)',
					lat: 'Latitude (optional)',
					lon: 'Longitude (optional)',
					city: 'City name (optional)',
					state: 'State code (optional)',
					country: 'Country code (required if city is provided)',
				},
				demoBody: [
					{
						zipCode: '78741',
					},
					{
						lat: 42.201,
						lon: -85.5806,
					},
					{
						city: 'Portage',
						state: 'MI',
						country: 'US',
					},
				],
				demoResponse: {
					status: true,
					message: 'Location resolved successfully.',
					locations: [
						{
							address: 'Austin, TX, 78741, US',
							zipCode: '78741',
							lat: 30.2295,
							lon: -97.7207,
							city: 'Austin',
							state: 'TX',
							country: 'US',
						},
						{
							address: 'Portage, MI, 49002, US',
							zipCode: '49002',
							lat: 42.201,
							lon: -85.5806,
							city: 'Portage',
							state: 'MI',
							country: 'US',
						},
					],
				},
				message:
					'To use this endpoint, provide an array of locations with at least one of zip code, lat/lon, or city and country parameters in the request body.',
			};

			return response.status(200).json(interfaceDescription);
		}
		if (request.method === 'GET') {
			locations = [parseQueryParams(request.query)];
		} else if (request.method === 'POST') {
			locations = Array.isArray(request.body) ? request.body : [request.body];
		}

		if (locations.length > 50) {
			return response.status(400).json({
				data: {
					status: false,
					message: 'Too many locations requested. Please provide 50 or fewer locations in a single request.',
					locations: [],
				},
			});
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

		return response.status(200).json({
			data: {
				status: true,
				message: 'Locations resolved successfully.',
				locations: results,
			},
		});
	} catch (error: any) {
		return response.status(500).json({
			data: {
				status: false,
				message: `Error: ${error.message}`,
				locations: [],
			},
		});
	}
};

export default handler;
