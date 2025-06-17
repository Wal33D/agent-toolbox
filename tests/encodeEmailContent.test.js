const assert = require('assert');
const { encodeEmailContent, EncodingType } = require('../dist/utils/encodeEmailContent.js');

// Subject encoding
const subjectResult = encodeEmailContent({ content: 'Hello', type: EncodingType.Subject });
const expectedSubject = `=?utf-8?B?${Buffer.from('Hello', 'utf-8').toString('base64')}?=`;
assert.strictEqual(subjectResult.isEncoded, true);
assert.strictEqual(subjectResult.encodedContent, expectedSubject);

// MIME message encoding
const mimeResult = encodeEmailContent({ content: 'Hello', type: EncodingType.MimeMessage });
const expectedMime = Buffer.from('Hello', 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
assert.strictEqual(mimeResult.encodedContent, expectedMime);

// Attachment encoding of plain text
const attachmentResult = encodeEmailContent({ content: 'file content', type: EncodingType.Attachment });
const expectedAttachment = Buffer.from('file content', 'utf-8').toString('base64');
assert.strictEqual(attachmentResult.encodedContent, expectedAttachment);

// Attachment content already encoded
const alreadyResult = encodeEmailContent({ content: expectedAttachment, type: EncodingType.Attachment });
assert.strictEqual(alreadyResult.encodedContent, expectedAttachment);
assert.strictEqual(alreadyResult.message, 'Attachment content was already Base64 encoded.');

console.log('encodeEmailContent tests passed');
