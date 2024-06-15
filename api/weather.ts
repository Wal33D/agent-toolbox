import { getOpenWeather } from '../functions/weather/openWeatherFunction';
import { getVisualWeather } from '../functions/weather/visualWeatherFunction';
import { parseQueryParams } from '../utils/parseQueryParams';
import { VercelRequest, VercelResponse } from '@vercel/node';

const handler = async (request: VercelRequest, response: VercelResponse) => {
	try {
		let locations: any[] = [];

		if (request.method === 'OPTIONS') {
			const interfaceDescription = {
				description: 'This endpoint retrieves weather information based on address, zip code, or geo-coordinates (lat, lon).',
				requiredParams: {
					zipCode: 'Zip code (optional)',
					lat: 'Latitude (optional)',
					lon: 'Longitude (optional)',
					city: 'City name (optional)',
					state: 'State code (optional)',
					country: 'Country code (required if city is provided)',
					source: 'Data source (optional, "openweather" or "visualweather")',
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
					{
						lat: 42.201,
						lon: -85.5806,
						source: 'openweather',
					},
					{
						state: 'Michigan',
						city: 'Portage',
						source: 'visualweather',
					},
				],
				demoResponse: {
					status: true,
					message: 'Weather data retrieved successfully.',
					data: [
						{
							location: 'Austin, TX, 78741, US',
							forecast: [
								{
									dayOfWeek: 'Monday',
									date: '2024-06-10',
									maxTempC: 35,
									minTempC: 22,
									avgTempC: 28,
									maxTempF: 95,
									minTempF: 71.6,
									avgTempF: 82.4,
									windSpeed: 10,
									windDir: 180,
									precipitation: 0,
									humidity: 40,
									conditions: 'Clear',
									detailedDescription:
										'On Monday (2024-06-10), the weather in Austin, TX will be clear. The temperature will range from 22°C (71.6°F) to 35°C (95°F), with an average of 28°C (82.4°F). Expect clear skies, with a wind speed of 10 km/h coming from 180°. The precipitation is 0 mm, humidity is 40%.',
								},
							],
						},
					],
				},
			};

			return response.status(200).json(interfaceDescription);
		}

		if (request.method === 'GET') {
			locations = [parseQueryParams(request.query) as any];
		} else if (request.method === 'POST') {
			locations = Array.isArray(request.body) ? request.body : [request.body];
		} else {
			throw new Error('Invalid request method');
		}

		const processRequest = async (locationInput: any) => {
			const { city, state, zipCode, lat, lon, source } = locationInput;

			if (!city && !state && !zipCode && (lat === undefined || lon === undefined)) {
				throw new Error('Provide either city/state, zip code, or lat/lon, not multiple or neither.');
			}

			if (source === 'openweather') {
				return await getOpenWeather(request);
			} else {
				return await getVisualWeather(request);
			}
		};

		if (Array.isArray(locations)) {
			const weatherDataArray = await Promise.all(locations.map(processRequest));
			response.status(200).json(weatherDataArray);
		} else {
			const weatherData = await processRequest(locations[0]);
			response.status(200).json(weatherData);
		}
	} catch (error: any) {
		response.status(400).json({ error: error.message });
	}
};

export default handler;
