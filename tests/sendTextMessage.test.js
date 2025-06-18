jest.mock('twilio');
const { sendTextMessage } = require('../functions/communication/sendTextMessage.ts');
const twilio = require('twilio');

const mockedTwilio = /** @type {jest.MockedFunction<typeof twilio>} */ (twilio);

describe('sendTextMessage', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.TWILIO_ACCOUNT_SID = 'sid';
    process.env.TWILIO_AUTH_TOKEN = 'token';
    process.env.TWILIO_ASSISTANT_PHONE_NUMBER = '+1234567890';

    mockedTwilio.mockReturnValue({
      messages: {
        create: jest.fn().mockResolvedValue({ status: 'sent', sid: '123' }),
      },
    });
  });

  test('sends text message successfully', async () => {
    const result = await sendTextMessage({ body: { to: '+1', body: 'hi' } });
    expect(result).toEqual(
      expect.objectContaining({ success: true, msgId: '123' }),
    );
  });
});

