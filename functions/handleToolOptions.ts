import { VercelResponse } from '@vercel/node';

export const handleToolOptions = (response: VercelResponse) => {
	return response.json({ tools });
};

const tools = [
	{
		type: 'function',
		function: {
			name: 'getWeeklyForecast',
			description:
				'Get the weekly weather forecast for a specific location including date, day of the week, maximum temperature, minimum temperature, average temperature, wind speed, wind direction, precipitation, humidity, conditions, and a detailed description.',
			parameters: {
				type: 'object',
				properties: {
					city: {
						type: 'string',
						description: 'The city name, e.g., San Francisco',
					},
					state: {
						type: 'string',
						description: 'The state code, e.g., CA',
					},
				},
				required: ['city', 'state'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'IPAddressLookUp',
			description:
				'Look up detailed information for a given IP address including location, network details, and organization information. The response includes fields like ip, asn, city, continent_code, country, country_area, country_calling_code, country_capital, country_code, country_code_iso3, country_name, country_population, country_tld, currency, currency_name, description, detailedDescription, in_eu, languages, latitude, longitude, network, org, postal, region, region_code, utc_offset, version.',
			parameters: {
				type: 'object',
				properties: {
					ip: {
						type: 'string',
						description: 'The IP address to look up, e.g., 108.65.112.74',
					},
				},
				required: ['ip'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'locationResolver',
			description:
				'Resolve location details for a given; (zipCode) or (city/state) or (lat/lon) otherwise known as geocoding. The response includes fields like zipCode, address, city, country, lat, lon, state.',
			parameters: {
				type: 'object',
				properties: {
					zipCode: {
						type: 'string',
						description: 'The zip code to look up, e.g., 49024',
						optional: true,
					},
					city: {
						type: 'string',
						description: 'The city name, e.g., San Francisco',
						optional: true,
					},
					state: {
						type: 'string',
						description: 'The state code, e.g., CA',
						optional: true,
					},
					country: {
						type: 'string',
						description: 'The 2-letter country code, e.g., US',
						optional: true,
					},
					lat: {
						type: 'number',
						description: 'The latitude of the location, e.g., 42.1974',
						optional: true,
					},
					lon: {
						type: 'number',
						description: 'The longitude of the location, e.g., -85.6194',
						optional: true,
					},
				},
				required: ['zipCode'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'searchTheInternet',
			description: 'Perform an internet search and return relevant results.',
			parameters: {
				type: 'object',
				properties: {
					searchTerm: {
						type: 'string',
						description: 'The term to search for on the internet.',
					},
					location: {
						type: 'string',
						description: 'The location to target the search results.',
						optional: true,
					},
					hostLanguage: {
						type: 'string',
						description: 'The host language for the search.',
						optional: true,
					},
					numberOfResults: {
						type: 'integer',
						description: 'The number of results to return.',
						optional: true,
					},
					geolocation: {
						type: 'string',
						description: 'The browsers geolocation to search from.',
						optional: true,
					},
					time_period: {
						type: 'string',
						description: 'The time period to filter the search results.',
						optional: true,
					},
				},
				required: ['searchTerm'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'getExtendedWeather',
			description:
				'Get the extended weather forecast for the next two weeks for a specific location including maximum temperature, minimum temperature, average temperature, wind speed, precipitation, humidity, and conditions.',
			parameters: {
				type: 'object',
				properties: {
					city: {
						type: 'string',
						description: 'The city name, e.g., San Francisco',
						optional: true,
					},
					state: {
						type: 'string',
						description: 'The state code, e.g., CA',
						optional: true,
					},
					zipCode: {
						type: 'string',
						description: 'The zip code to look up, e.g., 49024',
						optional: true,
					},
					lat: {
						type: 'number',
						description: 'The latitude of the location, e.g., 42.1974',
						optional: true,
					},
					lon: {
						type: 'number',
						description: 'The longitude of the location, e.g., -85.6194',
						optional: true,
					},
				},
				required: [],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'getTodaysWeather',
			description:
				'Get the current weather for a specific location including datetime, temperature, feelslike, humidity, dew point, precipitation, precipitation probability(rain chance), snow, snow depth, wind speed, wind direction, pressure, visibility, cloud cover, solar radiation, UV index, conditions, icon, sunrise, sunset, and a detailed description.',
			parameters: {
				type: 'object',
				properties: {
					city: {
						type: 'string',
						description: 'The city name, e.g., San Francisco',
					},
					state: {
						type: 'string',
						description: 'The state code, e.g., CA',
					},
				},
				required: ['city', 'state'],
			},
		},
	},
];
