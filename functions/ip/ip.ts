import axios from 'axios';
import { connectToMongo } from '../../utils/mongo';

interface IpInfo {
	ip: string;
	network: string;
	version: string;
	city: string;
	region: string;
	region_code: string;
	country: string;
	country_name: string;
	country_code: string;
	country_code_iso3: string;
	country_capital: string;
	country_tld: string;
	continent_code: string;
	in_eu: boolean;
	postal: string;
	latitude: number;
	longitude: number;
	utc_offset: string;
	country_calling_code: string;
	currency: string;
	currency_name: string;
	languages: string;
	country_area: number;
	country_population: number;
	asn: string;
	org: string;
	description?: string;
	detailedDescription?: string;
}

interface IpRequestBody {
	ip: string;
}

const createDescription = (ipInfo: IpInfo): string => {
	return `IP ${ipInfo.ip} is located in ${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country_name}.`;
};

const createDetailedDescription = (ipInfo: IpInfo): string => {
	return `IP ${ipInfo.ip} belongs to the network ${ipInfo.network}. It is an ${ipInfo.version} address located in ${ipInfo.city}, ${ipInfo.region} (${ipInfo.region_code}), ${ipInfo.country_name} (${ipInfo.country_code_iso3}). The location has the postal code ${ipInfo.postal} and is situated at latitude ${ipInfo.latitude} and longitude ${ipInfo.longitude}. The currency used is ${ipInfo.currency} (${ipInfo.currency_name}), and the calling code is ${ipInfo.country_calling_code}. The ISP is ${ipInfo.org} with ASN ${ipInfo.asn}.`;
};

const findInDB = async (ip: string): Promise<IpInfo | null> => {
	const db = await connectToMongo();
	const collection = db.collection('ipAddressLookupCache');
	const result = await collection.findOne({ ip });
	if (result) {
		const { _id, ...ipInfo } = result; // Remove _id field
		return ipInfo as IpInfo;
	}
	return null;
};

const storeInDB = async (ipInfo: IpInfo): Promise<void> => {
	const db = await connectToMongo();
	const collection = db.collection('ipAddressLookupCache');
	await collection.updateOne({ ip: ipInfo.ip }, { $set: ipInfo }, { upsert: true });
};

const processIp = async (ip: string): Promise<IpInfo> => {
	let ipInfo = await findInDB(ip);

	if (ipInfo) {
		console.log(`Found existing IP info in DB for ${ip}.`);
	} else {
		// Fetch from ipapi.co if not found in DB
		const apiUrl = `https://ipapi.co/${ip}/json/`;
		const apiResponse = await axios.get<IpInfo>(apiUrl);
		ipInfo = apiResponse.data;

		ipInfo.description = createDescription(ipInfo);
		ipInfo.detailedDescription = createDetailedDescription(ipInfo);

		// Store the new result in DB
		await storeInDB(ipInfo);
	}

	delete (ipInfo as any)._id; // Remove _id field if it exists
	delete (ipInfo as any).timezone;

	return ipInfo;
};

export const IPAddressLookUp = async (ip: string): Promise<IpInfo> => {
	if (!ip) {
		throw new Error('IP address is required');
	}
	const ipInfo = await processIp(ip);
	return ipInfo;
};
