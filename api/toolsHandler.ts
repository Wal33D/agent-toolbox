import { getLocationData } from '../functions/locationResolver/location';
import { IPAddressLookUp } from '../functions/ip/ip';
import { parseQueryParams } from '../utils/parseQueryParams';
import { handleToolOptions } from '../functions/handleToolOptions';
import { takeScreenshotAndUpload } from '../functions/screenshot/getWebsiteScreenshot';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getTodaysWeather, fetchTodaysWeatherData } from '../functions/weather/todaysWeather';
import { fetchWeeklyWeatherData, getWeeklyForecast, getWeeklyForecastDescription } from '../functions/weather/weeklyWeather';

const handler = async (request: VercelRequest, response: VercelResponse) => {
	try {
		let locations: any[] = [];
		let functionName: string | null = null;

		if (request.method === 'OPTIONS') {
			return handleToolOptions(response);
		}

		if (request.method === 'GET') {
			const queryParams = parseQueryParams(request.query) as any;
			locations = [queryParams];
			functionName = queryParams.functionName || null;
		} else if (request.method === 'POST') {
			const body = Array.isArray(request.body) ? request.body : [request.body];
			locations = body;
			functionName = body[0].functionName || null;
		} else {
			throw new Error('Invalid request method');
		}

		const processRequest = async (locationInput: any) => {
			let data;

			if (functionName === 'IPAddressLookUp') {
				return await IPAddressLookUp(locationInput.ip);
			} else if (functionName === 'locationResolver') {
				return await getLocationData(request);
			} else if (functionName === 'getWebsiteScreenshot') {
				return await takeScreenshotAndUpload(request);
			} else if (functionName && (functionName.startsWith('getTodays') || functionName.startsWith('getCurrent'))) {
				data = await fetchTodaysWeatherData(locationInput);
				if (!data.currentWeather) {
					throw new Error('Current weather data is not available.');
				}
			} else {
				data = await fetchWeeklyWeatherData(request, locationInput);
				if (!data.forecast) {
					throw new Error('Weekly forecast data is not available.');
				}
			}

			if (functionName && (functionName.startsWith('getTodays') || functionName.startsWith('getCurrent'))) {
				switch (functionName) {
					case 'getTodaysWeather':
						return getTodaysWeather(data);
					case 'getCurrentWeather':
						return getTodaysWeather(data);
					default:
						throw new Error('Invalid function name.');
				}
			} else {
				switch (functionName) {
					case 'getWeeklyForecast':
						return getWeeklyForecast(data);
					case 'getWeeklyForecastDescription':
						return getWeeklyForecastDescription(data);
					default:
						throw new Error('Invalid function name.');
				}
			}
		};

		if (Array.isArray(locations) && locations.length > 1) {
			const dataArray = await Promise.all(locations.map(processRequest));
			response.status(200).json(dataArray);
		} else {
			const weatherData = await processRequest(locations[0]);
			response.status(200).json(weatherData);
		}
	} catch (error: any) {
		response.status(400).json({ error: error.message });
	}
};

export default handler;
