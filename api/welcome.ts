import fs from 'fs';
import path from 'path';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const handler = async (_request: VercelRequest, response: VercelResponse) => {
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
