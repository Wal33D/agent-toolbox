const { parseQueryParams } = require('../dist/utils/parseQueryParams.js');

describe('parseQueryParams', () => {
  test('parses query values into the correct types', () => {
    const result = parseQueryParams({
      page: '10',
      search: 'abc',
      active: true,
      score: '5.5',
      other: 'text',
    });
    expect(result.page).toBe(10);
    expect(result.search).toBe('abc');
    expect(result.active).toBe(true);
    expect(result.score).toBe(5.5);
    expect(result.other).toBe('text');
  });
});
