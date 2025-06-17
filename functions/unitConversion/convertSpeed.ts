import { VercelRequest } from '@vercel/node';
import { parseQueryParams } from '../../utils/parseQueryParams';

const convertSpeedValue = ({ from, to, value }: { from: string; to: string; value: number }) => {
	let convertedValue: number | null = null;
	let stringValue: string | null = null;

	const lightYearToKmPerYear = 9.461e12;
	const lightYearToMilesPerYear = 5.879e12;

	if (from === 'kilometersPerHour' && to === 'milesPerHour') {
		convertedValue = parseFloat((value * 0.621371).toFixed(2));
		stringValue = `${convertedValue} mph`;
	} else if (from === 'milesPerHour' && to === 'kilometersPerHour') {
		convertedValue = parseFloat((value / 0.621371).toFixed(2));
		stringValue = `${convertedValue} km/h`;
	} else if (from === 'lightYearsPerYear' && to === 'kilometersPerHour') {
		convertedValue = parseFloat(((value * lightYearToKmPerYear) / (365.25 * 24 * 3600)).toFixed(2));
		stringValue = `${convertedValue} km/h`;
	} else if (from === 'kilometersPerHour' && to === 'lightYearsPerYear') {
		convertedValue = parseFloat((value / (lightYearToKmPerYear / (365.25 * 24 * 3600))).toFixed(12));
		stringValue = `${convertedValue} ly/year`;
	} else if (from === 'lightYearsPerYear' && to === 'milesPerHour') {
		convertedValue = parseFloat(((value * lightYearToMilesPerYear) / (365.25 * 24 * 3600)).toFixed(2));
		stringValue = `${convertedValue} mph`;
	} else if (from === 'milesPerHour' && to === 'lightYearsPerYear') {
		convertedValue = parseFloat((value / (lightYearToMilesPerYear / (365.25 * 24 * 3600))).toFixed(12));
		stringValue = `${convertedValue} ly/year`;
	} else if (from === 'metersPerSecond' && to === 'kilometersPerHour') {
		convertedValue = parseFloat((value * 3.6).toFixed(2));
		stringValue = `${convertedValue} km/h`;
	} else if (from === 'kilometersPerHour' && to === 'metersPerSecond') {
		convertedValue = parseFloat((value / 3.6).toFixed(2));
		stringValue = `${convertedValue} m/s`;
	} else if (from === 'metersPerSecond' && to === 'milesPerHour') {
		convertedValue = parseFloat((value * 2.23694).toFixed(2));
		stringValue = `${convertedValue} mph`;
	} else if (from === 'milesPerHour' && to === 'metersPerSecond') {
		convertedValue = parseFloat((value / 2.23694).toFixed(2));
		stringValue = `${convertedValue} m/s`;
	} else if (from === 'knots' && to === 'kilometersPerHour') {
		convertedValue = parseFloat((value * 1.852).toFixed(2));
		stringValue = `${convertedValue} km/h`;
	} else if (from === 'kilometersPerHour' && to === 'knots') {
		convertedValue = parseFloat((value / 1.852).toFixed(2));
		stringValue = `${convertedValue} knots`;
	} else if (from === 'knots' && to === 'milesPerHour') {
		convertedValue = parseFloat((value * 1.15078).toFixed(2));
		stringValue = `${convertedValue} mph`;
	} else if (from === 'milesPerHour' && to === 'knots') {
		convertedValue = parseFloat((value / 1.15078).toFixed(2));
		stringValue = `${convertedValue} knots`;
	}

	const status = convertedValue !== null;
	return { status, convertedValue, stringValue };
};

export const convertSpeed = async (request: VercelRequest) => {
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
			if (
				['kilometersPerHour', 'milesPerHour', 'metersPerSecond', 'knots', 'lightYearsPerYear'].includes(from) &&
				['kilometersPerHour', 'milesPerHour', 'metersPerSecond', 'knots', 'lightYearsPerYear'].includes(to)
			) {
				const numericValue = parseFloat(value);
				if (isNaN(numericValue)) {
					results.push({
						status: false,
						message: 'Invalid value for speed conversion. It should be a number.',
						from,
						to,
						originalValue: value,
					});
				} else {
					const result = convertSpeedValue({ from, to, value: numericValue });
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
								'Invalid conversion parameters. Use "kilometersPerHour", "milesPerHour", "metersPerSecond", "knots", or "lightYearsPerYear" for from and to parameters.',
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
