const { sanitizeFilename } = require('../utils/sanitizeFilename.ts');

describe('sanitizeFilename', () => {
  test('removes http or https protocol', () => {
    expect(sanitizeFilename('https://Example.com')).toBe('example-com');
    expect(sanitizeFilename('http://example.com')).toBe('example-com');
  });

  test('converts result to lowercase', () => {
    expect(sanitizeFilename('https://TeSt.COM/PaTh')).toBe('test-com-path');
  });

  test('replaces invalid characters with hyphens', () => {
    expect(
      sanitizeFilename('https://example.com/some path?query=value')
    ).toBe('example-com-some-path-query-value');
  });
});
