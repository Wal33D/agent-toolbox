import FormData from 'form-data';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { uploadGDriveHelper } from '../utils/getToken';
import { VercelRequest, VercelResponse } from '@vercel/node';

puppeteer.use(StealthPlugin());

interface ScreenshotRequest {
	url: string;
}

const isValidUrl = (urlString: string): boolean => {
	try {
		new URL(urlString);
		return true;
	} catch (e) {
		return false;
	}
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const randomizeDelay = async (min: number, max: number) => {
	const delayTime = Math.floor(Math.random() * (max - min + 1)) + min;
	return delay(delayTime);
};

const handler = async (request: VercelRequest, response: VercelResponse) => {
	if (request.method === 'OPTIONS') {
		return response.status(200).json({
			description: 'This endpoint takes a screenshot of a webpage and uploads it to Google Drive.',
			requiredParams: {
				url: 'The URL of the webpage to capture (required)',
			},
			demoBody: [
				{
					url: 'https://example.com',
				},
			],
			demoResponse: {
				status: true,
				message: 'Screenshot taken and uploaded successfully.',
				data: 'Screenshot URL on Google Drive...',
			},
		});
	}

	try {
		let requests: ScreenshotRequest[];

		if (request.method === 'GET') {
			//@ts-ignore
			requests = [request.query as ScreenshotRequest];
		} else if (request.method === 'POST') {
			requests = Array.isArray(request.body) ? request.body : [request.body];
		} else {
			throw new Error('Invalid request method');
		}

		const results = await Promise.all(
			requests.map(async ({ url }) => {
				if (!url) {
					return {
						status: false,
						message: 'URL is required',
					};
				}

				if (!isValidUrl(url)) {
					return {
						status: false,
						message: `Invalid URL format: "${url}"`,
					};
				}

				let browser;
				try {
					browser = await puppeteer.launch({
						headless: true,
						args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
					});

					const page = await browser.newPage();

					// Set a realistic user agent and viewport
					await page.setUserAgent(
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
					);
					await page.setViewport({ width: 1920, height: 1080 });

					// Enable cookies and cache
					const client = await page.target().createCDPSession();
					await client.send('Network.enable');
					await client.send('Network.setCacheDisabled', { cacheDisabled: false });

					await page.goto(url, { waitUntil: 'networkidle2' });

					// Add random delays and interactions
					await randomizeDelay(3000, 7000);
					await page.mouse.move(Math.random() * 1920, Math.random() * 1080);
					await page.mouse.click(Math.random() * 1920, Math.random() * 1080);

					// Wait for 5 seconds to ensure the page is fully loaded
					await delay(5000);

					const screenshotBuffer = await page.screenshot({ fullPage: true });
					await browser.close();

					// Create FormData and append the screenshot buffer
					const form = new FormData();
					form.append('file', screenshotBuffer, {
						contentType: 'image/png',
					});
					form.append('fileName', `screenshot-${url}.png`);
					form.append('setPublic', 'true');

					// Upload the screenshot to Google Drive
					const uploadResult = await uploadGDriveHelper({ form });

					const { downloadUrl, webViewLink, createdTime, mimeType, iconLink } = uploadResult.data.files[0];

					return {
						status: true,
						url,
						screenshotUrl: {
							downloadUrl,
							webViewLink,
							createdTime,
							mimeType,
							iconLink,
						},
					};
				} catch (error) {
					if (browser) await browser.close();
					return {
						status: false,
						message: `Failed to capture screenshot for URL "${url}": ${error.message}`,
					};
				}
			})
		);

		const successfulResults = results.filter(result => result.status);
		const message = `Screenshots taken and uploaded successfully for the following URL(s): ${successfulResults
			.map(result => result.url)
			.join(', ')}`;

		return response.status(200).json({
			status: true,
			message,
			data: results,
		});
	} catch (error: any) {
		return response.status(500).json({
			status: false,
			message: `Error: ${error.message}`,
		});
	}
};

export default handler;
