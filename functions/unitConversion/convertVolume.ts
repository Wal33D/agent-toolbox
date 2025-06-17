import { VercelRequest } from '@vercel/node';
import { parseQueryParams } from '../../utils/parseQueryParams';

type VolumeUnit = 'liters' | 'gallons' | 'milliliters' | 'fluidOunces';

interface VolumeConversionRequest {
        from: VolumeUnit;
        to: VolumeUnit;
        value: number | string;
}

interface VolumeConversionResult {
        status: boolean;
        message?: string;
        from: VolumeUnit;
        to: VolumeUnit;
        originalValue: number | string;
        convertedValue?: number | null;
        stringValue?: string | null;
}

const convertVolumeValue = ({ from, to, value }: { from: VolumeUnit; to: VolumeUnit; value: number }): { status: boolean; convertedValue: number | null; stringValue: string | null } => {
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

export const convertVolume = async (request: VercelRequest) => {
        try {
                let requests: VolumeConversionRequest[] = [];
                if (request.method === 'GET') {
                        requests = [parseQueryParams<VolumeConversionRequest>(request.query)];
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

                const results: VolumeConversionResult[] = [];
		for (const req of requests) {
			const { from, to, value } = req;
			if (
				['liters', 'gallons', 'milliliters', 'fluidOunces'].includes(from) &&
				['liters', 'gallons', 'milliliters', 'fluidOunces'].includes(to)
			) {
                                const numericValue = parseFloat(String(value));
				if (isNaN(numericValue)) {
					results.push({
						status: false,
						message: 'Invalid value for volume conversion. It should be a number.',
						from,
						to,
						originalValue: value,
					});
				} else {
					const result = convertVolumeValue({ from, to, value: numericValue });
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

		return {
			status: true,
			message: 'Conversions processed successfully.',
			conversions: results,
		};
        } catch (error: unknown) {
                return {
                        status: false,
                        message: `Error: ${(error as Error).message}`,
                        conversions: [],
                };
        }
};
