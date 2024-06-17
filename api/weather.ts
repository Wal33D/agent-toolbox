import { parseQueryParams } from '../utils/parseQueryParams';
import { handleWeatherOptions } from '../functions/weather/handleWeatherOptions';
import { VercelRequest, VercelResponse } from '@vercel/node';
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
} from '../functions/weather/todaysWeather';
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
} from '../functions/weather/weeklyWeather';

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

			if (functionName && functionName.startsWith('getTodays')) {
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

			if (functionName && functionName.startsWith('getTodays')) {
				switch (functionName) {
					case 'getTodaysTemp':
						return getTodaysTemp(data, locationInput.unit);
					case 'getCurrentTemp':
						return getTodaysTemp(data, locationInput.unit);
					case 'getTodaysFeelslike':
						return getTodaysFeelslike(data, locationInput.unit);
					case 'getTodaysHumidity':
						return getTodaysHumidity(data);
					case 'getTodaysDew':
						return getTodaysDew(data, locationInput.unit);
					case 'getTodaysPrecip':
						return getTodaysPrecip(data);
					case 'getTodaysPrecipProb':
						return getTodaysPrecipProb(data);
					case 'getTodaysSnow':
						return getTodaysSnow(data);
					case 'getTodaysSnowDepth':
						return getTodaysSnowDepth(data);
					case 'getTodaysWindspeed':
						return getTodaysWindspeed(data);
					case 'getTodaysWinddir':
						return getTodaysWinddir(data);
					case 'getTodaysPressure':
						return getTodaysPressure(data);
					case 'getTodaysVisibility':
						return getTodaysVisibility(data);
					case 'getTodaysCloudcover':
						return getTodaysCloudcover(data);
					case 'getTodaysSolarradiation':
						return getTodaysSolarradiation(data);
					case 'getTodaysUvindex':
						return getTodaysUvindex(data);
					case 'getTodaysConditions':
						return getTodaysConditions(data);
					case 'getTodaysIcon':
						return getTodaysIcon(data);
					case 'getTodaysSunrise':
						return getTodaysSunrise(data);
					case 'getTodaysSunset':
						return getTodaysSunset(data);
					case 'getTodaysWeather':
						return getTodaysWeather(data);
					case 'getTodaysWeatherDescription':
						return getTodaysWeatherDescription(data);
					case 'getCurrentWeather':
						return getTodaysWeather(data);
					case 'getCurrentWeatherDescription':
						return getTodaysWeatherDescription(data);
					default:
						throw new Error('Invalid function name.');
				}
			} else {
				switch (functionName) {
					case 'getWeeklyAvgMaxTempC':
						return getWeeklyAvgMaxTempC(data.forecast);
					case 'getWeeklyAvgMinTempC':
						return getWeeklyAvgMinTempC(data.forecast);
					case 'getWeeklyAvgTempC':
						return getWeeklyAvgTempC(data.forecast);
					case 'getWeeklyAvgMaxTempF':
						return getWeeklyAvgMaxTempF(data.forecast);
					case 'getWeeklyAvgMinTempF':
						return getWeeklyAvgMinTempF(data.forecast);
					case 'getWeeklyAvgTempF':
						return getWeeklyAvgTempF(data.forecast);
					case 'getWeeklyAvgWindSpeed':
						return getWeeklyAvgWindSpeed(data.forecast);
					case 'getWeeklyAvgWindDir':
						return getWeeklyAvgWindDir(data.forecast);
					case 'getWeeklyTotalPrecipitation':
						return getWeeklyTotalPrecipitation(data.forecast);
					case 'getWeeklyAvgHumidity':
						return getWeeklyAvgHumidity(data.forecast);
					case 'getWeeklyConditions':
						return getWeeklyConditions(data.forecast);
					case 'getWeeklyHighTempC':
						return getWeeklyHighTempC(data.forecast);
					case 'getWeeklyLowTempC':
						return getWeeklyLowTempC(data.forecast);
					case 'getWeeklyHighTempF':
						return getWeeklyHighTempF(data.forecast);
					case 'getWeeklyLowTempF':
						return getWeeklyLowTempF(data.forecast);
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
