import { VercelResponse } from '@vercel/node';
import { interfaceDescriptionIP } from './ip/ipOptions';
import { interfaceDescriptionWeather } from './weather/weatherOptions';

export const handleToolOptions = (response: VercelResponse) => {
	return response.status(200).json({ interfaceDescriptionWeather, interfaceDescriptionIP });
};
