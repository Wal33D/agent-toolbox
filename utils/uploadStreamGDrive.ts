import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';
import { MongoClient, Db, Collection } from 'mongodb';

const tokenUrl = 'https://jwt.aquataze.com/';
const apiKey1 = process.env.TRUSTED_API_KEY_1 || '';
const apiKey2 = process.env.TRUSTED_API_KEY_2 || '';
const tokenFilePath = path.resolve(__dirname, 'token.json');

// MongoDB configuration with fallbacks
const {
	DB_USERNAME: dbUsername = '',
	DB_PASSWORD: dbPassword = '',
	DB_NAME: dbName = 'defaultDbName',
	DB_CLUSTER: dbClusterName = 'defaultClusterName',
} = process.env;

const uri = `mongodb+srv://${encodeURIComponent(dbUsername)}:${encodeURIComponent(dbPassword)}@${dbClusterName}/?retryWrites=true&w=majority`;

let client: MongoClient | null = null;
let db: Db | null = null;

// Memory cache
let memoryTokenStore: TokenStore = {};

interface TokenResponse {
	token: string;
	issuedAt: number;
	expiresAt: number;
}

interface TokenStore {
	token?: string;
	issuedAt?: number;
	expiresAt?: number;
}

// Utility functions for MongoDB connection
const connectWithRetry = async (uri: string, attempts = 5): Promise<MongoClient> => {
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			const client = new MongoClient(uri);
			await client.connect();
			return client;
		} catch (error) {
			if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
			else throw error;
		}
	}
	throw new Error('Connection attempts exceeded.');
};

const connectToMongo = async (): Promise<Db> => {
	if (!client) {
		client = await connectWithRetry(uri);
		db = client.db(dbName);
	}
	return db as Db;
};

const getTokenCollection = async (): Promise<Collection> => {
	const db = await connectToMongo();
	return db.collection('tokenStore');
};

const fetchToken = async (): Promise<TokenStore> => {
	try {
		const response = await axios.post<TokenResponse>(
			tokenUrl,
			{
				apiKey1: apiKey1,
				apiKey2: apiKey2,
			},
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		const tokenData = response.data;
		return {
			token: tokenData.token,
			issuedAt: tokenData.issuedAt,
			expiresAt: tokenData.expiresAt,
		};
	} catch (error) {
		console.error('Error fetching token:', error);
		throw new Error('Unable to fetch token');
	}
};

const isTokenExpired = (tokenStore: TokenStore): boolean => {
	const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
	const tokenExpirationBuffer = 300; // 5 minutes in seconds

	return !tokenStore.expiresAt || currentTime >= tokenStore.expiresAt - tokenExpirationBuffer;
};

const getTokenFromDisk = async (): Promise<TokenStore> => {
	if (fs.existsSync(tokenFilePath)) {
		const data = fs.readFileSync(tokenFilePath, 'utf8');
		return JSON.parse(data) as TokenStore;
	}
	return {};
};

const saveTokenToDisk = async (tokenStore: TokenStore): Promise<void> => {
	fs.writeFileSync(tokenFilePath, JSON.stringify(tokenStore));
};

const getTokenFromMemory = (): TokenStore => {
	return memoryTokenStore;
};

const saveTokenToMemory = (tokenStore: TokenStore): void => {
	memoryTokenStore = tokenStore;
};

const getTokenFromDatabase = async (): Promise<TokenStore> => {
	const collection = await getTokenCollection();
	const tokenDoc = await collection.findOne({ name: 'tokenStore' });
	return tokenDoc || ({} as any);
};

const saveTokenToDatabase = async (tokenStore: TokenStore): Promise<void> => {
	const collection = await getTokenCollection();
	await collection.updateOne({ name: 'tokenStore' }, { $set: tokenStore }, { upsert: true });
};

export const getToken = async (storage: 'DATABASE' | 'DISK' | 'MEMORY' = 'DATABASE'): Promise<string> => {
	let tokenStore: TokenStore = {};

	if (storage === 'DISK') {
		tokenStore = await getTokenFromDisk();
	} else if (storage === 'MEMORY') {
		tokenStore = getTokenFromMemory();
	} else if (storage === 'DATABASE') {
		tokenStore = await getTokenFromDatabase();
	}

	if (!tokenStore.token || isTokenExpired(tokenStore)) {
		tokenStore = await fetchToken();

		if (storage === 'DISK') {
			await saveTokenToDisk(tokenStore);
		} else if (storage === 'MEMORY') {
			saveTokenToMemory(tokenStore);
		} else if (storage === 'DATABASE') {
			await saveTokenToDatabase(tokenStore);
		}
	}

	return tokenStore.token!;
};

const log = (message: string) => {
	console.log(`[LOG] ${new Date().toISOString()} - ${message}`);
};

export const uploadStreamFile = async (
	stream: NodeJS.ReadableStream,
	fileName: string,
	storage: 'DATABASE' | 'DISK' | 'MEMORY' = 'DATABASE'
): Promise<any> => {
	try {
		log(`Fetching token for storage: ${storage}`);
		const token = await getToken(storage);

		const form = new FormData();
		form.append('file', stream, {
			filename: fileName,
			contentType: 'application/octet-stream',
		});

		log(`Uploading file: ${fileName}`);
		const response = await axios.post('https://gdrive.aquataze.com/stream', form, {
			headers: {
				...form.getHeaders(),
				Authorization: `Bearer ${token}`,
			},
		});

		log(`File uploaded successfully: ${fileName}`);
		return response.data;
	} catch (error) {
		log(`Error uploading file: ${fileName} - ${error.message}`);
		throw error;
	}
};
export const uploadStreamMultipleFiles = async (
	files: { stream: NodeJS.ReadableStream; fileName: string }[],
	storage: 'DATABASE' | 'DISK' | 'MEMORY' = 'DATABASE'
): Promise<any[]> => {
	try {
		log(`Fetching token for storage: ${storage}`);
		const token = await getToken(storage);

		const uploadPromises = files.map(async file => {
			try {
				const form = new FormData();
				form.append('file', file.stream, file.fileName);

				log(`Uploading file: ${file.fileName}`);
				const response = await axios.post('https://gdrive.aquataze.com/stream', form, {
					headers: {
						...form.getHeaders(),
						Authorization: `Bearer ${token}`,
					},
				});

				log(`File uploaded successfully: ${file.fileName}`);
				return response.data;
			} catch (error) {
				log(`Error uploading file: ${file.fileName} - ${error.message}`);
				throw error;
			}
		});

		return Promise.all(uploadPromises);
	} catch (error) {
		log(`Error in uploadStreamMultipleFiles: ${error.message}`);
		throw error;
	}
};
