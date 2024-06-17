export const interfaceDescriptionLocationResolver = {
	description: 'This endpoint resolves location details based on address, zip code, or geo-coordinates (lat, lon).',
	requiredParams: {
		zipCode: 'Zip code (optional)',
		lat: 'Latitude (optional)',
		lon: 'Longitude (optional)',
		city: 'City name (optional)',
		state: 'State code (optional)',
		country: 'Country code (required if city is provided)',
	},
	demoBody: [
		{
			zipCode: '78741',
		},
		{
			lat: 42.201,
			lon: -85.5806,
		},
		{
			city: 'Portage',
			state: 'MI',
			country: 'US',
		},
	],
	demoResponse: {
		status: true,
		message: 'Location resolved successfully.',
		locations: [
			{
				address: 'Austin, TX, 78741, US',
				zipCode: '78741',
				lat: 30.2295,
				lon: -97.7207,
				city: 'Austin',
				state: 'TX',
				country: 'US',
			},
			{
				address: 'Portage, MI, 49002, US',
				zipCode: '49002',
				lat: 42.201,
				lon: -85.5806,
				city: 'Portage',
				state: 'MI',
				country: 'US',
			},
		],
	},
	message:
		'To use this endpoint, provide an array of locations with at least one of zip code, lat/lon, or city and country parameters in the request body.',
};
