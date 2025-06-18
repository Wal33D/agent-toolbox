jest.setTimeout(15000);
import { getWebsiteScreenshot } from '../functions/screenshot/getWebsiteScreenshot';
import puppeteer from 'puppeteer-extra';
import { uploadGDriveHelper } from '../utils/getToken';

jest.mock('puppeteer-extra');
jest.mock('puppeteer-extra-plugin-stealth', () => jest.fn(() => ({})));
jest.mock('../utils/getToken');

const mockedPuppeteer = puppeteer as jest.Mocked<typeof puppeteer>;
const mockedUpload = uploadGDriveHelper as jest.MockedFunction<typeof uploadGDriveHelper>;

beforeEach(() => {
  jest.useFakeTimers();
  mockedUpload.mockResolvedValue({
    data: {
      files: [
        {
          downloadUrl: 'download',
          webViewLink: 'view',
          createdTime: 'time',
          mimeType: 'image/png',
          iconLink: 'icon',
        },
      ],
    },
  } as any);

  const page = {
    setViewport: jest.fn(),
    setUserAgent: jest.fn(),
    target: jest.fn().mockReturnValue({ createCDPSession: jest.fn().mockResolvedValue({ send: jest.fn() }) }),
    goto: jest.fn(),
    mouse: { move: jest.fn(), click: jest.fn() },
    screenshot: jest.fn().mockResolvedValue(Buffer.from('img')),
  } as any;

  const browser = {
    newPage: jest.fn().mockResolvedValue(page),
    close: jest.fn(),
  } as any;

  mockedPuppeteer.launch = jest.fn().mockResolvedValue(browser);
  mockedPuppeteer.use = jest.fn();
});

afterEach(() => {
  jest.useRealTimers();
});

test('captures screenshot and uploads', async () => {
  const promise = getWebsiteScreenshot({ method: 'GET', query: { url: 'https://example.com' } } as any);
  await jest.runAllTimersAsync();
  const result = await promise;
  expect(result).toEqual(
    expect.objectContaining({
      status: true,
      screenshotUrl: expect.objectContaining({ downloadUrl: 'download' }),
    }),
  );
});
