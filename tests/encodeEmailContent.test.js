const { encodeEmailContent, EncodingType } = require('../utils/encodeEmailContent.ts');

describe('encodeEmailContent', () => {
  test('subject encoding', () => {
    const subjectResult = encodeEmailContent({
      content: 'Hello',
      type: EncodingType.Subject,
    });
    const expectedSubject = `=?utf-8?B?${Buffer.from('Hello', 'utf-8').toString('base64')}?=`;
    expect(subjectResult.isEncoded).toBe(true);
    expect(subjectResult.encodedContent).toBe(expectedSubject);
  });

  test('MIME message encoding', () => {
    const mimeResult = encodeEmailContent({
      content: 'Hello',
      type: EncodingType.MimeMessage,
    });
    const expectedMime = Buffer.from('Hello', 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    expect(mimeResult.encodedContent).toBe(expectedMime);
  });

  test('attachment encoding of plain text', () => {
    const attachmentResult = encodeEmailContent({
      content: 'file content',
      type: EncodingType.Attachment,
    });
    const expectedAttachment = Buffer.from('file content', 'utf-8').toString('base64');
    expect(attachmentResult.encodedContent).toBe(expectedAttachment);

    const alreadyResult = encodeEmailContent({
      content: expectedAttachment,
      type: EncodingType.Attachment,
    });
    expect(alreadyResult.encodedContent).toBe(expectedAttachment);
    expect(alreadyResult.message).toBe('Attachment content was already Base64 encoded.');
  });
});
