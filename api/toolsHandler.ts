// Communication functions
import { handleToolOptions } from '../functions/handleToolOptions';
import { verifyRequestToken } from '../utils/verifyJWT';
import { toolsMap } from './toolsMap';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface AIRequest {
	functionName: string;
	[key: string]: any;
}

const handler = async (
        request: VercelRequest,
        response: VercelResponse,
) => {
	if (request.method === 'OPTIONS') {
		return await handleToolOptions(response);
	}
	const verification = verifyRequestToken(request);
	if (!verification.valid) {
		return response.status(401).json({ error: verification.error });
	}
	try {
		let functionName: string | null = null;

		if (request.method === 'POST') {
			const body: AIRequest = request.body;
			functionName = body.functionName ? body.functionName.toLowerCase() : null;
		} else {
			throw new Error('Invalid request method');
		}

		const processRequest = async (req: any) => {
			console.log({ functionName, request: req.body });
			const handler = toolsMap[functionName as string];
			if (!handler) {
				throw new Error('Invalid function name.');
			}
			return await handler(req);
		};

		const responseData = await processRequest(request);
		response.status(200).json(responseData);
	} catch (error: any) {
		response.status(400).json({ error: error.message });
	}
};

export default handler;
