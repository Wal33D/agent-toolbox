import { handleGetRequest } from '../functions/handleGetRequest';
import { handlePostRequest } from '../functions/handlePostRequest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

type MethodHandlers = {
	[key in 'GET' | 'POST']: (params: { request: VercelRequest; response: VercelResponse }) => Promise<void>;
};

const methodHandlers: MethodHandlers = {
	GET: handleGetRequest,
	POST: handlePostRequest,
};

const handler = async (request: VercelRequest, response: VercelResponse) => {
	try {
		const method = request.method as keyof MethodHandlers;

		if (method in methodHandlers) {
			return methodHandlers[method]({ request, response });
		}

		response.status(405).json({
			status: false,
			message: `Method ${request.method} not allowed`,
		});
	} catch (error: any) {
		response.status(500).json({
			status: false,
			message: `Error: ${error.message}`,
		});
	}
};

export default handler;
