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

// Helper function to get formatted date strings for the next 7 days
const getNext7Days = (): string[] => {
	const dates: string[] = [];
	const currentDate = new Date();

	for (let i = 0; i < 7; i++) {
		const date = new Date(currentDate);
		date.setDate(currentDate.getDate() + i);
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const year = date.getFullYear();
		dates.push(`${day}-${month}-${year}`);
	}

	return dates;
};

export const getIslamicPrayerTimingsWeek = async (request: VercelRequest): Promise<WeeklyPrayerTimings> => {
	let { city, state, country, zipCode, lat, lon } = request.body;

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

	// Ensure country is a 2-digit string
	if (country.length !== 2) {
		throw new Error('Country must be a 2-digit ISO 3166 code');
	}

	const dates = getNext7Days();
	const weeklyTimings: DailyPrayerTimings[] = [];

	for (const date of dates) {
		const response = await axios.get(`${ALADHAN_API_URL}/timingsByCity/${date}`, {
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

		const dailyTimings: DailyPrayerTimings = {
			dateStandard,
			dateIslamic: hijriDate.date,
			timezone: meta.timezone,
			source: meta.method.name,
			location: locationString,
			timings: timings12Hour,
			iftarTime: `The time to break your fast (Iftar) is at ${timings12Hour.Maghrib}.`,
			suhoorTime: `The time for the last meal (Suhoor) is at ${timings12Hour.Fajr}.`,
		};

		weeklyTimings.push(dailyTimings);
	}
        return {
                weekTimings: weeklyTimings,
        };
};

// TypeScript interfaces
export interface DailyPrayerTimings {
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

export interface WeeklyPrayerTimings {
	weekTimings: DailyPrayerTimings[];
}
