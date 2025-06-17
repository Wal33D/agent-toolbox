const assert = require('assert');
const { encodeEmailContent, EncodingType } = require('../dist/utils/encodeEmailContent.js');

// Empty subject should default to "No Subject"
const emptySubject = encodeEmailContent({ content: '', type: EncodingType.Subject });
const expected = `=?utf-8?B?${Buffer.from('No Subject', 'utf-8').toString('base64')}?=`;
assert.strictEqual(emptySubject.encodedContent, expected);

// Invalid encoding type should return an error
const invalid = encodeEmailContent({ content: 'hi', type: 'bad' });
assert.strictEqual(invalid.isEncoded, false);
assert.ok(invalid.message.includes('Invalid encoding type'));

console.log('encodeEmailContent edge tests passed');
