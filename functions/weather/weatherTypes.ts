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

export interface WeatherRequest extends LocationInput {}

export interface CurrentWeather {
        datetime: string;
        temp: number;
        feelslike: number;
        humidity: number;
        dew: number;
        precip: number;
        precipprob: number;
        snow: number;
        snowdepth: number;
        windspeed: number;
        winddir: string;
        pressure: number;
        visibility: number;
        cloudcover: number;
        solarradiation: number;
        uvindex: number;
        conditions: string;
        sunrise: string;
        sunset: string;
        description: string;
}

export interface TodaysWeatherResponse {
        location: string;
        currentWeather: CurrentWeather;
}

export interface ForecastDay {
        date: string;
        dayOfWeek: string;
        maxTempC: number;
        minTempC: number;
        avgTempC: number;
        maxTempF: number;
        minTempF: number;
        avgTempF: number;
        windSpeed: number;
        windDir: number;
        precipitation: number;
        humidity: number;
        conditions: string;
        description: string;
}

export interface WeeklyWeatherResponse {
        forecast: ForecastDay[];
        description: string;
}

export interface ExtendedWeatherResponse {
        forecast: ForecastDay[];
        description: string;
}
