import { getVisualWeather } from './visualWeatherFunction';

export const fetchExtendedWeather = async request => {
	const { city, state, zipCode, lat, lon } = request.body;

	if (!city && !state && !zipCode && (lat === undefined || lon === undefined)) {
		throw new Error('Please provide either {city, state, country (optional)}, {zipCode}, or {lat, lon}.');
	}

	let weatherData;
	try {
		weatherData = await getVisualWeather(request);
	} catch (error) {
		throw new Error('Error fetching weather data');
	}

	if (!weatherData || !weatherData.data || !weatherData.data.forecast) {
		throw new Error('Unable to retrieve weather forecast data');
	}

	const forecast = weatherData.data.forecast;
	const description = getTwoWeekForecastDescription(forecast);

	return {
		forecast: forecast,
		description: description,
	};
};

const getAvgMaxTempC = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.maxTempC, 0);
	return total / forecast.length;
};

const getAvgMinTempC = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.minTempC, 0);
	return total / forecast.length;
};

const getAvgTempC = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.avgTempC, 0);
	return total / forecast.length;
};

const getAvgMaxTempF = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.maxTempF, 0);
	return total / forecast.length;
};

const getAvgMinTempF = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.minTempF, 0);
	return total / forecast.length;
};

const getAvgTempF = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.avgTempF, 0);
	return total / forecast.length;
};

const getAvgWindSpeed = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.windSpeed, 0);
	return total / forecast.length;
};

const getTotalPrecipitation = forecast => {
	return forecast.reduce((sum, entry) => sum + entry.precipitation, 0);
};

const getAvgHumidity = forecast => {
	const total = forecast.reduce((sum, entry) => sum + entry.humidity, 0);
	return total / forecast.length;
};

const getConditions = forecast => {
	const conditions = forecast.map(entry => entry.conditions);
	const frequency = conditions.reduce((freq, condition) => {
		freq[condition] = (freq[condition] || 0) + 1;
		return freq;
	}, {});
	const mostFrequentCondition = Object.keys(frequency).reduce((a, b) => (frequency[a] > frequency[b] ? a : b));
	return mostFrequentCondition;
};

const getTwoWeekForecastDescription = forecast => {
	const avgMaxTempC = getAvgMaxTempC(forecast);
	const avgMinTempC = getAvgMinTempC(forecast);
	const avgTempC = getAvgTempC(forecast);
	const avgMaxTempF = getAvgMaxTempF(forecast);
	const avgMinTempF = getAvgMinTempF(forecast);
	const avgTempF = getAvgTempF(forecast);
	const avgWindSpeed = getAvgWindSpeed(forecast);
	const avgHumidity = getAvgHumidity(forecast);
	const totalPrecipitation = getTotalPrecipitation(forecast);
	const conditions = getConditions(forecast);

	return `The weather for the next two weeks will be predominantly ${conditions.toLowerCase()}. The average maximum temperature will be ${avgMaxTempC.toFixed(
		1
	)}°C (${avgMaxTempF.toFixed(1)}°F) and the average minimum temperature will be ${avgMinTempC.toFixed(1)}°C (${avgMinTempF.toFixed(
		1
	)}°F). The average temperature will be ${avgTempC.toFixed(1)}°C (${avgTempF.toFixed(1)}°F). Expect wind speeds averaging ${avgWindSpeed.toFixed(
		1
	)} km/h and total precipitation of ${totalPrecipitation.toFixed(1)} mm. The average humidity will be ${avgHumidity.toFixed(1)}%.`;
};
