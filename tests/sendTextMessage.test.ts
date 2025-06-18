import { sendTextMessage } from '../functions/communication/sendTextMessage';
import twilio from 'twilio';

jest.mock('twilio');

const mockedTwilio = twilio as jest.MockedFunction<typeof twilio>;

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
    } as any);
  });

  test('sends text message successfully', async () => {
    const result = await sendTextMessage({ body: { to: '+1', body: 'hi' } } as any);
    expect(result).toEqual(
      expect.objectContaining({ success: true, msgId: '123' }),
    );
  });
});

