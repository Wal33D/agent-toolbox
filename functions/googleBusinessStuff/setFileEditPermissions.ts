import { google } from 'googleapis';
import { VercelRequest, VercelResponse } from '@vercel/node';

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

const auth = new google.auth.JWT({
	email: serviceAccount.client_email,
	key: serviceAccount.private_key,
	scopes: SCOPES,
});

interface FilePermissionResponse {
	status: boolean;
	message: string;
}

const setFileEditPermissions = async (fileId: string, emails: string[]): Promise<FilePermissionResponse> => {
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
				console.log(`Edit permission granted to ${email}`);
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

export const setFileEditPermissionsHandler = async (request: VercelRequest, response: VercelResponse): Promise<void> => {
	const { fileId, emails } = request.body;

	if (!fileId || !emails || !Array.isArray(emails) || emails.length === 0) {
		response.status(400).json({
			status: false,
			message: 'Missing required parameters: fileId, emails (should be a non-empty array)',
		});
		return;
	}

	const result = await setFileEditPermissions(fileId, emails);
	response.status(result.status ? 200 : 400).json(result);
};

export default {
	setFileEditPermissionsHandler,
};
