import { google } from 'googleapis';
import { VercelRequest } from '@vercel/node';

function getServiceAccount() {
	const json = process.env.GDRIVE_SERVICE_ACCOUNT_JSON;
	if (!json) {
		throw new Error('Google service account configuration is required');
	}
	try {
		return JSON.parse(json);
	} catch {
		throw new Error('Invalid JSON in GDRIVE_SERVICE_ACCOUNT_JSON');
	}
}

const serviceAccount = getServiceAccount();
const SCOPES = ['https://www.googleapis.com/auth/drive'];

interface FileCreationResponse {
	status: boolean;
	fileId?: string;
	fileLink?: string;
	message: string;
}

const auth = new google.auth.JWT({
	email: serviceAccount.client_email,
	key: serviceAccount.private_key,
	scopes: SCOPES,
});

const setFilePermissions = async (fileId: string, shareEmail?: string | string[], setPublic: boolean = true) => {
	const drive = google.drive({ version: 'v3', auth });

	const emails = Array.isArray(shareEmail) ? shareEmail : shareEmail ? [shareEmail] : [];

	if (emails.length > 0) {
		await Promise.all(
			emails.map(async email => {
				if (email) {
					await drive.permissions.create({
						fileId,
						requestBody: {
							role: 'reader',
							type: 'user',
							emailAddress: email,
						},
					});
				}
			})
		);
	} else if (setPublic) {
		await drive.permissions.create({
			fileId,
			requestBody: {
				role: 'reader',
				type: 'anyone',
			},
		});
	}
};

const createGoogleDoc = async (
	title: string,
	content: string,
	shareEmail?: string | string[],
	setPublic: boolean = true
): Promise<FileCreationResponse> => {
	let status = false;
	let fileId: string | undefined;
	let fileLink: string | undefined;
	let message = '';

	try {
		const docs = google.docs({ version: 'v1', auth });
		const res = await docs.documents.create({
			requestBody: {
				title,
			},
		});

		if (res.data.documentId) {
			fileId = res.data.documentId;
			fileLink = `https://docs.google.com/document/d/${fileId}/edit`;

			await docs.documents.batchUpdate({
				documentId: fileId,
				requestBody: {
					requests: [
						{
							insertText: {
								location: { index: 1 },
								text: content,
							},
						},
					],
				},
			});

			await setFilePermissions(fileId, shareEmail, setPublic);

			status = true;
			message = 'Google Docs file created and updated with content successfully.';
		} else {
			throw new Error('Document ID is null');
		}
	} catch (error: any) {
		message = `Error creating Google Docs file: ${error.message}`;
	} finally {
		const returnValue: FileCreationResponse = { status, fileId, fileLink, message };
		return returnValue;
	}
};

const createGoogleSheet = async (
	title: string,
	content: string[][],
	shareEmail?: string | string[],
	setPublic: boolean = true
): Promise<FileCreationResponse> => {
	let status = false;
	let fileId: string | undefined;
	let fileLink: string | undefined;
	let message = '';

	try {
		const sheets = google.sheets({ version: 'v4', auth });
		const res = await sheets.spreadsheets.create({
			requestBody: {
				properties: {
					title,
				},
			},
		});

		if (res.data.spreadsheetId) {
			fileId = res.data.spreadsheetId;
			fileLink = `https://docs.google.com/spreadsheets/d/${fileId}/edit`;

			await sheets.spreadsheets.values.update({
				spreadsheetId: fileId,
				range: 'Sheet1!A1',
				valueInputOption: 'RAW',
				requestBody: {
					values: content,
				},
			});

			await setFilePermissions(fileId, shareEmail, setPublic);

			status = true;
			message = 'Google Sheets file created and updated with content successfully.';
		} else {
			throw new Error('Spreadsheet ID is null');
		}
	} catch (error: any) {
		message = `Error creating Google Sheets file: ${error.message}`;
	} finally {
		const returnValue: FileCreationResponse = { status, fileId, fileLink, message };
		return returnValue;
	}
};

const findGoogleDocByTitle = async (title: string): Promise<FileCreationResponse> => {
	let status = false;
	let fileId: string | undefined;
	let fileLink: string | undefined;
	let message = '';

	try {
		const drive = google.drive({ version: 'v3', auth });
		const res = await drive.files.list({
			q: `name='${title}' and mimeType='application/vnd.google-apps.document'`,
			fields: 'files(id, name)',
		});

		if (res.data.files && res.data.files.length > 0) {
			fileId = res.data.files[0].id || '';
			fileLink = `https://docs.google.com/document/d/${fileId}/edit`;
			status = true;
			message = 'Google Docs file found successfully.';
		} else {
			message = 'No Google Docs file found with the given title.';
		}
	} catch (error: any) {
		message = `Error finding Google Docs file: ${error.message}`;
	} finally {
		const returnValue: FileCreationResponse = { status, fileId, fileLink, message };
		return returnValue;
	}
};

const findGoogleSheetByTitle = async (title: string): Promise<FileCreationResponse> => {
	let status = false;
	let fileId: string | undefined;
	let fileLink: string | undefined;
	let message = '';

	try {
		const drive = google.drive({ version: 'v3', auth });
		const res = await drive.files.list({
			q: `name='${title}' and mimeType='application/vnd.google-apps.spreadsheet'`,
			fields: 'files(id, name)',
		});

		if (res.data.files && res.data.files.length > 0) {
			fileId = res.data.files[0].id || '';
			fileLink = `https://docs.google.com/spreadsheets/d/${fileId}/edit`;
			status = true;
			message = 'Google Sheets file found successfully.';
		} else {
			message = 'No Google Sheets file found with the given title.';
		}
	} catch (error: any) {
		message = `Error finding Google Sheets file: ${error.message}`;
	} finally {
		const returnValue: FileCreationResponse = { status, fileId, fileLink, message };
		return returnValue;
	}
};

const updateGoogleDocContent = async (
	title: string,
	content: string,
	shareEmail?: string | string[],
	setPublic: boolean = true
): Promise<FileCreationResponse> => {
	const findResult = await findGoogleDocByTitle(title);
	if (!findResult.status || !findResult.fileId) {
		return findResult;
	}

	let status = false;
	let message = '';

	try {
		const docs = google.docs({ version: 'v1', auth });
		await docs.documents.batchUpdate({
			documentId: findResult.fileId,
			requestBody: {
				requests: [
					{
						insertText: {
							location: { index: 1 },
							text: content,
						},
					},
				],
			},
		});

		await setFilePermissions(findResult.fileId, shareEmail, setPublic);

		status = true;
		message = 'Google Docs file updated with content successfully.';
	} catch (error: any) {
		message = `Error updating Google Docs file: ${error.message}`;
	} finally {
		const returnValue: FileCreationResponse = { status, fileId: findResult.fileId, fileLink: findResult.fileLink, message };
		return returnValue;
	}
};

const updateGoogleSheetContent = async (
	title: string,
	content: string[][],
	shareEmail?: string | string[],
	setPublic: boolean = true
): Promise<FileCreationResponse> => {
	const findResult = await findGoogleSheetByTitle(title);
	if (!findResult.status || !findResult.fileId) {
		return findResult;
	}

	let status = false;
	let message = '';

	try {
		const sheets = google.sheets({ version: 'v4', auth });
		await sheets.spreadsheets.values.update({
			spreadsheetId: findResult.fileId,
			range: 'Sheet1!A1',
			valueInputOption: 'RAW',
			requestBody: {
				values: content,
			},
		});

		await setFilePermissions(findResult.fileId, shareEmail, setPublic);

		status = true;
		message = 'Google Sheets file updated with content successfully.';
	} catch (error: any) {
		message = `Error updating Google Sheets file: ${error.message}`;
	} finally {
		const returnValue: FileCreationResponse = { status, fileId: findResult.fileId, fileLink: findResult.fileLink, message };
		return returnValue;
	}
};

const setFileEditPermissions = async (fileId: string, emails: string[]): Promise<FileCreationResponse> => {
	try {
		const drive = google.drive({ version: 'v3', auth });

		await Promise.all(
			emails.map(async email => {
				await drive.permissions.create({
					fileId,
					requestBody: {
						role: 'writer',
						type: 'user',
						emailAddress: email,
					},
				});
			})
		);

		return {
			status: true,
			message: `Edit permissions granted to specified emails.`,
		};
	} catch (error: any) {
		console.error('Error setting file permissions:', error);
		return {
			status: false,
			message: `Error setting file permissions: ${error.message}`,
		};
	}
};
export const setGoogleFilePermissions = async (request: VercelRequest): Promise<FileCreationResponse> => {
	const { fileId, emails } = request.body;

	if (!fileId || !emails || !Array.isArray(emails) || emails.length === 0) {
		return {
			status: false,
			message: 'Missing required parameters: fileId, emails (should be a non-empty array)',
		};
	}

	const result = await setFileEditPermissions(fileId, emails);
	return result;
};
export const createGoogleDocsFile = async (request: VercelRequest): Promise<FileCreationResponse> => {
	const { title, content, shareEmail, setPublic } = request.body;
	if (!title || !content) {
		return { status: false, message: 'Missing required parameters: title, content' };
	}
	return createGoogleDoc(title, content, shareEmail, setPublic);
};

export const createGoogleSheetsFile = async (request: VercelRequest): Promise<FileCreationResponse> => {
	const { title, content, shareEmail, setPublic } = request.body;
	if (!title || !content) {
		return { status: false, message: 'Missing required parameters: title, content' };
	}
	return createGoogleSheet(title, content, shareEmail, setPublic);
};

export const updateGoogleDocsFile = async (request: VercelRequest): Promise<FileCreationResponse> => {
	const { title, content, shareEmail, setPublic } = request.body;
	if (!title || !content) {
		return { status: false, message: 'Missing required parameters: title, content' };
	}
	return updateGoogleDocContent(title, content, shareEmail, setPublic);
};

export const updateGoogleSheetsFile = async (request: VercelRequest): Promise<FileCreationResponse> => {
	const { title, content, shareEmail, setPublic } = request.body;
	if (!title || !content) {
		return { status: false, message: 'Missing required parameters: title, content' };
	}
	return updateGoogleSheetContent(title, content, shareEmail, setPublic);
};

export default {
	createGoogleDocsFile,
	createGoogleSheetsFile,
	updateGoogleDocsFile,
	updateGoogleSheetsFile,
	setGoogleFilePermissions,
};
