const assert = require('assert');
const { parsePhoneNumberHandler } = require('../dist/functions/resolvers/phonenumber.js');

(async () => {
  const invalidMethod = await parsePhoneNumberHandler({ method: 'PUT' });
  assert.strictEqual(invalidMethod.status, false);
  assert.strictEqual(invalidMethod.message, 'Invalid request method');

  const valid = await parsePhoneNumberHandler({ method: 'POST', body: { number: '2025550173', country: 'US' } });
  assert.strictEqual(valid.status, true);
  assert.strictEqual(valid.data.length, 1);
  assert.strictEqual(valid.data[0].isValid, true);

  const many = Array.from({ length: 51 }, () => ({ number: '123', country: 'US' }));
  const tooMany = await parsePhoneNumberHandler({ method: 'POST', body: many });
  assert.strictEqual(tooMany.status, false);
  assert.ok(tooMany.message.includes('Too many requests'));

  console.log('parsePhoneNumberHandler tests passed');
})();
