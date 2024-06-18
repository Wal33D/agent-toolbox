import { searchGoogle } from '../functions/searchGoogle/search-google';
import { getLocationData } from '../functions/locationResolver/location';
import { IPAddressLookUp } from '../functions/ip/ip';
import { parseQueryParams } from '../utils/parseQueryParams';
import { handleToolOptions } from '../functions/handleToolOptions';
import { fetchExtendedWeather } from '../functions/weather/fetchExtendedWeather';
import { getWebsiteScreenshot } from '../functions/screenshot/getWebsiteScreenshot';
import { googleAddressResolver } from '../functions/locationResolver/googleAddressResolver';
import { fetchWeeklyWeatherData } from '../functions/weather/weeklyWeather';
import { fetchTodaysWeatherData } from '../functions/weather/todaysWeather';
import { parsePhoneNumberHandler } from '../functions/phonenumber';
import { VercelRequest, VercelResponse } from '@vercel/node';
import googleImageSearch from './search-image';
import { cloudinaryUpload } from '../functions/cloudinaryUploader';

const handler = async (request: VercelRequest, response: VercelResponse) => {
	if (request.method === 'OPTIONS') {
		return await handleToolOptions(response);
	}
	try {
		let locations: any[] = [];
		let functionName: string | null = null;

		if (request.method === 'GET') {
			const queryParams = parseQueryParams(request.query) as any;
			locations = [queryParams];
			functionName = queryParams.functionName || null;
		} else if (request.method === 'POST') {
			const body = Array.isArray(request.body) ? request.body : [request.body];
			locations = body;
			functionName = body[0].functionName || null;
		} else {
			throw new Error('Invalid request method');
		}

		const processRequest = async (input: any) => {
			switch (functionName) {
				case 'IPAddressLookUp':
					return await IPAddressLookUp(input.ip);
				case 'locationResolver':
					return await getLocationData(request);
				case 'getWebsiteScreenshot':
					return await getWebsiteScreenshot(request);
				case 'searchTheInternet':
					return await searchGoogle(request);
				case 'getTodaysWeather':
					return await fetchTodaysWeatherData(request);
				case 'getWeeklyForecast':
					return await fetchWeeklyWeatherData(request);
				case 'getExtendedWeather':
					return await fetchExtendedWeather(request);
				case 'googleAddressResolver':
					return await googleAddressResolver(request);
				case 'parsePhoneNumber':
					return await parsePhoneNumberHandler(request);
				case 'googleImageSearch':
					return await googleImageSearch(request);
				case 'cloudinaryUpload':
					return await cloudinaryUpload(request);
				default:
					throw new Error('Invalid function name.');
			}
		};

		if (Array.isArray(locations) && locations.length > 1) {
			const dataArray = await Promise.all(locations.map(processRequest));
			response.status(200).json(dataArray);
		} else {
			const responseData = await processRequest(locations[0]);
			response.status(200).json(responseData);
		}
	} catch (error: any) {
		response.status(400).json({ error: error.message });
	}
};

export default handler;
