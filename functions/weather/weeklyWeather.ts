import { getOpenWeather } from './openWeatherFunction';
import { getVisualWeather } from './visualWeatherFunction';
import { VercelRequest } from '@vercel/node';
import { WeatherRequest, WeeklyWeatherResponse } from './weatherTypes';

export const fetchWeeklyWeatherData = async (
        request: VercelRequest
): Promise<WeeklyWeatherResponse> => {
        const { city, state, zipCode, lat, lon } =
                request.body as WeatherRequest;

	if (!city && !state && !zipCode && (lat === undefined || lon === undefined)) {
		throw new Error('Provide either {city, state, country(optional)}, {zipCode}, or {lat, lon}');
	}

	let weatherData;
	try {
		weatherData = await getOpenWeather(request);
	} catch (error) {
		weatherData = await getVisualWeather(request);
	}

	if (!weatherData || !weatherData.data || !weatherData.data.forecast) {
		throw new Error('Unable to fetch weather data');
	}

	weatherData.forecast = weatherData.data.forecast.slice(0, 6);
	const description = getWeeklyForecastDescription(weatherData);

	return {
		forecast: weatherData.forecast,
		description: description,
	};
};

const getWeeklyAvgMaxTempC = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.maxTempC, 0);
	return total / forecast.length;
};

const getWeeklyAvgMinTempC = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.minTempC, 0);
	return total / forecast.length;
};

const getWeeklyAvgTempC = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.avgTempC, 0);
	return total / forecast.length;
};

const getWeeklyAvgMaxTempF = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.maxTempF, 0);
	return total / forecast.length;
};

const getWeeklyAvgMinTempF = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.minTempF, 0);
	return total / forecast.length;
};

const getWeeklyAvgTempF = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.avgTempF, 0);
	return total / forecast.length;
};

const getWeeklyAvgWindSpeed = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.windSpeed, 0);
	return total / forecast.length;
};

const getWeeklyTotalPrecipitation = forecast => {
	return forecast.reduce((sum, entry) => sum + entry.precipitation, 0);
};

const getWeeklyAvgHumidity = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.humidity, 0);
	return total / forecast.length;
};

const getWeeklyConditions = forecast => {
	// Assuming conditions are strings like "Rain", "Clouds", etc.
	const conditions = forecast.map(entry => entry.conditions);
	const frequency = conditions.reduce((freq, condition) => {
		freq[condition] = (freq[condition] || 0) + 1;
		return freq;
	}, {});
	const mostFrequentCondition = Object.keys(frequency).reduce((a, b) => (frequency[a] > frequency[b] ? a : b));
	return mostFrequentCondition;
};

const getWeeklyForecastDescription = data => {
	const forecast = data.forecast;
	const avgMaxTempC = getWeeklyAvgMaxTempC(forecast);
	const avgMinTempC = getWeeklyAvgMinTempC(forecast);
	const avgTempC = getWeeklyAvgTempC(forecast);
	const avgMaxTempF = getWeeklyAvgMaxTempF(forecast);
	const avgMinTempF = getWeeklyAvgMinTempF(forecast);
	const avgTempF = getWeeklyAvgTempF(forecast);
	const avgWindSpeed = getWeeklyAvgWindSpeed(forecast);
	const avgHumidity = getWeeklyAvgHumidity(forecast);
	const totalPrecipitation = getWeeklyTotalPrecipitation(forecast);
	const conditions = getWeeklyConditions(forecast);

	return `This week's weather will be mostly ${conditions.toLowerCase()}. The average maximum temperature will be ${avgMaxTempC.toFixed(
		1
	)}°C (${avgMaxTempF.toFixed(1)}°F) and the average minimum temperature will be ${avgMinTempC.toFixed(1)}°C (${avgMinTempF.toFixed(
		1
	)}°F). The average temperature will be ${avgTempC.toFixed(1)}°C (${avgTempF.toFixed(1)}°F). Expect wind speeds averaging ${avgWindSpeed.toFixed(
		1
	)} km/h and total precipitation of ${totalPrecipitation.toFixed(1)} mm. The average humidity will be ${avgHumidity.toFixed(1)}%.`;
};
