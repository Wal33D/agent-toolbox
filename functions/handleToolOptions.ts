import { VercelResponse } from '@vercel/node';
import { interfaceDescriptionIP } from './ip/ipOptions';
import { interfaceDescriptionWeather } from './weather/weatherOptions';
import { interfaceDescriptionScreenshot } from './screenshot/screenshotOptions';
import { interfaceDescriptionSearchGoogleWeb } from './searchGoogle/search-googleOptions';
import { interfaceDescriptionLocationResolver } from './locationResolver/locationOptions';

export const handleToolOptions = (response: VercelResponse) => {
	return response.status(200).json({
		interfaceDescriptionWeather,
		interfaceDescriptionIP,
		interfaceDescriptionLocationResolver,
		interfaceDescriptionSearchGoogleWeb,
		interfaceDescriptionScreenshot,
	});
};
