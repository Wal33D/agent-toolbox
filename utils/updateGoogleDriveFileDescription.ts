import { google, drive_v3 } from 'googleapis';

const serviceAccount = JSON.parse(process.env.GDRIVE_SERVICE_ACCOUNT_JSON as string);
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
	} catch (error) {
		return {
			success: false,
			error: `Error updating file description: ${error.message}`,
		};
	}
};
