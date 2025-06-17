import axios from 'axios';
import { VercelRequest } from '@vercel/node';
import { WeatherRequest, TodaysWeatherResponse } from './weatherTypes';

export const fetchTodaysWeatherData = async (
        request: VercelRequest
): Promise<TodaysWeatherResponse> => {
       const weatherApiKey = process.env.VISUAL_CROSSING_WEATHER_API_KEY;

        let location;
        const { lat, lon, city, state, zipCode, country } =
                request.body as WeatherRequest;
        if (lat !== undefined && lon !== undefined) {
                location = `${lat},${lon}`;
        } else if (city && state) {
                const countryCode = country || 'US';
                location = `${city},${state},${countryCode}`;
        } else if (zipCode) {
                location = zipCode;
	} else {
		throw new Error('Either city/state, zip code, or lat/lon must be provided');
	}

	const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
		location
	)}?unitGroup=metric&key=${weatherApiKey}&contentType=json`;

	const response = await axios.get(apiUrl);
	const data = response.data;

	if (!data || !data.currentConditions) {
		throw new Error('Unable to fetch current weather data');
	}

	const result = {
		location: data.resolvedAddress,
		currentWeather: {
			datetime: data.currentConditions.datetime,
			temp: data.currentConditions.temp,
			feelslike: data.currentConditions.feelslike,
			humidity: data.currentConditions.humidity,
			dew: data.currentConditions.dew,
			precip: data.currentConditions.precip,
			precipprob: data.currentConditions.precipprob,
			snow: data.currentConditions.snow,
			snowdepth: data.currentConditions.snowdepth,
			windspeed: data.currentConditions.windspeed,
			winddir: getWindDirection(data.currentConditions.winddir),
			pressure: data.currentConditions.pressure,
			visibility: data.currentConditions.visibility,
			cloudcover: data.currentConditions.cloudcover,
			solarradiation: data.currentConditions.solarradiation,
			uvindex: data.currentConditions.uvindex,
			conditions: data.currentConditions.conditions,
			sunrise: convertTo12HourFormat(data.currentConditions.sunrise),
			sunset: convertTo12HourFormat(data.currentConditions.sunset),
			description: getTodaysWeatherDescription(data.currentConditions),
		},
	};

	return result;
};

const convertTo12HourFormat = (time24: string) => {
	const [hour, minute] = time24.split(':');
	const period = +hour < 12 ? 'AM' : 'PM';
	const hour12 = +hour % 12 || 12;
	return `${hour12}:${minute} ${period}`;
};

export const getTodaysWeatherDescription = (currentConditions: any) => {
	const windDirection = getWindDirection(currentConditions.winddir);

	return `Currently, the weather is ${currentConditions.conditions.toLowerCase()}. The temperature is approximately ${
		currentConditions.temp
	}°C (${convertTemp(currentConditions.temp, 'F')}°F), feels like ${currentConditions.feelslike}°C (${convertTemp(
		currentConditions.feelslike,
		'F'
	)}°F). ${currentConditions.conditions.toLowerCase()} skies, with a wind speed of ${
		currentConditions.windspeed
	} km/h coming from ${windDirection} (${currentConditions.winddir}°). The precipitation (rain) is ${currentConditions.precip} mm (${
		currentConditions.precipprob
	}% probability), with ${currentConditions.snow} mm of snow and a snow depth of ${currentConditions.snowdepth} mm. Humidity is ${
		currentConditions.humidity
	}%, dew point is ${currentConditions.dew}°C (${convertTemp(currentConditions.dew, 'F')}°F). The atmospheric pressure is ${
		currentConditions.pressure
	} hPa, visibility is ${currentConditions.visibility} km, cloud cover is ${currentConditions.cloudcover}%, solar radiation is ${
		currentConditions.solarradiation
	} W/m², and UV index is ${currentConditions.uvindex}. Sunrise at ${currentConditions.sunrise} and sunset at ${currentConditions.sunset}.`;
};

const getWindDirection = (degree: number) => {
	if (degree > 337.5) return 'North';
	if (degree > 292.5) return 'North-West';
	if (degree > 247.5) return 'West';
	if (degree > 202.5) return 'South-West';
	if (degree > 157.5) return 'South';
	if (degree > 122.5) return 'South-East';
	if (degree > 67.5) return 'East';
	if (degree > 22.5) return 'North-East';
	return 'North';
};

const convertTemp = (temp: number, unit: string) => {
	if (unit === 'F') {
		return Math.round((temp * 9) / 5 + 32);
	}
	return Math.round(temp); // Default is Celsius
};

const getUnitInitial = (unit: string | undefined) => {
	if (typeof unit === 'string') {
		const upperUnit = unit.toUpperCase();
		if (upperUnit === 'CELSIUS') return 'C';
		if (upperUnit === 'FAHRENHEIT') return 'F';
		return upperUnit.charAt(0);
	}
	return 'F';
};

export const getTodaysTemp = (data: any, unit = 'F') => {
	const tempC = data.currentWeather.temp;
	const temp = convertTemp(tempC, getUnitInitial(unit));
	return temp;
};

export const getTodaysFeelslike = (data: any, unit = 'F') => {
	const feelslikeC = data.currentWeather.feelslike;
	const feelslike = convertTemp(feelslikeC, getUnitInitial(unit));
	return feelslike;
};

export const getTodaysDew = (data: any, unit = 'F') => {
	const dewC = data.currentWeather.dew;
	const dew = convertTemp(dewC, getUnitInitial(unit));
	return dew;
};
