import { VercelRequest } from '@vercel/node';
import { parseQueryParams } from '../../utils/parseQueryParams';

const convertWeightValue = ({ from, to, value }: { from: string; to: string; value: number }) => {
	let convertedValue: number | null = null;
	let stringValue: string | null = null;

	if (from === 'kilograms' && to === 'pounds') {
		convertedValue = parseFloat((value * 2.20462).toFixed(2));
		stringValue = `${convertedValue} lbs`;
	} else if (from === 'pounds' && to === 'kilograms') {
		convertedValue = parseFloat((value / 2.20462).toFixed(2));
		stringValue = `${convertedValue} kg`;
	} else if (from === 'grams' && to === 'ounces') {
		convertedValue = parseFloat((value * 0.035274).toFixed(2));
		stringValue = `${convertedValue} oz`;
	} else if (from === 'ounces' && to === 'grams') {
		convertedValue = parseFloat((value / 0.035274).toFixed(2));
		stringValue = `${convertedValue} g`;
	}

	const status = convertedValue !== null;
	return { status, convertedValue, stringValue };
};

export const convertWeight = async (request: VercelRequest) => {
	try {
		let requests: any[] = [];
		if (request.method === 'GET') {
			requests = [parseQueryParams(request.query)];
		} else if (request.method === 'POST') {
			requests = Array.isArray(request.body) ? request.body : [request.body];
		}

		if (requests.length > 50) {
			return {
				status: false,
				message: 'Too many conversions requested. Please provide 50 or fewer conversions in a single request.',
				conversions: [],
			};
		}

		const results: any[] = [];
		for (const req of requests) {
			const { from, to, value } = req;
			if (['kilograms', 'pounds', 'grams', 'ounces'].includes(from) && ['kilograms', 'pounds', 'grams', 'ounces'].includes(to)) {
				const numericValue = parseFloat(value);
				if (isNaN(numericValue)) {
					results.push({
						status: false,
						message: 'Invalid value for weight conversion. It should be a number.',
						from,
						to,
						originalValue: value,
					});
				} else {
					const result = convertWeightValue({ from, to, value: numericValue });
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
							message: 'Invalid conversion parameters. Use "kilograms", "pounds", "grams", or "ounces" for from and to parameters.',
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

		return {
			status: true,
			message: 'Conversions processed successfully.',
			conversions: results,
		};
	} catch (error: any) {
		return {
			status: false,
			message: `Error: ${error.message}`,
			conversions: [],
		};
	}
};
