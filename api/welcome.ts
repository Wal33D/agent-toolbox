import fs from 'fs';
import path from 'path';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyRequestToken } from '../utils/verifyJWT';

const handler = async (request: VercelRequest, response: VercelResponse) => {
	if (!verifyRequestToken(request)) {
		return response.status(401).json({ status: false, message: 'Unauthorized' });
	}
	try {
		const filePath = path.join(process.cwd(), 'public', 'index.html');
		const htmlContent = fs.readFileSync(filePath, 'utf8');
		response.setHeader('Content-Type', 'text/html');
		response.send(htmlContent);
	} catch (error: any) {
		response.status(500).json({
			status: false,
			message: `Error: ${error.message}`,
		});
	}
};

export default handler;
