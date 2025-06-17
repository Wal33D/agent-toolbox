const jwt = require('jsonwebtoken');
const { verifyJWT } = require('../dist/utils/verifyJWT.js');

describe('verifyJWT', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
  });

  test('valid token', () => {
    const token = jwt.sign({ foo: 'bar' }, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '1h',
    });
    expect(verifyJWT('Bearer ' + token)).toEqual(
      expect.objectContaining({ valid: true })
    );
  });

  test('expired token', () => {
    const token = jwt.sign({ foo: 'bar' }, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: -10,
    });
    expect(verifyJWT('Bearer ' + token)).toEqual({
      valid: false,
      error: 'expired',
    });
  });

  test('malformed token', () => {
    expect(verifyJWT('Bearer malformed')).toEqual({
      valid: false,
      error: 'malformed',
    });
  });
});
