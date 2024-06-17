import { parseQueryParams } from '../utils/parseQueryParams';
import { handleWeatherOptions } from '../functions/handleWeatherOptions';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { IPAddressLookUp } from './ip'; // Import the IP address lookup function
import {
	getTodaysTemp,
	getTodaysFeelslike,
	getTodaysHumidity,
	getTodaysDew,
	getTodaysPrecip,
	getTodaysPrecipProb,
	getTodaysSnow,
	getTodaysSnowDepth,
	getTodaysWindspeed,
	getTodaysWinddir,
	getTodaysPressure,
	getTodaysVisibility,
	getTodaysCloudcover,
	getTodaysSolarradiation,
	getTodaysUvindex,
	getTodaysConditions,
	getTodaysIcon,
	getTodaysSunrise,
	getTodaysSunset,
	getTodaysWeather,
	getTodaysWeatherDescription,
	fetchTodaysWeatherData,
} from '../functions/todaysWeather';
import {
	fetchWeeklyWeatherData,
	getWeeklyAvgHumidity,
	getWeeklyAvgMaxTempC,
	getWeeklyAvgMaxTempF,
	getWeeklyAvgMinTempC,
	getWeeklyAvgMinTempF,
	getWeeklyAvgTempC,
	getWeeklyAvgTempF,
	getWeeklyAvgWindDir,
	getWeeklyAvgWindSpeed,
	getWeeklyConditions,
	getWeeklyHighTempC,
	getWeeklyHighTempF,
	getWeeklyLowTempC,
	getWeeklyLowTempF,
	getWeeklyForecast,
	getWeeklyTotalPrecipitation,
	getWeeklyForecastDescription,
} from '../functions/weeklyWeather';

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

const handler = async (request: VercelRequest, response: VercelResponse) => {
	try {
		let locations: any[] = [];
		let functionName: string | null = null;

		if (request.method === 'OPTIONS') {
			return handleWeatherOptions(response);
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
