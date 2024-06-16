import fs from 'fs';
import os from 'os';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { parseQueryParams } from '../utils/parseQueryParams';
import { uploadGDriveHelper } from '../utils/getToken';
import { VercelRequest, VercelResponse } from '@vercel/node';

puppeteer.use(StealthPlugin());

interface ScrapeRequestBody {
	url: string;
}

const log = (message: string) => {
	console.log(`[LOG] ${new Date().toISOString()} - ${message}`);
};

const fetchFileAsBuffer = async (url: string): Promise<{ buffer: Buffer; fileName: string } | null> => {
	try {
		const response = await axios.get(url, { responseType: 'arraybuffer' });
		const buffer = Buffer.from(response.data, 'binary');
		const fileName = url.split('/').pop() || 'file';
		return { buffer, fileName };
	} catch (error) {
		log(`Failed to fetch file from URL "${url}": ${error.message}`);
		return null;
	}
};

const uploadFilesAsFormInput = async (files: { filePath: string; fileName: string }[], fields: { [key: string]: string }): Promise<any[]> => {
	try {
		const form = new FormData();
		for (const file of files) {
			form.append('file', fs.createReadStream(file.filePath), file.fileName);
		}

		// Append additional fields
		form.append('setPublic', 'true');
		form.append('user', 'aquataze');

		for (const [key, value] of Object.entries(fields)) {
			form.append(key, value);
		}

		log(`Uploading files`);
		const response = await uploadGDriveHelper({ form });

		log(`Files uploaded successfully`);
		// Only include file name, size, mimeType, and links in the results
		return response.data.files.map((file: any) => ({
			name: file.name,
			size: file.size,
			mimeType: file.mimeType,
			downloadUrl: file.downloadUrl,
			webViewLink: file.webViewLink,
			webContentLink: file.webContentLink,
		}));
	} catch (error) {
		log(`Error uploading files: ${error.message}`);
		throw error;
	}
};

const handler = async (request: VercelRequest, response: VercelResponse) => {
	if (request.method === 'OPTIONS') {
		const interfaceDescription = {
			description: 'This endpoint scrapes a webpage and returns its text content using Puppeteer.',
			requiredParams: {
				url: 'The URL of the webpage to scrape (required)',
			},
			demoBody: [
				{
					url: 'https://example.com',
				},
			],
			demoResponse: {
				status: true,
				message: 'Webpage text content retrieved successfully.',
				data: 'Example Domain...',
			},
		};

		return response.status(200).json(interfaceDescription);
	}

	try {
		let requests: ScrapeRequestBody[];

		if (request.method === 'GET') {
			log('Parsing GET request query parameters');
			requests = [parseQueryParams(request.query) as ScrapeRequestBody];
		} else if (request.method === 'POST') {
			log('Parsing POST request body');
			requests = Array.isArray(request.body) ? request.body : [request.body];
		} else {
			throw new Error('Invalid request method');
		}

		if (requests.length > 50) {
			log('Too many requests received');
			return response.status(400).json({
				status: false,
				message: 'Too many requests. Please provide 50 or fewer requests in a single call.',
				data: [],
			});
		}

		log(`Processing ${requests.length} requests`);

		const results = await Promise.all(
			requests.map(async ({ url }) => {
				if (!url) {
					log('URL is missing in request');
					return {
						status: false,
						message: 'URL is required',
					};
				}

				let browser;
				try {
					log(`Launching Puppeteer for URL: ${url}`);
					browser = await puppeteer.launch({
						headless: true,
						defaultViewport: null,
						args: ['--no-sandbox', '--disable-setuid-sandbox'],
					});

					const page = await browser.newPage();
					log(`Navigating to URL: ${url}`);

					await page.setUserAgent(
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
					);
					await page.setExtraHTTPHeaders({
						'Accept-Language': 'en-US,en;q=0.9',
					});

					await page.evaluateOnNewDocument(() => {
						Object.defineProperty(navigator, 'webdriver', {
							get: () => false,
						});
					});

					const client = await page.createCDPSession();
					await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: '/tmp' });

					const files: { buffer: Buffer; fileName: string }[] = [];
					const videos: { src: string; type?: string; title?: string }[] = [];

					page.on('response', async response => {
						const url = response.url();
						const resourceType = response.request().resourceType();
						if (['image', 'media', 'other'].includes(resourceType)) {
							try {
								const buffer = await response.buffer();
								const fileName = url.split('/').pop() || 'file';
								files.push({ buffer, fileName });
								log(`Captured file from network response: ${url}`);
							} catch (error) {}
						}
					});

					await page.goto(url, { waitUntil: 'networkidle2' });
					log(`Extracting text content from URL: ${url}`);
					const textContent = await page.evaluate(() => document.body.innerText.trim());

					const domFilesAndVideos = await page.evaluate(() => {
						const srcs = Array.from(document.querySelectorAll('img, a, video, audio, iframe')).map(el => ({
							//@ts-ignore
							src: el.src || el.href,
							type: el.tagName.toLowerCase(),
							//@ts-ignore
							title: el.title || el.alt || el.innerText || null,
						}));
						return srcs.filter(
							item => item.src && (/\.(pdf|zip|png|jpe?g|gif|svg|mp4|mp3)$/i.test(item.src) || item.src.includes('youtube.com/embed/'))
						);
					});

					for (const item of domFilesAndVideos) {
						if (item.type === 'video' || item.type === 'audio' || item.src.includes('youtube.com/embed/')) {
							videos.push({
								src: item.src,
								type: item.type,
								title: item.title,
							});
							log(`Captured video from DOM: ${item.src}`);
						} else {
							const file = await fetchFileAsBuffer(item.src);
							if (file) {
								files.push(file);
								log(`Captured file from DOM: ${item.src}`);
							} else {
								log(`Skipped file from DOM: ${item.src}`);
							}
						}
					}

					const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scraper-'));
					const filePaths = files
						.map(file => {
							try {
								const tempFilePath = path.join(tempDir, file.fileName);
								fs.writeFileSync(tempFilePath, file.buffer);
								return { filePath: tempFilePath, fileName: file.fileName };
							} catch (error) {
								log(`Failed to write file "${file.fileName}" to temp directory: ${error.message}`);
								return null;
							}
						})
						.filter(Boolean); // Filter out null values

					let uploadResults = [];
					if (filePaths.length > 0) {
						log(`Uploading ${filePaths.length} files`);
						//@ts-ignore
						uploadResults = await uploadFilesAsFormInput(filePaths, {});
						log(`Uploaded all files successfully`);
					}

					// Clean up temp directory
					filePaths.forEach((file: any) => {
						try {
							if (fs.existsSync(file.filePath)) {
								fs.unlinkSync(file.filePath);
							}
						} catch (error) {
							log(`Failed to clean up file "${file.fileName}": ${error.message}`);
						}
					});
					try {
						fs.rmdirSync(tempDir);
					} catch (error) {
						log(`Failed to remove temp directory "${tempDir}": ${error.message}`);
					}

					await browser.close();
					log(`Browser closed for URL: ${url}`);

					return {
						status: true,
						data: textContent,
						uploadedFiles: uploadResults,
						downloadedFiles: files.map(file => file.fileName),
						videos: videos,
					};
				} catch (error) {
					log(`Error processing URL "${url}": ${error.message}`);
					if (browser) await browser.close();
					return {
						status: false,
						message: `Failed to retrieve content for URL "${url}": ${error.message}`,
					};
				}
			})
		);

		log('All requests processed successfully');

		return response.status(200).json({
			status: true,
			message: 'Webpage text content retrieved successfully.',
			data: results,
		});
	} catch (error: any) {
		log(`Unhandled error: ${error.message}`);
		return response.status(500).json({
			status: false,
			message: `Error: ${error.message}`,
		});
	}
};

export default handler;
