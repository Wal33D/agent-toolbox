import { parseQueryParams } from '../utils/parseQueryParams';
import { VercelRequest, VercelResponse } from '@vercel/node';

const convertLength = ({ from, to, value }: { from: string; to: string; value: number }) => {
	let convertedValue: number | null = null;
	let stringValue: string | null = null;

	if (from === 'meters' && to === 'feet') {
		convertedValue = parseFloat((value * 3.28084).toFixed(2));
		stringValue = `${convertedValue} ft`;
	} else if (from === 'feet' && to === 'meters') {
		convertedValue = parseFloat((value / 3.28084).toFixed(2));
		stringValue = `${convertedValue} m`;
	} else if (from === 'inches' && to === 'centimeters') {
		convertedValue = parseFloat((value * 2.54).toFixed(2));
		stringValue = `${convertedValue} cm`;
	} else if (from === 'centimeters' && to === 'inches') {
		convertedValue = parseFloat((value / 2.54).toFixed(2));
		stringValue = `${convertedValue} in`;
	}

	const status = convertedValue !== null;

	return { status, convertedValue, stringValue };
};

const handler = async (request: VercelRequest, response: VercelResponse) => {
	try {
		let requests: any[] = [];

		if (request.method === 'OPTIONS') {
			const interfaceDescription = {
				description: 'This endpoint converts lengths between meters, feet, inches, and centimeters.',
				requiredParams: {
					from: 'meters, feet, inches, or centimeters',
					to: 'meters, feet, inches, or centimeters',
					value: 'numeric length value to convert',
				},
				demoBody: [
					{
						from: 'meters',
						to: 'feet',
						value: 1,
					},
					{
						from: 'feet',
						to: 'meters',
						value: 1,
					},
					{
						from: 'inches',
						to: 'centimeters',
						value: 1,
					},
				],
				demoResponse: {
					status: true,
					message: 'Lengths converted successfully.',
					conversions: [
						{
							from: 'meters',
							to: 'feet',
							originalValue: 1,
							convertedValue: 3.28,
							stringValue: '3.28 ft',
						},
						{
							from: 'feet',
							to: 'meters',
							originalValue: 1,
							convertedValue: 0.3,
							stringValue: '0.3 m',
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

			if (['meters', 'feet', 'inches', 'centimeters'].includes(from) && ['meters', 'feet', 'inches', 'centimeters'].includes(to)) {
				const numericValue = parseFloat(value);

				if (isNaN(numericValue)) {
					results.push({
						status: false,
						message: 'Invalid value for length conversion. It should be a number.',
						from,
						to,
						originalValue: value,
					});
				} else {
					const result = convertLength({ from, to, value: numericValue });

					if (result.status) {
						results.push({
							status: true,
							from,
							to,
							originalValue: numericValue,
							convertedValue: result.convertedValue,
							stringValue: result.stringValue,
							message: `Converted ${value} ${from} to ${result.convertedValue} ${to}.`,
						});
					} else {
						results.push({
							status: false,
							message: 'Invalid conversion parameters. Use "meters", "feet", "inches", or "centimeters" for from and to parameters.',
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
