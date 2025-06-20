import axios from 'axios';
import gps2zip from 'gps2zip';
import { connectToMongo } from '../../utils/mongo';
import { LocationInput, LocationOutput } from '../../types/location';
import { getStateAbbreviation } from '../../utils/getStateAbbreviation';

// Environment variables are validated at application startup

const fetchCoordinates = async (url: string) => {
	try {
		const response = await axios.get(url);
		return response.data;
	} catch (error: any) {
		console.error(`Failed to fetch data: ${(error as Error).message}`);
		throw new Error(`Failed to fetch data: ${(error as Error).message}`);
	}
};

const getCoordinatesByAddress = async ({ city, state, country }: { city: string; state?: string; country: string }): Promise<any> => {
	const apiKey = process.env.OPEN_WEATHER_API_KEY;

	const encodedCity = encodeURIComponent(city);
	const encodedState = state ? encodeURIComponent(state) : '';
	const encodedCountry = encodeURIComponent(country);
	const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodedCity}${
		encodedState ? ',' + encodedState : ''
	},${encodedCountry}&limit=1&appid=${apiKey}`;

	const data = await fetchCoordinates(apiUrl);
	if (data && data.length > 0) {
		const { lat, lon, name, country: code } = data[0];
		return { city: name, lat, lon, country: code };
	} else {
		throw new Error('No coordinates found for the given address');
	}
};

const getCoordinatesByZipCode = async (zipCode: string): Promise<any> => {
	const apiKey = process.env.OPEN_WEATHER_API_KEY;

	const apiUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${zipCode}&appid=${apiKey}`;
	const data = await fetchCoordinates(apiUrl);
	if (data) {
		const { lat, lon, name, country } = data;
		return { city: name, lat, lon, zipCode, country };
	} else {
		throw new Error('No coordinates found for the given zip code');
	}
};

const getAddressByCoordinates = async (lat: number, lon: number): Promise<any> => {
	const apiKey = process.env.OPEN_WEATHER_API_KEY;

	const apiUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;

	const data = await fetchCoordinates(apiUrl);
	if (data && data.length > 0) {
		const { name: city, state, country } = data[0];
		return { city, state, lat, lon, country };
	} else {
		throw new Error('No address found for the given coordinates');
	}
};
const checkAndUpdateDB = async (query: any, data: any): Promise<void> => {
	const db = await connectToMongo();
	const collection = db.collection('resolvedLocations');

	await collection.updateOne(query, { $set: data }, { upsert: true });
};

const findInDB = async (query: any): Promise<any> => {
	const db = await connectToMongo();
	const collection = db.collection('resolvedLocations');
	return collection.findOne(query);
};

export const resolveLocation = async (locationInput: LocationInput): Promise<LocationOutput> => {
	let { zipCode, lat, lon, city, state, country } = locationInput;

	if ((!zipCode && (lat === undefined || lon === undefined) && !city && !country) || (zipCode && (lat !== undefined || lon !== undefined))) {
		throw new Error('Provide either zip code, or lat/lon, or city and country, not multiple or neither.');
	}

	// Build the query based on provided input
	const query: any = {};
	if (zipCode) query.zipCode = zipCode;
	if (lat !== undefined) query.lat = lat;
	if (lon !== undefined) query.lon = lon;
	if (city) query.city = city;
	if (state) query.state = state;
	if (country) query.country = country;

	// Check DB for existing record
	let locationData = await findInDB(query);

	if (locationData) {
		delete locationData._id; // Remove the _id field
		return locationData;
	}

	// If not found in DB, resolve location
	if (city && country) {
		const coordinates = await getCoordinatesByAddress({ city, state, country });
		({ lat, lon, country } = coordinates);
		zipCode = (await gps2zip.gps2zip(lat, lon)).zip_code;
	} else if (zipCode) {
		const coordinates = await getCoordinatesByZipCode(zipCode);
		({ city, lat, lon, country } = coordinates);
		if (lat !== undefined && lon !== undefined) {
			const addr = await getAddressByCoordinates(lat, lon);
			state = addr.state;
		}
	} else if (lat !== undefined && lon !== undefined) {
		const addr = await getAddressByCoordinates(lat, lon);
		zipCode = (await gps2zip.gps2zip(lat, lon)).zip_code;
		({ country, city, state } = addr);
	} else {
		throw new Error('Invalid input: unable to resolve location.');
	}

	if (country?.toUpperCase() === 'US' && state) {
		state = getStateAbbreviation(state);
	}

	const address = `${city}, ${state}, ${zipCode}, ${country}`;

	locationData = {
		zipCode: zipCode!,
		lat: lat!,
		lon: lon!,
		city: city!,
		state: state!,
		country: country!,
		address,
	};

	// Store the new result in DB
	await checkAndUpdateDB(query, locationData);

	return locationData;
};
