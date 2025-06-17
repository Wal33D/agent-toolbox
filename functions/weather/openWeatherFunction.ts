import axios from 'axios';
import { getNextEnvKey } from 'envholster';
import { LocationOutput } from '../resolvers/locationTypes';
import { resolveLocation } from '../resolvers/resolveLocation';

const fetchWeatherData = async ({ lat, lon, zipCode }: { lat?: number; lon?: number; zipCode?: string }) => {
	const { key: weatherApiKey } = await getNextEnvKey({
		baseEnvName: 'OPEN_WEATHER_API_KEY_',
	});

	let forecastApiUrl: string;

	if (zipCode) {
		forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?zip=${zipCode}&appid=${weatherApiKey}`;
	} else if (lat !== undefined && lon !== undefined) {
		forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`;
	} else {
		throw new Error('Either lat/lon or zipCode must be provided');
	}

	console.log(`Fetching weather data from URL: ${forecastApiUrl}`);
	const forecastResponse = await axios.get(forecastApiUrl);

	return {
		forecastData: forecastResponse.data,
	};
};

const getDayOfWeek = (dateString: string) => {
	const date = new Date(dateString + 'T00:00:00Z');
	return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
};

const convertToImperial = (tempKelvin: number) => {
	const tempCelsius = tempKelvin - 273.15;
	return Math.round(tempCelsius * (9 / 5) + 32);
};

const convertToCelsius = (tempKelvin: number) => {
	return Math.round(tempKelvin - 273.15);
};

const createDescriptionString = (day: any) => {
	return `On ${day.dayOfWeek} (${day.date}), the temperature will range from ${day.minTempC}°C (${day.minTempF}°F) to ${day.maxTempC}°C (${
		day.maxTempF
	}°F), with an average of ${day.avgTempC}°C (${day.avgTempF}°F). Expect ${day.conditions.toLowerCase()}, with a wind speed of ${
		day.windSpeed
	} km/h coming from ${day.windDir}°. The precipitation is ${day.precipitation} mm, humidity is ${day.humidity}%.`;
};

const organizeWeatherData = (data: any, timezoneOffset: number) => {
	const { city, list } = data;
	const seenDates: Set<string> = new Set();
	const organizedData = list
		.filter((entry: any) => {
			const utcDate = new Date(entry.dt * 1000);
			const localDate = new Date(utcDate.getTime() + timezoneOffset * 60 * 1000);
			const date = localDate.toISOString().split('T')[0];
			if (seenDates.has(date)) {
				return false;
			} else {
				seenDates.add(date);
				return true;
			}
		})
		.map((entry: any) => {
			const utcDate = new Date(entry.dt * 1000);
			const localDate = new Date(utcDate.getTime() + timezoneOffset * 60 * 1000);
			const dayData = {
				date: localDate.toISOString().split('T')[0],
				dayOfWeek: getDayOfWeek(localDate.toISOString().split('T')[0]),
				maxTempC: convertToCelsius(entry.main.temp_max),
				minTempC: convertToCelsius(entry.main.temp_min),
				avgTempC: convertToCelsius(entry.main.temp),
				maxTempF: convertToImperial(entry.main.temp_max),
				minTempF: convertToImperial(entry.main.temp_min),
				avgTempF: convertToImperial(entry.main.temp),
				windSpeed: entry.wind.speed,
				windDir: entry.wind.deg,
				precipitation: entry.pop * 100,
				humidity: entry.main.humidity,
				conditions: entry.weather[0].main,
				description: '',
			};
			dayData.description = createDescriptionString(dayData);
			return dayData;
		});

	return {
		location: `${city.name}, ${city.country}`,
		forecast: organizedData,
	};
};

export const getOpenWeather = async (zipCode?, lat?, lon?, city?, state?, country = 'US', timezone = -300) => {
	try {
		let resolvedZipCode = zipCode;

		if (city || state || country) {
			const resolvedLocation: LocationOutput = await resolveLocation({ city, state, country });
			resolvedZipCode = resolvedLocation.zipCode;
		}

		if (!resolvedZipCode && (!lat || !lon)) {
			throw new Error('Zip code or latitude/longitude must be provided.');
		}

		const { forecastData } = await fetchWeatherData({
			lat,
			lon,
			zipCode: resolvedZipCode,
		});

		const organizedWeatherData = organizeWeatherData(forecastData, timezone);

		return {
			status: true,
			data: organizedWeatherData,
		};
	} catch (error: any) {
		return {
			status: false,
			message: `Error: ${error.message}`,
		};
	}
};
