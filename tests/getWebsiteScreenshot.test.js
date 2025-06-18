jest.setTimeout(15000);
jest.mock('puppeteer-extra');
jest.mock('puppeteer-extra-plugin-stealth', () => jest.fn(() => ({})));
jest.mock('../utils/getToken');
const { getWebsiteScreenshot } = require('../functions/screenshot/getWebsiteScreenshot.ts');
const puppeteer = require('puppeteer-extra');
const { uploadGDriveHelper } = require('../utils/getToken.ts');

const mockedPuppeteer = /** @type {jest.Mocked<typeof puppeteer>} */ (puppeteer);
const mockedUpload = /** @type {jest.MockedFunction<typeof uploadGDriveHelper>} */ (uploadGDriveHelper);

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
  });

  const page = {
    setViewport: jest.fn(),
    setUserAgent: jest.fn(),
    target: jest.fn().mockReturnValue({ createCDPSession: jest.fn().mockResolvedValue({ send: jest.fn() }) }),
    goto: jest.fn(),
    mouse: { move: jest.fn(), click: jest.fn() },
    screenshot: jest.fn().mockResolvedValue(Buffer.from('img')),
  };

  const browser = {
    newPage: jest.fn().mockResolvedValue(page),
    close: jest.fn(),
  };

  mockedPuppeteer.launch = jest.fn().mockResolvedValue(browser);
  mockedPuppeteer.use = jest.fn();
});

afterEach(() => {
  jest.useRealTimers();
});

test('captures screenshot and uploads', async () => {
  const promise = getWebsiteScreenshot({ method: 'GET', query: { url: 'https://example.com' } });
  await jest.runAllTimersAsync();
  const result = await promise;
  expect(result).toEqual(
    expect.objectContaining({
      status: true,
      screenshotUrl: expect.objectContaining({ downloadUrl: 'download' }),
    }),
  );
});
