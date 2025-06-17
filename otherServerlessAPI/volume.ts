import { parseQueryParams } from '../utils/parseQueryParams';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyRequestToken } from '../utils/verifyJWT';

const convertVolume = ({ from, to, value }: { from: string; to: string; value: number }) => {
	let convertedValue: number | null = null;
	let stringValue: string | null = null;

	if (from === 'liters' && to === 'gallons') {
		convertedValue = parseFloat((value * 0.264172).toFixed(2));
		stringValue = `${convertedValue} gal`;
	} else if (from === 'gallons' && to === 'liters') {
		convertedValue = parseFloat((value / 0.264172).toFixed(2));
		stringValue = `${convertedValue} L`;
	} else if (from === 'milliliters' && to === 'fluidOunces') {
		convertedValue = parseFloat((value * 0.033814).toFixed(2));
		stringValue = `${convertedValue} fl oz`;
	} else if (from === 'fluidOunces' && to === 'milliliters') {
		convertedValue = parseFloat((value / 0.033814).toFixed(2));
		stringValue = `${convertedValue} mL`;
	}

	const status = convertedValue !== null;

	return { status, convertedValue, stringValue };
};

const handler = async (request: VercelRequest, response: VercelResponse) => {
	if (request.method !== 'OPTIONS' && !verifyRequestToken(request)) {
		return response.status(401).json({ status: false, message: 'Unauthorized' });
	}
	try {
		let requests: any[] = [];

		if (request.method === 'OPTIONS') {
			const interfaceDescription = {
				description: 'This endpoint converts volumes between liters, gallons, milliliters, and fluid ounces.',
				requiredParams: {
					from: 'liters, gallons, milliliters, or fluidOunces',
					to: 'liters, gallons, milliliters, or fluidOunces',
					value: 'numeric volume value to convert',
				},
				demoBody: [
					{
						from: 'liters',
						to: 'gallons',
						value: 1,
					},
					{
						from: 'gallons',
						to: 'liters',
						value: 1,
					},
					{
						from: 'milliliters',
						to: 'fluidOunces',
						value: 100,
					},
				],
				demoResponse: {
					status: true,
					message: 'Volumes converted successfully.',
					conversions: [
						{
							from: 'liters',
							to: 'gallons',
							originalValue: 1,
							convertedValue: 0.26,
							stringValue: '0.26 gal',
						},
						{
							from: 'gallons',
							to: 'liters',
							originalValue: 1,
							convertedValue: 3.79,
							stringValue: '3.79 L',
						},
						{
							from: 'milliliters',
							to: 'fluidOunces',
							originalValue: 100,
							convertedValue: 3.38,
							stringValue: '3.38 fl oz',
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

			if (
				['liters', 'gallons', 'milliliters', 'fluidOunces'].includes(from) &&
				['liters', 'gallons', 'milliliters', 'fluidOunces'].includes(to)
			) {
				const numericValue = parseFloat(value);

				if (isNaN(numericValue)) {
					results.push({
						status: false,
						message: 'Invalid value for volume conversion. It should be a number.',
						from,
						to,
						originalValue: value,
					});
				} else {
					const result = convertVolume({ from, to, value: numericValue });

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
							message:
								'Invalid conversion parameters. Use "liters", "gallons", "milliliters", or "fluidOunces" for from and to parameters.',
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
