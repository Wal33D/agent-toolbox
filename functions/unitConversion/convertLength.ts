import { VercelRequest } from '@vercel/node';
import { parseQueryParams } from '../../utils/parseQueryParams';

const convertLengthValue = ({ from, to, value }: { from: string; to: string; value: number }) => {
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

export const convertLength = async (request: VercelRequest) => {
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
          const result = convertLengthValue({ from, to, value: numericValue });
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
