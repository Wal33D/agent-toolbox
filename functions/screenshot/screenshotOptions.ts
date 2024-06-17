export const interfaceDescriptionScreenshot = {
	description: 'This endpoint takes a screenshot of a webpage and uploads it to Google Drive.',
	requiredParams: {
		url: 'The URL of the webpage to capture (required)',
	},
	demoBody: [
		{
			url: 'https://example.com',
		},
	],
	demoResponse: {
		status: true,
		message: 'Screenshot taken and uploaded successfully.',
		data: 'Screenshot URL on Google Drive...',
	},
};
