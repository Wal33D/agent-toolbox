import axios from 'axios';
import { getNextEnvKey } from 'envholster';
import { parseQueryParams } from '../utils/parseQueryParams';
import { VercelRequest, VercelResponse } from '@vercel/node';

export interface StreetAddress {
	city?: string;
	state?: string;
	country?: string;
}

export interface ZipCode {
	zipCode?: string;
}

export interface GEOCODE {
	lat?: number;
	lon?: number;
}

export interface LocationInput extends StreetAddress, ZipCode, GEOCODE {}

const fetchSolarData = async ({ city, state, country, zipCode, lat, lon }: any) => {
	const { key: weatherApiKey } = await getNextEnvKey({
		baseEnvName: 'VISUAL_CROSSING_WEATHER_API_KEY_',
	});

	let location;
	if (lat !== undefined && lon !== undefined) {
		location = `${lat},${lon}`;
	} else if (city && state) {
		country = country || 'US';
		location = `${city},${state},${country}`;
	} else if (zipCode) {
		location = zipCode;
	} else {
		throw new Error('Either city/state, zip code, or lat/lon must be provided');
	}

	const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
		location
	)}?unitGroup=metric&include=days&key=${weatherApiKey}&contentType=json`;

	const response = await axios.get(apiUrl);
	return response.data;
};

const getDayOfWeek = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const convertTo12HourFormat = (timeString: string) => {
	const [hour, minute, second] = timeString.split(':');
	const hourInt = parseInt(hour, 10);
	const period = hourInt >= 12 ? 'PM' : 'AM';
	const hour12 = hourInt % 12 || 12;
	return `${hour12}:${minute}:${second} ${period}`;
};

const organizeSolarData = (data: any) => {
	const { resolvedAddress, days } = data;
	const organizedData = days.map((day: any) => {
		return {
			dayOfWeek: getDayOfWeek(day.datetime),
			date: day.datetime,
			sunrise: {
				military: day.sunrise,
				standard: convertTo12HourFormat(day.sunrise),
			},
			sunset: {
				military: day.sunset,
				standard: convertTo12HourFormat(day.sunset),
			},
		};
	});

	return {
		location: resolvedAddress,
		forecast: organizedData,
	};
};

export const getSolarDataByLocation = async (locationInput: any) => {
	const { city, state, country, zipCode, lat, lon } = locationInput;

	if (
		(!city && !state && !zipCode && (lat === undefined || lon === undefined)) ||
		((city || state || zipCode) && (lat !== undefined || lon !== undefined))
	) {
		throw new Error('Provide either city/state, zip code, or lat/lon, not multiple or neither.');
	}

	const data = await fetchSolarData({ city, state, country, zipCode, lat, lon });
	const organizedData = organizeSolarData(data);

	return organizedData;
};

const handler = async (request: VercelRequest, response: VercelResponse) => {
	if (request.method === 'OPTIONS') {
		const interfaceDescription = {
			description: 'This endpoint provides sunrise and sunset times for a given location.',
			requiredParams: {
				city: 'string (optional)',
				state: 'string (optional)',
				country: 'string (optional, defaults to US)',
				zipCode: 'string (optional)',
				lat: 'number (optional)',
				lon: 'number (optional)',
			},
			demoBody: [
				{
					city: 'Los Angeles',
					state: 'CA',
					country: 'US',
				},
				{
					zipCode: '10001',
				},
				{
					lat: 34.0522,
					lon: -118.2437,
				},
			],
			demoResponse: {
				location: 'Los Angeles, CA, US',
				forecast: [
					{
						dayOfWeek: 'Monday',
						date: '2024-06-10',
						sunrise: {
							military: '05:42:00',
							standard: '5:42:00 AM',
						},
						sunset: {
							military: '20:08:00',
							standard: '8:08:00 PM',
						},
					},
					// Additional days can be listed here
				],
			},
			message: 'To use this endpoint, provide either city/state, zip code, or lat/lon in the request body or as query parameters.',
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
				status: false,
				message: 'Too many requests. Please provide 50 or fewer requests in a single call.',
				data: [],
			});
		}

		const results = await Promise.all(
			requests.map(async locationInput => {
				const { city, state, country, zipCode, lat, lon } = locationInput;

				if (
					(!city && !state && !zipCode && (lat === undefined || lon === undefined)) ||
					((city || state || zipCode) && (lat !== undefined || lon !== undefined))
				) {
					throw new Error('Provide either city/state, zip code, or lat/lon, not multiple or neither.');
				}

				const data = await getSolarDataByLocation({ city, state, country, zipCode, lat, lon });
				return data;
			})
		);

		return response.status(200).json(results);
	} catch (error: any) {
		return response.status(400).json({ error: error.message });
	}
};

export default handler;
