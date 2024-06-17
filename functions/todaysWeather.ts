import axios from 'axios';
import { getNextEnvKey } from 'envholster';

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

export const fetchTodaysWeatherData = async ({ city, state, country, zipCode, lat, lon }: any) => {
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
		},
	};

	return result;
};

const convertTo12HourFormat = time24 => {
	const [hour, minute] = time24.split(':');
	const period = +hour < 12 ? 'AM' : 'PM';
	const hour12 = +hour % 12 || 12;
	return `${hour12}:${minute} ${period}`;
};

export const getTodaysWeather = data => ({
	...data.currentWeather,
	description: getTodaysWeatherDescription(data),
});

export const getTodaysWeatherDescription = data => {
	const {
		temp,
		feelslike,
		humidity,
		dew,
		precip,
		precipprob,
		snow,
		snowdepth,
		windspeed,
		winddir,
		pressure,
		visibility,
		cloudcover,
		solarradiation,
		uvindex,
		conditions,
		sunrise,
		sunset,
	} = data.currentWeather;

	const windDirection = getWindDirection(winddir);

	return `Currently, the weather in ${data.location} is ${conditions.toLowerCase()}. The temperature is approximately ${temp}°C (${convertTemp(
		temp,
		'F'
	)}°F), feels like ${feelslike}°C (${convertTemp(
		feelslike,
		'F'
	)}°F). ${conditions.toLowerCase()} skies, with a wind speed of ${windspeed} km/h coming from ${windDirection} (${winddir}°). The precipitation (rain) is ${precip} mm (${precipprob}% probability), with ${snow} mm of snow and a snow depth of ${snowdepth} mm. Humidity is ${humidity}%, dew point is ${dew}°C (${convertTemp(
		dew,
		'F'
	)}°F). The atmospheric pressure is ${pressure} hPa, visibility is ${visibility} km, cloud cover is ${cloudcover}%, solar radiation is ${solarradiation} W/m², and UV index is ${uvindex}. Sunrise at ${sunrise} and sunset at ${sunset}.`;
};

const getWindDirection = degree => {
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

export const getTodaysHumidity = data => data.currentWeather.humidity;
export const getTodaysPrecip = data => data.currentWeather.precip;
export const getTodaysPrecipProb = data => data.currentWeather.precipprob;
export const getTodaysSnow = data => data.currentWeather.snow;
export const getTodaysSnowDepth = data => data.currentWeather.snowdepth;
export const getTodaysWindspeed = data => data.currentWeather.windspeed;
export const getTodaysWinddir = data => data.currentWeather.winddir;
export const getTodaysPressure = data => data.currentWeather.pressure;
export const getTodaysVisibility = data => data.currentWeather.visibility;
export const getTodaysCloudcover = data => data.currentWeather.cloudcover;
export const getTodaysSolarradiation = data => data.currentWeather.solarradiation;
export const getTodaysUvindex = data => data.currentWeather.uvindex;
export const getTodaysConditions = data => data.currentWeather.conditions;
export const getTodaysIcon = data => data.currentWeather.icon;
export const getTodaysSunrise = data => data.currentWeather.sunrise;
export const getTodaysSunset = data => data.currentWeather.sunset;

const convertTemp = (temp, unit) => {
	if (unit === 'F') {
		return Math.round((temp * 9) / 5 + 32);
	}
	return Math.round(temp); // Default is Celsius
};

const getUnitInitial = unit => {
	if (typeof unit === 'string') {
		const upperUnit = unit.toUpperCase();
		if (upperUnit === 'CELSIUS') return 'C';
		if (upperUnit === 'FAHRENHEIT') return 'F';
		return upperUnit.charAt(0);
	}
	return 'F';
};

export const getTodaysTemp = (data, unit = 'F') => {
	const tempC = data.currentWeather.temp;
	const temp = convertTemp(tempC, getUnitInitial(unit));
	return temp;
};

export const getTodaysFeelslike = (data, unit = 'F') => {
	const feelslikeC = data.currentWeather.feelslike;
	const feelslike = convertTemp(feelslikeC, getUnitInitial(unit));
	return feelslike;
};

export const getTodaysDew = (data, unit = 'F') => {
	const dewC = data.currentWeather.dew;
	const dew = convertTemp(dewC, getUnitInitial(unit));
	return dew;
};
