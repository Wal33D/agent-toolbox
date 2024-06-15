import axios from 'axios';
import { VercelRequest } from '@vercel/node';
import { getNextEnvKey } from 'envholster';
import { parseQueryParams } from '../../utils/parseQueryParams';
import { GEOCODE, StreetAddress, ZipCode } from './openWeatherFunction';

export interface LocationInput extends StreetAddress, ZipCode, GEOCODE {}

const fetchWeatherData = async ({ city, state, country, zipCode, lat, lon }: any) => {
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

	const weatherApiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
		location
	)}?unitGroup=metric&include=days&key=${weatherApiKey}&contentType=json`;

	const weatherResponse = await axios.get(weatherApiUrl);
	return weatherResponse.data;
};

const getDayOfWeek = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const convertToImperial = (tempCelsius: number) => {
	return parseFloat((tempCelsius * (9 / 5) + 32).toFixed(2));
};

const createDescriptionString = (day: any) => {
	return `On ${day.dayOfWeek} (${day.date}), the weather will be ${day.conditions.toLowerCase()}. The temperature will range from ${
		day.minTempC
	}°C (${day.minTempF}°F) to ${day.maxTempC}°C (${day.maxTempF}°F), with an average of ${day.avgTempC}°C (${
		day.avgTempF
	}°F). Expect ${day.conditions.toLowerCase()}, with a wind speed of ${day.windSpeed} km/h coming from ${day.windDir}°. The precipitation is ${
		day.precipitation
	} mm, humidity is ${day.humidity}%`;
};

const organizeWeatherData = (data: any) => {
	const { resolvedAddress, days } = data;
	const organizedData = days.map((day: any) => {
		const dayData = {
			dayOfWeek: getDayOfWeek(day.datetime),
			date: day.datetime,
			maxTempC: day.tempmax,
			minTempC: day.tempmin,
			avgTempC: day.temp,
			maxTempF: convertToImperial(day.tempmax),
			minTempF: convertToImperial(day.tempmin),
			avgTempF: convertToImperial(day.temp),
			windSpeed: day.windspeed,
			windDir: day.winddir,
			precipitation: day.precip,
			humidity: day.humidity,
			conditions: day.conditions,
		};
		return {
			...dayData,
			detailedDescription: createDescriptionString(dayData),
		};
	});

	return {
		location: resolvedAddress,
		forecast: organizedData,
	};
};

const getVisualWeatherData = async (locationInput: any) => {
	const { city, state, country, zipCode, lat, lon } = locationInput;

	if (
		(!city && !state && !zipCode && (lat === undefined || lon === undefined)) ||
		((city || state || zipCode) && (lat !== undefined || lon !== undefined))
	) {
		throw new Error('Provide either city/state, zip code, or lat/lon, not multiple or neither.');
	}

	const weatherData = await fetchWeatherData({ city, state, country, zipCode, lat, lon });
	const organizedWeatherData = organizeWeatherData(weatherData);

	return organizedWeatherData;
};

export const getVisualWeather = async (request: VercelRequest) => {
	try {
		let requestBody: any;

		if (request.method === 'GET') {
			requestBody = parseQueryParams(request.query);
		} else {
			requestBody = request.body;

			if (!Array.isArray(requestBody) && typeof requestBody !== 'object') {
				throw new Error('Request body must be an object or an array of objects');
			}
		}

		const processRequest = async (locationInput: any) => {
			const { city, state, country, zipCode, lat, lon } = locationInput;

			if (
				(!city && !state && !zipCode && (lat === undefined || lon === undefined)) ||
				((city || state || zipCode) && (lat !== undefined || lon !== undefined))
			) {
				throw new Error('Provide either city/state, zip code, or lat/lon, not multiple or neither.');
			}

			const weatherData = await getVisualWeatherData({ city, state, country, zipCode, lat, lon });
			return weatherData;
		};

		if (Array.isArray(requestBody)) {
			const weatherDataArray = await Promise.all(requestBody.map(processRequest));
			return {
				status: true,
				data: weatherDataArray,
			};
		} else {
			const weatherData = await processRequest(requestBody);
			return {
				status: true,
				data: weatherData,
			};
		}
	} catch (error) {
		return {
			status: true,
			data: null,
			error: error.message,
		};
	}
};
