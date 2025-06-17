const assert = require('assert');
const { capitalize } = require('../dist/utils/capitalize.js');

assert.strictEqual(capitalize('hello world'), 'Hello world');
assert.strictEqual(capitalize('ALREADY'), 'Already');
assert.strictEqual(capitalize(''), '');

console.log('capitalize tests passed');
