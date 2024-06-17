export const interfaceDescriptionIP = {
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
				status: true,
				data: {
					ip: '108.65.112.74',
					network: '108.65.112.0/21',
					version: 'IPv4',
					city: 'Austin',
					region: 'Texas',
					region_code: 'TX',
					country: 'US',
					country_name: 'United States',
					country_code: 'US',
					country_code_iso3: 'USA',
					country_capital: 'Washington',
					country_tld: '.us',
					continent_code: 'NA',
					in_eu: false,
					postal: '78717',
					latitude: 30.5034,
					longitude: -97.7494,
					utc_offset: '-0500',
					country_calling_code: '+1',
					currency: 'USD',
					currency_name: 'Dollar',
					languages: 'en-US,es-US,haw,fr',
					country_area: 9629091,
					country_population: 327167434,
					asn: 'AS7018',
					org: 'ATT-INTERNET4',
					description: 'IP 108.65.112.74 is located in Austin, Texas, United States.',
					detailedDescription:
						'IP 108.65.112.74 belongs to the network 108.65.112.0/21. It is an IPv4 address located in Austin, Texas (TX), United States (USA). The location has the postal code 78717 and is situated at latitude 30.5034 and longitude -97.7494. The currency used is USD (Dollar), and the calling code is +1. The ISP is ATT-INTERNET4 with ASN AS7018.',
				},
			},
		],
	},
};
