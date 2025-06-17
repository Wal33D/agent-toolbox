const assert = require('assert');
const jwt = require('jsonwebtoken');
const { verifyJWT } = require('../dist/utils/verifyJWT.js');

process.env.JWT_SECRET = 'testsecret';

const validToken = jwt.sign({ foo: 'bar' }, process.env.JWT_SECRET, {
  algorithm: 'HS256',
  expiresIn: '1h',
});

const expiredToken = jwt.sign({ foo: 'bar' }, process.env.JWT_SECRET, {
  algorithm: 'HS256',
  expiresIn: -10, // already expired
});

// Valid token
assert.deepStrictEqual(verifyJWT('Bearer ' + validToken).valid, true);

// Expired token
const expiredResult = verifyJWT('Bearer ' + expiredToken);
assert.strictEqual(expiredResult.valid, false);
assert.strictEqual(expiredResult.error, 'expired');

// Malformed token
const malformedResult = verifyJWT('Bearer malformed');
assert.strictEqual(malformedResult.valid, false);
assert.strictEqual(malformedResult.error, 'malformed');

console.log('All tests passed');
