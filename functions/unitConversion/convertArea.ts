import { VercelRequest } from '@vercel/node';
import { parseQueryParams } from '../../utils/parseQueryParams';

const convertAreaValue = ({ from, to, value }: { from: string; to: string; value: number }) => {
  let convertedValue: number | null = null;
  let stringValue: string | null = null;

  if (from === 'squareMeters' && to === 'squareFeet') {
    convertedValue = parseFloat((value * 10.7639).toFixed(2));
    stringValue = `${convertedValue} sq ft`;
  } else if (from === 'squareFeet' && to === 'squareMeters') {
    convertedValue = parseFloat((value / 10.7639).toFixed(2));
    stringValue = `${convertedValue} sq m`;
  } else if (from === 'acres' && to === 'hectares') {
    convertedValue = parseFloat((value * 0.404686).toFixed(2));
    stringValue = `${convertedValue} ha`;
  } else if (from === 'hectares' && to === 'acres') {
    convertedValue = parseFloat((value / 0.404686).toFixed(2));
    stringValue = `${convertedValue} acres`;
  }

  const status = convertedValue !== null;
  return { status, convertedValue, stringValue };
};

export const convertArea = async (request: VercelRequest) => {
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
        ['squareMeters', 'squareFeet', 'acres', 'hectares'].includes(from) &&
        ['squareMeters', 'squareFeet', 'acres', 'hectares'].includes(to)
      ) {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
          results.push({
            status: false,
            message: 'Invalid value for area conversion. It should be a number.',
            from,
            to,
            originalValue: value,
          });
        } else {
          const result = convertAreaValue({ from, to, value: numericValue });
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
              message: 'Invalid conversion parameters. Use "squareMeters", "squareFeet", "acres", or "hectares" for from and to parameters.',
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
