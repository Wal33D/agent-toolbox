const assert = require('assert');
const { parseQueryParams } = require('../dist/utils/parseQueryParams.js');

const result = parseQueryParams({ page: '10', search: 'abc', active: true, score: '5.5', other: 'text' });
assert.strictEqual(result.page, 10);
assert.strictEqual(result.search, 'abc');
assert.strictEqual(result.active, true);
assert.strictEqual(result.score, 5.5);
assert.strictEqual(result.other, 'text');

console.log('parseQueryParams tests passed');
