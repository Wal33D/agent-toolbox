import { find } from 'geo-tz';
import { VercelRequest } from '@vercel/node';
import { getLocationData } from '../functions/resolvers/location';
import { getStateAbbreviation } from '../utils/getStateAbbreviation';

export const getCurrentDateTime = async (request: VercelRequest) => {
	let { city, state, zipCode, country, lat, lon } = request.body;

	if (!country || country === undefined) {
		request.body.country = 'US';
	}

	if (country?.toUpperCase() === 'US' && state) {
		request.body.state = getStateAbbreviation(state);
	}

	if (zipCode || (city && (state || country !== 'US')) || (lat !== undefined && lon !== undefined)) {
		if (zipCode || (lat === undefined && lon === undefined)) {
			const locationData = await getLocationData(request);

			if (!locationData.status || locationData.locations.length === 0) {
				throw new Error('Unable to resolve location from provided data.');
			}

			const location = locationData.locations[0];
			lat = location.lat;
			lon = location.lon;
			city = location.city;
			state = location.state;
			country = location.country;
		}
	} else {
		throw new Error('Either city/state or zipCode/lat/lon are required');
	}

	try {
		const timezones = find(lat, lon);
		const timezone = timezones[0];

		const currentDate = new Date().toLocaleString('en-US', { timeZone: timezone });
		const formattedDate = new Date(currentDate).toLocaleString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: true,
		});

		return {
			currentDate: new Date(currentDate).toISOString(),
			humanReadableDateTime: formattedDate,
			location: state ? `${city}, ${state}, ${country}` : `${city}, ${country}`,
		};
	} catch (error) {
		return {
			error: 'Unable to determine the current time for the specified location.',
		};
	}
};
