import { convertLength } from '../functions/unitConversion/convertLength';

describe('convertLength', () => {
  test('converts meters to feet', async () => {
    const result = await convertLength({
      method: 'GET',
      query: { from: 'meters', to: 'feet', value: '1' },
    } as any);
    expect(result.status).toBe(true);
    expect(result.conversions[0]).toEqual(
      expect.objectContaining({
        status: true,
        convertedValue: 3.28,
        stringValue: '3.28 ft',
      })
    );
  });

  test('converts feet to meters', async () => {
    const result = await convertLength({
      method: 'POST',
      body: { from: 'feet', to: 'meters', value: 3.28 },
    } as any);
    expect(result.conversions[0]).toEqual(
      expect.objectContaining({
        status: true,
        convertedValue: 1,
        stringValue: '1 m',
      })
    );
  });

  test('converts inches to centimeters', async () => {
    const result = await convertLength({
      method: 'GET',
      query: { from: 'inches', to: 'centimeters', value: '1' },
    } as any);
    expect(result.conversions[0]).toEqual(
      expect.objectContaining({
        status: true,
        convertedValue: 2.54,
        stringValue: '2.54 cm',
      })
    );
  });

  test('converts centimeters to inches', async () => {
    const result = await convertLength({
      method: 'GET',
      query: { from: 'centimeters', to: 'inches', value: '2.54' },
    } as any);
    expect(result.conversions[0]).toEqual(
      expect.objectContaining({
        status: true,
        convertedValue: 1,
        stringValue: '1 in',
      })
    );
  });

  test('invalid unit returns error', async () => {
    const result = await convertLength({
      method: 'GET',
      query: { from: 'yards', to: 'meters', value: '1' },
    } as any);
    expect(result.conversions[0]).toEqual(
      expect.objectContaining({
        status: false,
        message:
          'Missing or invalid parameters. Ensure "from" and "to" are provided and valid.',
      })
    );
  });

  test('invalid numeric value returns error', async () => {
    const result = await convertLength({
      method: 'GET',
      query: { from: 'meters', to: 'feet', value: 'abc' },
    } as any);
    expect(result.conversions[0]).toEqual(
      expect.objectContaining({
        status: false,
        message: 'Invalid value for length conversion. It should be a number.',
      })
    );
  });

  test('too many conversions returns error', async () => {
    const many = Array.from({ length: 51 }, () => ({
      from: 'meters',
      to: 'feet',
      value: 1,
    }));
    const result = await convertLength({ method: 'POST', body: many } as any);
    expect(result).toEqual({
      status: false,
      message:
        'Too many conversions requested. Please provide 50 or fewer conversions in a single request.',
      conversions: [],
    });
  });
});
