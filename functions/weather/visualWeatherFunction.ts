import axios from 'axios';
import { VercelRequest } from '@vercel/node';
import { getNextEnvKey } from 'envholster';

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

const getDayOfWeek = (epoch: number, timezone: string) => {
	const date = new Date(epoch * 1000);
	return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone });
};

const convertToImperial = (tempCelsius: number) => {
	return Math.round(tempCelsius * (9 / 5) + 32);
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
	const { resolvedAddress, days, timezone } = data;
	const organizedData = days.map((day: any) => {
		const dayData = {
			date: day.datetime,
			dayOfWeek: getDayOfWeek(day.datetimeEpoch, timezone),
			maxTempC: Math.round(day.tempmax),
			minTempC: Math.round(day.tempmin),
			avgTempC: Math.round(day.temp),
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
			description: createDescriptionString(dayData),
		};
	});

	return {
		location: resolvedAddress,
		forecast: organizedData,
	};
};

export const getVisualWeather = async (request: VercelRequest) => {
	try {
		let requestBody: any;

		requestBody = request.body;

		if (!Array.isArray(requestBody) && typeof requestBody !== 'object') {
			throw new Error('Request body must be an object or an array of objects');
		}

		const processRequest = async (locationInput: any) => {
			const { city, state, country, zipCode, lat, lon } = locationInput;

			if (
				(!city && !state && !zipCode && (lat === undefined || lon === undefined)) ||
				((city || state || zipCode) && (lat !== undefined || lon !== undefined))
			) {
				throw new Error('Provide either city/state, zip code, or lat/lon, not multiple or neither.');
			}

			const weatherData = await fetchWeatherData({ city, state, country, zipCode, lat, lon });
			return organizeWeatherData(weatherData);
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
