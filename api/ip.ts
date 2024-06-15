import axios from 'axios';
import { connectToMongo } from '../utils/mongo';
import { parseQueryParams } from '../utils/parseQueryParams';
import { VercelRequest, VercelResponse } from '@vercel/node';

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
	const collection = db.collection('ipInfo');
	const result = await collection.findOne({ ip });
	if (result) {
		const { _id, ...ipInfo } = result; // Remove _id field
		return ipInfo as IpInfo;
	}
	return null;
};

const storeInDB = async (ipInfo: IpInfo): Promise<void> => {
	const db = await connectToMongo();
	const collection = db.collection('ipInfo');
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

const handler = async (request: VercelRequest, response: VercelResponse) => {
	if (request.method === 'OPTIONS') {
		const interfaceDescription = {
			description: 'This endpoint retrieves IP information using the ipapi.co API.',
			requiredParams: {
				ip: 'IP address (required)',
			},
			demoBody: [
				{
					ip: '4.2.2.1',
				},
				{
					ip: '108.65.112.74',
				},
			],
			demoResponse: {
				status: true,
				message: 'IP information retrieved successfully.',
				data: [
					{
						ip: '4.2.2.1',
						network: '4.2.2.0/24',
						version: 'IPv4',
						city: 'Greenville',
						region: 'South Carolina',
						region_code: 'SC',
						country: 'US',
						country_name: 'United States',
						country_code: 'US',
						country_code_iso3: 'USA',
						country_capital: 'Washington',
						country_tld: '.us',
						continent_code: 'NA',
						in_eu: false,
						postal: '29607',
						latitude: 34.8308,
						longitude: -82.3507,
						utc_offset: '-0400',
						country_calling_code: '+1',
						currency: 'USD',
						currency_name: 'Dollar',
						languages: 'en-US,es-US,haw,fr',
						country_area: 9629091,
						country_population: 327167434,
						asn: 'AS3356',
						org: 'LEVEL3',
						description: 'IP 4.2.2.1 is located in Greenville, South Carolina, United States.',
						detailedDescription:
							'IP 4.2.2.1 belongs to the network 4.2.2.0/24. It is an IPv4 address located in Greenville, South Carolina (SC), United States (USA). The location has the postal code 29607 and is situated at latitude 34.8308 and longitude -82.3507. The timezone is America/New_York with an offset of -0400. The currency used is USD (Dollar), and the calling code is +1. The ISP is LEVEL3 with ASN AS3356.',
					},
					{
						ip: '108.65.112.74',
						network: '108.65.112.0/24',
						version: 'IPv4',
						city: 'Greenville',
						region: 'South Carolina',
						region_code: 'SC',
						country: 'US',
						country_name: 'United States',
						country_code: 'US',
						country_code_iso3: 'USA',
						country_capital: 'Washington',
						country_tld: '.us',
						continent_code: 'NA',
						in_eu: false,
						postal: '29607',
						latitude: 34.8308,
						longitude: -82.3507,
						utc_offset: '-0400',
						country_calling_code: '+1',
						currency: 'USD',
						currency_name: 'Dollar',
						languages: 'en-US,es-US,haw,fr',
						country_area: 9629091,
						country_population: 327167434,
						asn: 'AS3356',
						org: 'LEVEL3',
						description: 'IP 108.65.112.74 is located in Greenville, South Carolina, United States.',
						detailedDescription:
							'IP 108.65.112.74 belongs to the network 108.65.112.0/24. It is an IPv4 address located in Greenville, South Carolina (SC), United States (USA). The location has the postal code 29607 and is situated at latitude 34.8308 and longitude -82.3507. The timezone is America/New_York with an offset of -0400. The currency used is USD (Dollar), and the calling code is +1. The ISP is LEVEL3 with ASN AS3356.',
					},
				],
			},
		};

		return response.status(200).json(interfaceDescription);
	}

	try {
		let requests: IpRequestBody[];

		if (request.method === 'GET') {
			requests = [parseQueryParams(request.query) as unknown as IpRequestBody];
		} else if (request.method === 'POST') {
			requests = Array.isArray(request.body) ? request.body : [request.body];
		} else {
			throw new Error('Invalid request method');
		}

		if (requests.length > 50) {
			return response.status(400).json({
				status: false,
				message: 'Too many requests. Please provide 50 or fewer requests in a single call.',
				data: [],
			});
		}

		const results = await Promise.all(
			requests.map(async ({ ip }) => {
				if (!ip) {
					return {
						status: false,
						message: 'IP address is required',
					};
				}
				const ipInfo = await processIp(ip);
				return {
					status: true,
					data: ipInfo,
				};
			})
		);

		return response.status(200).json({
			status: true,
			message: 'IP information retrieved successfully.',
			data: results,
		});
	} catch (error: any) {
		return response.status(500).json({
			status: false,
			message: `Error: ${error.message}`,
		});
	}
};

export default handler;
