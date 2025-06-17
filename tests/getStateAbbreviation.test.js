const assert = require('assert');
const { getStateAbbreviation } = require('../dist/utils/getStateAbbreviation.js');

assert.strictEqual(getStateAbbreviation('California'), 'CA');
assert.strictEqual(getStateAbbreviation('ca'), 'CA');
assert.strictEqual(getStateAbbreviation('Texas'), 'TX');
assert.strictEqual(getStateAbbreviation('unknown'), 'UNKNOWN');

console.log('getStateAbbreviation tests passed');
