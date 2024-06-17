export const interfaceDescriptionSearchGoogleWeb = {
	description: 'This endpoint performs a SERP search using the Scale SERP API.',
	requiredParams: {
		searchTerm: 'Search query (required)',
		location: 'Location (optional)',
		hl: 'Host language (optional)',
		gl: 'Geolocation (optional)',
		device: 'Device type (optional)',
		numberOfResults: 'Number of search results (optional)',
		max_page: 'Maximum pages to fetch (optional)',
		include_html: 'Include HTML in results (optional)',
		output: 'Output format (optional, default: json)',
		include_answer_box: 'Include answer box in results (optional)',
		time_period: 'Time period for results (optional)',
	},
	demoBody: [
		{
			searchTerm: 'Birria Tacos',
			location: 'Austin, Texas',
			hl: 'en',
			gl: 'us',
			device: 'desktop',
			numberOfResults: '3',
			max_page: '2',
			include_html: 'true',
			output: 'json',
			include_answer_box: 'true',
			time_period: 'last_week',
		},
		{
			searchTerm: 'Best Coffee Shops',
			location: 'New York, NY',
			hl: 'en',
			gl: 'us',
			device: 'mobile',
			numberOfResults: '5',
			max_page: '3',
			include_html: 'false',
			output: 'json',
			include_answer_box: 'false',
			time_period: 'last_month',
		},
	],
	demoResponse: {
		status: true,
		message: 'SERP search results retrieved successfully.',
		data: [
			{
				searchQuery: 'Birria Tacos',
				pagination: {
					/* Pagination details here */
				},
				organic_results: {
					/* Organic results here */
				},
				engine_url: 'https://www.google.com/search?q=Birria+Tacos&gl=us&hl=en&num=3',
				json_url:
					'https://api.scaleserp.com/search?api_key=YOUR_API_KEY&q=Birria+Tacos&location=Austin%2C+TX&hl=en&gl=us&device=desktop&num=3&max_page=2&include_html=true&output=json&include_answer_box=true&time_period=last_week',
			},
			{
				searchQuery: 'Best Coffee Shops',
				pagination: {
					/* Pagination details here */
				},
				organic_results: {
					/* Organic results here */
				},
				engine_url: 'https://www.google.com/search?q=Best+Coffee+Shops&gl=us&hl=en&num=5',
				json_url:
					'https://api.scaleserp.com/search?api_key=YOUR_API_KEY&q=Best+Coffee+Shops&location=New+York%2C+NY&hl=en&gl=us&device=mobile&num=5&max_page=3&include_html=false&output=json&include_answer_box=false&time_period=last_month',
			},
		],
	},
	message: 'To use this endpoint, provide search parameters in the request body or as query parameters.',
};
