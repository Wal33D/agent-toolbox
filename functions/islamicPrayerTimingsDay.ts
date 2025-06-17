import axios from 'axios';
import { VercelRequest } from '@vercel/node';
import { getLocationData } from './resolvers/location';

const ALADHAN_API_URL = 'http://api.aladhan.com/v1';

// Helper function to convert 24-hour time to 12-hour time
const convertTo12Hour = (time: string): string => {
	const [hour, minute] = time.split(':');
	let hourNum = parseInt(hour, 10);
	const ampm = hourNum >= 12 ? 'PM' : 'AM';
	hourNum = hourNum % 12 || 12; // Convert '0' hour to '12'
	return `${hourNum}:${minute} ${ampm}`;
};

export const getIslamicPrayerTimingsDay = async (request: VercelRequest): Promise<PrayerTimings> => {
	let { city, state, date, country, zipCode, lat, lon } = request.body;

	if (!city) {
		if (zipCode || (lat && lon)) {
			const locationData = await getLocationData(request);

			if (locationData.status && locationData.locations.length > 0) {
				city = locationData.locations[0].city;
				state = locationData.locations[0].state;
				country = locationData.locations[0].country || 'US';
			} else {
				throw new Error('Unable to resolve location from zip code or coordinates.');
			}
		} else {
			throw new Error('City or zipCode/lat/lon are required');
		}
	}

	// Convert city, state, and country to uppercase
	city = city.toUpperCase();
	state = state ? state.toUpperCase() : '';
	country = country ? country.toUpperCase() : 'US';

	// Use current date if date is missing
	if (!date) {
		const currentDate = new Date();
		date = `${currentDate.getMonth() + 1}-${currentDate.getDate()}-${currentDate.getFullYear()}`;
	}

	// Ensure country is a 2-digit string
	if (country.length !== 2) {
		throw new Error('Country must be a 2-digit ISO 3166 code');
	}

	// Convert date from MM-DD-YYYY to DD-MM-YYYY for the API
	const [month, day, year] = date.split('-');
	const formattedDate = `${day}-${month}-${year}`;

	const response = await axios.get(`${ALADHAN_API_URL}/timingsByCity/${formattedDate}`, {
		params: {
			city,
			country,
			state,
		},
	});

	const data = response.data.data;
	const timings = data.timings;
	const gregorianDate = data.date.gregorian;
	const hijriDate = data.date.hijri;
	const meta = data.meta;

	// Format dateStandard to MM-DD-YYYY
	const [gDay, gMonth, gYear] = gregorianDate.date.split('-');
	const dateStandard = `${gMonth}-${gDay}-${gYear}`;

	// Convert timings to 12-hour format
	const timings12Hour = {
		Fajr: convertTo12Hour(timings.Fajr),
		Sunrise: convertTo12Hour(timings.Sunrise),
		Dhuhr: convertTo12Hour(timings.Dhuhr),
		Asr: convertTo12Hour(timings.Asr),
		Maghrib: convertTo12Hour(timings.Maghrib),
		Isha: convertTo12Hour(timings.Isha),
	};

	const locationString = `${city}${state ? ', ' + state : ''}, ${country}`;

	const structuredData: PrayerTimings = {
		dateStandard,
		dateIslamic: hijriDate.date,
		timezone: meta.timezone,
		source: meta.method.name,
		location: locationString,
		timings: timings12Hour,
		iftarTime: `The time to break your fast (Iftar) is at ${timings12Hour.Maghrib}.`,
		suhoorTime: `The time for the last meal (Suhoor) is at ${timings12Hour.Fajr}.`,
	};

	return structuredData;
};

// TypeScript interface
export interface PrayerTimings {
	dateStandard: string;
	dateIslamic: string;
	timezone: string;
	source: string;
	location: string;
	iftarTime: string;
	suhoorTime: string;
	timings: {
		Fajr: string;
		Sunrise: string;
		Dhuhr: string;
		Asr: string;
		Maghrib: string;
		Isha: string;
	};
}
