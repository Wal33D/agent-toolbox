import axios from 'axios';
import gps2zip from 'gps2zip';
import { getNextEnvKey } from 'envholster';
import { connectToMongo } from '../../utils/mongo';
import { LocationInput, LocationOutput } from '../locationTypes';

const fetchCoordinates = async (url: string) => {
	console.log(`Fetching data from URL: ${url}`);
	try {
		const response = await axios.get(url);
		return response.data;
	} catch (error) {
		console.error(`Failed to fetch data: ${(error as Error).message}`);
		throw new Error(`Failed to fetch data: ${(error as Error).message}`);
	}
};

const getCoordinatesByAddress = async ({ city, state, country }: { city: string; state?: string; country: string }): Promise<any> => {
	const { key: apiKey } = await getNextEnvKey({
		baseEnvName: 'OPEN_WEATHER_API_KEY_',
	});

	const encodedCity = encodeURIComponent(city);
	const encodedState = state ? encodeURIComponent(state) : '';
	const encodedCountry = encodeURIComponent(country);
	const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodedCity}${
		encodedState ? ',' + encodedState : ''
	},${encodedCountry}&limit=1&appid=${apiKey}`;

	const data = await fetchCoordinates(apiUrl);
	if (data && data.length > 0) {
		const { lat, lon, name, country: code } = data[0];
		console.log(`Coordinates fetched for address: ${lat}, ${lon}`);
		return { city: name, lat, lon, country: code };
	} else {
		throw new Error('No coordinates found for the given address');
	}
};

const getCoordinatesByZipCode = async (zipCode: string): Promise<any> => {
	const { key: apiKey } = await getNextEnvKey({
		baseEnvName: 'OPEN_WEATHER_API_KEY_',
	});

	const apiUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${zipCode}&appid=${apiKey}`;
	const data = await fetchCoordinates(apiUrl);
	if (data) {
		const { lat, lon, name, country } = data;
		console.log(`Coordinates fetched for zip code: ${lat}, ${lon}`);
		return { city: name, lat, lon, zipCode, country };
	} else {
		throw new Error('No coordinates found for the given zip code');
	}
};

const getAddressByCoordinates = async (lat: number, lon: number): Promise<any> => {
	const { key: apiKey } = await getNextEnvKey({
		baseEnvName: 'OPEN_WEATHER_API_KEY_',
	});

	const apiUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;

	const data = await fetchCoordinates(apiUrl);
	if (data && data.length > 0) {
		const { name: city, state, country } = data[0];
		console.log(`Address fetched for coordinates: ${city}, ${state}, ${country}`);
		return { city, state, lat, lon, country };
	} else {
		throw new Error('No address found for the given coordinates');
	}
};

const getStateAbbreviation = (state: string) => {
	const stateAbbreviation = Object.keys(statesHash).find(key => statesHash[key] === state) || state;
	return stateAbbreviation.toUpperCase();
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
		console.log('Found existing location data in DB.');
		delete locationData._id; // Remove the _id field
		return locationData;
	}

	// If not found in DB, resolve location
	if (city && country) {
		console.log(`Resolving location by city: ${city}, country: ${country}`);
		const coordinates = await getCoordinatesByAddress({ city, state, country });
		({ lat, lon, country } = coordinates);
		zipCode = (await gps2zip.gps2zip(lat, lon)).zip_code;
		console.log(`Resolved to coordinates: ${lat}, ${lon}`);
	} else if (zipCode) {
		console.log(`Resolving location by zip code: ${zipCode}`);
		const coordinates = await getCoordinatesByZipCode(zipCode);
		({ city, lat, lon, country } = coordinates);
		if (lat !== undefined && lon !== undefined) {
			const addr = await getAddressByCoordinates(lat, lon);
			state = addr.state;
		}
		console.log(`Resolved to coordinates: ${lat}, ${lon}`);
	} else if (lat !== undefined && lon !== undefined) {
		console.log(`Resolving location by coordinates: ${lat}, ${lon}`);
		const addr = await getAddressByCoordinates(lat, lon);
		zipCode = (await gps2zip.gps2zip(lat, lon)).zip_code;
		({ country, city, state } = addr);
		console.log(`Resolved to address: ${city}, ${state}, ${country}`);
	} else {
		throw new Error('Invalid input: unable to resolve location.');
	}

	if (country === 'US' && state) {
		state = getStateAbbreviation(state);
	}

	const address = `${city}, ${state}, ${zipCode}, ${country}`;
	console.log(`Final resolved address: ${address}`);

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

const statesHash = {
	AL: 'Alabama',
	AK: 'Alaska',
	AS: 'American Samoa',
	AZ: 'Arizona',
	AR: 'Arkansas',
	CA: 'California',
	CO: 'Colorado',
	CT: 'Connecticut',
	DE: 'Delaware',
	DC: 'District Of Columbia',
	FM: 'Federated States Of Micronesia',
	FL: 'Florida',
	GA: 'Georgia',
	GU: 'Guam',
	HI: 'Hawaii',
	ID: 'Idaho',
	IL: 'Illinois',
	IN: 'Indiana',
	IA: 'Iowa',
	KS: 'Kansas',
	KY: 'Kentucky',
	LA: 'Louisiana',
	ME: 'Maine',
	MH: 'Marshall Islands',
	MD: 'Maryland',
	MA: 'Massachusetts',
	MI: 'Michigan',
	MN: 'Minnesota',
	MS: 'Mississippi',
	MO: 'Missouri',
	MT: 'Montana',
	NE: 'Nebraska',
	NV: 'Nevada',
	NH: 'New Hampshire',
	NJ: 'New Jersey',
	NM: 'New Mexico',
	NY: 'New York',
	NC: 'North Carolina',
	ND: 'North Dakota',
	MP: 'Northern Mariana Islands',
	OH: 'Ohio',
	OK: 'Oklahoma',
	OR: 'Oregon',
	PW: 'Palau',
	PA: 'Pennsylvania',
	PR: 'Puerto Rico',
	RI: 'Rhode Island',
	SC: 'South Carolina',
	SD: 'South Dakota',
	TN: 'Tennessee',
	TX: 'Texas',
	UT: 'Utah',
	VT: 'Vermont',
	VI: 'Virgin Islands',
	VA: 'Virginia',
	WA: 'Washington',
	WV: 'West Virginia',
	WI: 'Wisconsin',
	WY: 'Wyoming',
};
