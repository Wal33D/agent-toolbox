import { google, drive_v3 } from 'googleapis';

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

interface UpdateGoogleDriveFileDescriptionResponse {
	success: boolean;
	fileId?: string;
	description?: string;
	error?: string;
}

export const updateGoogleDriveFileDescription = async ({
	fileId,
	description,
}: {
	fileId: string;
	description: string;
}): Promise<UpdateGoogleDriveFileDescriptionResponse> => {
	const drive = google.drive({ version: 'v3', auth });

	const updateMetadata: drive_v3.Schema$File = {
		description,
	};

	try {
		await drive.files.update({
			fileId,
			requestBody: updateMetadata,
		});

		return {
			success: true,
			fileId,
			description,
		};
	} catch (error: unknown) {
		return {
			success: false,
			error: `Error updating file description: ${(error as Error).message}`,
		};
	}
};
