import { MongoClient, Db, Collection } from 'mongodb';

const { DB_USERNAME: dbUsername = '', DB_PASSWORD: dbPassword = '', DB_NAME: dbName = '', DB_CLUSTER: dbClusterName = '' } = process.env;

const uri = `mongodb+srv://${encodeURIComponent(dbUsername)}:${encodeURIComponent(dbPassword)}@${dbClusterName}/?retryWrites=true&w=majority`;

let client: MongoClient | null = null;
let db: Db | null = null;

const connectWithRetry = async (uri: string, attempts = 5): Promise<MongoClient> => {
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			const client = new MongoClient(uri);
			await client.connect();
			return client;
                } catch (error: unknown) {
                        console.error(`Attempt ${attempt} failed: ${(error as Error).message}`);
                        if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                        else throw error;
                }
	}
	throw new Error('Connection attempts exceeded.');
};

export const connectToMongo = async (): Promise<Db> => {
	if (!client) {
		client = await connectWithRetry(uri);
		db = client.db(dbName);
	}
	return db as Db;
};

export const getFileIndexCollection = async (): Promise<Collection> => {
	const db = await connectToMongo();
	return db.collection('fileIndex');
};

/**
 * Close the MongoDB client if a connection exists.
 * Call this at the end of your serverless handler or on process exit
 * to free up resources.
 */
export const closeMongoConnection = async (): Promise<void> => {
	if (client) {
		await client.close();
		client = null;
		db = null;
	}
};
