import { VercelRequest } from '@vercel/node';
import { parseQueryParams } from '../../utils/parseQueryParams';

const convertTemperatureValue = ({ from, to, value }: { from: string; to: string; value: number }) => {
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

export const convertTemperature = async (request: VercelRequest) => {
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
          const result = convertTemperatureValue({ from, to, value: numericValue });
          if (result.status) {
            results.push({
              status: true,
              from,
              to,
              originalValue: numericValue,
              convertedValue: result.convertedValue,
              stringValue: result.stringValue,
              message: `Converted ${value}° ${from === 'metric' ? 'Celsius' : from === 'imperial' ? 'Fahrenheit' : 'Kelvin'} to ${result.convertedValue}° ${to === 'imperial' ? 'Fahrenheit' : to === 'metric' ? 'Celsius' : 'Kelvin'}.`,
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
