import { VercelResponse } from '@vercel/node';

export const handleToolOptions = (response: VercelResponse) => {
	return response.json({ tools });
};

export const tools = [
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
			name: 'googleWebSearch',
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
	{
		type: 'function',
		function: {
			name: 'getWebsiteScreenshot',
			description:
				'Take a screenshot of a given URL with optional height and width for the browsers window size. Returns a url to the a screenshot for any website on the internet!',
			parameters: {
				type: 'object',
				properties: {
					url: {
						type: 'string',
						description: 'The fully qualified http(s) URL of the website to take a screenshot of.',
					},
					height: {
						type: 'number',
						description: 'The height of the window (optional, but required if width is provided).',
						optional: true,
					},
					width: {
						type: 'number',
						description: 'The width of the window (optional, but required if height is provided).',
						optional: true,
					},
				},
				required: ['url'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'googleAddressResolver',
			description: 'Format and correct an address using the Google Geocoding API.',
			parameters: {
				type: 'object',
				properties: {
					address: {
						type: 'string',
						description: 'The address to format and correct',
					},
				},
				required: ['address'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'parsePhoneNumber',
			description: 'Parse, validate, and format phone numbers using the libphonenumber-js package.',
			parameters: {
				type: 'object',
				properties: {
					number: {
						type: 'string',
						description: 'Phone number string (required)',
					},
					country: {
						type: 'string',
						description: 'Country code string (optional)',
						optional: true,
					},
				},
				required: ['number'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'googleImageSearch',
			description: 'Retrieve images based on a search term using the g-i-s package.',
			parameters: {
				type: 'object',
				properties: {
					searchTerm: {
						type: 'string',
						description: 'The term to search for images.',
					},
					queryStringAddition: {
						type: 'string',
						description: 'Additional query string parameters (optional).',
						optional: true,
					},
					filterOutDomains: {
						type: 'array',
						items: {
							type: 'string',
						},
						description: 'Domains to filter out (optional).',
						optional: true,
					},
					size: {
						type: 'string',
						description: 'The size of the images (optional, one of "small", "medium", "large", "icon").',
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
			name: 'getIslamicPrayerTimings',
			description:
				'Get the Islamic prayer timings for a specific location including Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha, and a description with the Gregorian and Hijri dates. Accepts (zipCode) or (city/state/country) or (lat/lon)',
			parameters: {
				type: 'object',
				properties: {
					date: {
						type: 'string',
						description: 'The date in MM-DD-YYYY format. Defaults to current date if not provided.',
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
			name: 'cloudinaryUpload',
			description: 'Upload images to Cloudinary, supports uploading via URL, base64 string, or stream.',
			parameters: {
				type: 'object',
				properties: {
					url: {
						type: 'string',
						description: 'The URL of the image to upload (optional)',
						optional: true,
					},
					base64: {
						type: 'string',
						description: 'The base64 string of the image to upload (optional)',
						optional: true,
					},
					stream: {
						type: 'object',
						description: 'The stream of the image to upload (optional)',
						optional: true,
					},
					fileName: {
						type: 'string',
						description: 'The desired file name (optional)',
						optional: true,
					},
					cloudinaryAssetFolder: {
						type: 'string',
						description: 'The Cloudinary folder to upload to (optional)',
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
			name: 'getCurrentDateTime',
			description:
				'Get the current date and time for a specific location. The response includes the current date and time in ISO format and a human-readable format for a specified (zipCode) or (city/state/country) or (lat/lon)',
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
				required: [],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'sendTextMessage',
			description: 'Send a text message using Twilio. Requires parameters: to, body.',
			parameters: {
				type: 'object',
				properties: {
					to: {
						type: 'string',
						description: 'The recipient phone number.',
					},
					from: {
						type: 'string',
						description: 'The sender phone number (Twilio number).',
					},
					body: {
						type: 'string',
						description: 'The message content.',
					},
				},
				required: ['to', 'body'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'sendWhatsAppMessage',
			description:
				'Send or respond to the user using a WhatsApp message Requires parameters: to, body. If no (to) is provided, the message will be sent to the current user if there communication type is set to whatsapp',
			parameters: {
				type: 'object',
				properties: {
					to: {
						type: 'string',
						description:
							'The recipient phone number in E.164 format, e.g., +12695010475 if not provided then the primary/current user will be messaged',
						optional: true,
					},
					body: {
						type: 'string',
						description: 'The message content.',
					},
				},
				required: ['body'],
			},
		},
	},
];
