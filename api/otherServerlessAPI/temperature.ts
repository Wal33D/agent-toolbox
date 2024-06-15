import { parseQueryParams } from '../../utils/parseQueryParams';
import { VercelRequest, VercelResponse } from '@vercel/node';

const convertTemperature = ({ from, to, value }: { from: string; to: string; value: number }) => {
	let convertedValue: number | null = null;
	let stringValue: string | null = null;

	if (from === 'metric' && to === 'imperial') {
		convertedValue = parseFloat((value * (9 / 5) + 32).toFixed(2));
		stringValue = `${convertedValue} °F`;
	} else if (from === 'imperial' && to === 'metric') {
		convertedValue = parseFloat(((value - 32) * (5 / 9)).toFixed(2));
		stringValue = `${convertedValue} °C`;
	} else if (from === 'metric' && to === 'kelvin') {
		convertedValue = parseFloat((value + 273.15).toFixed(2));
		stringValue = `${convertedValue} K`;
	} else if (from === 'kelvin' && to === 'metric') {
		convertedValue = parseFloat((value - 273.15).toFixed(2));
		stringValue = `${convertedValue} °C`;
	} else if (from === 'imperial' && to === 'kelvin') {
		convertedValue = parseFloat(((value - 32) * (5 / 9) + 273.15).toFixed(2));
		stringValue = `${convertedValue} K`;
	} else if (from === 'kelvin' && to === 'imperial') {
		convertedValue = parseFloat(((value - 273.15) * (9 / 5) + 32).toFixed(2));
		stringValue = `${convertedValue} °F`;
	}

	const status = convertedValue !== null;

	return { status, convertedValue, stringValue };
};

const handler = async (request: VercelRequest, response: VercelResponse) => {
	try {
		let requests: any[] = [];

		if (request.method === 'OPTIONS') {
			const interfaceDescription = {
				description: 'This endpoint converts temperatures between metric, imperial, and kelvin scales.',
				requiredParams: {
					from: 'metric, imperial, or kelvin',
					to: 'metric, imperial, or kelvin',
					value: 'numeric temperature value to convert',
				},
				demoBody: [
					{
						from: 'metric',
						to: 'imperial',
						value: 24.6,
					},
					{
						from: 'imperial',
						to: 'metric',
						value: 76.28,
					},
					{
						from: 'kelvin',
						to: 'metric',
						value: 300,
					},
				],
				demoResponse: {
					status: true,
					message: 'Temperatures converted successfully.',
					conversions: [
						{
							from: 'metric',
							to: 'imperial',
							originalValue: 24.6,
							convertedValue: 76.28,
							stringValue: '76.28 °F',
						},
						{
							from: 'imperial',
							to: 'metric',
							originalValue: 76.28,
							convertedValue: 24.6,
							stringValue: '24.6 °C',
						},
						{
							from: 'kelvin',
							to: 'metric',
							originalValue: 300,
							convertedValue: 26.85,
							stringValue: '26.85 °C',
						},
					],
				},
				message:
					'To use this endpoint, provide an array of conversion requests with from, to, and value parameters in the request body or as query parameters.',
			};

			return response.status(200).json(interfaceDescription);
		}

		if (request.method === 'GET') {
			requests = [parseQueryParams(request.query)];
		} else if (request.method === 'POST') {
			requests = Array.isArray(request.body) ? request.body : [request.body];
		}

		if (requests.length > 50) {
			return response.status(400).json({
				data: {
					status: false,
					message: 'Too many conversions requested. Please provide 50 or fewer conversions in a single request.',
					conversions: [],
				},
			});
		}

		const results: any[] = [];

		for (const req of requests) {
			const { from, to, value } = req;

			if (['metric', 'imperial', 'kelvin'].includes(from) && ['metric', 'imperial', 'kelvin'].includes(to)) {
				const numericValue = parseFloat(value);

				if (isNaN(numericValue)) {
					results.push({
						status: false,
						message: 'Invalid value for temperature conversion. It should be a number.',
						from,
						to,
						originalValue: value,
					});
				} else {
					const result = convertTemperature({ from, to, value: numericValue });

					if (result.status) {
						results.push({
							status: true,
							from,
							to,
							originalValue: numericValue,
							convertedValue: result.convertedValue,
							stringValue: result.stringValue,
							message: `Converted ${value}° ${from === 'metric' ? 'Celsius' : from === 'imperial' ? 'Fahrenheit' : 'Kelvin'} to ${
								result.convertedValue
							}° ${to === 'imperial' ? 'Fahrenheit' : to === 'metric' ? 'Celsius' : 'Kelvin'}.`,
						});
					} else {
						results.push({
							status: false,
							message: 'Invalid conversion parameters. Use "metric", "imperial", or "kelvin" for from and to parameters.',
							from,
							to,
							originalValue: value,
						});
					}
				}
			} else {
				results.push({
					status: false,
					message: 'Missing or invalid parameters. Ensure "from" and "to" are provided and valid.',
					from,
					to,
					originalValue: value,
				});
			}
		}

		return response.status(200).json({
			data: {
				status: true,
				message: 'Conversions processed successfully.',
				conversions: results,
			},
		});
	} catch (error: any) {
		return response.status(500).json({
			data: {
				status: false,
				message: `Error: ${error.message}`,
				conversions: [],
			},
		});
	}
};

export default handler;
