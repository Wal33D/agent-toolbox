import axios from 'axios';
import cheerio from 'cheerio';
import { VercelRequest } from '@vercel/node';
import { parseQueryParams } from '../../utils/parseQueryParams';

interface ScrapeRequestBody {
  url: string;
}

export const fetchTextContentOfWebsite = async (request: VercelRequest) => {
  try {
    let requests: ScrapeRequestBody[];
    if (request.method === 'GET') {
      requests = [parseQueryParams(request.query) as ScrapeRequestBody];
    } else if (request.method === 'POST') {
      requests = Array.isArray(request.body) ? request.body : [request.body];
    } else {
      throw new Error('Invalid request method');
    }

    if (requests.length > 50) {
      return {
        status: false,
        message: 'Too many requests. Please provide 50 or fewer requests in a single call.',
        data: [],
      };
    }

    const results = await Promise.all(
      requests.map(async ({ url }) => {
        if (!url) {
          return { status: false, message: 'URL is required' };
        }
        try {
          const axiosResponse = await axios.get(url);
          const $ = cheerio.load(axiosResponse.data);
          const textContent = $('body').text().trim();
          return { status: true, data: textContent };
        } catch (error: any) {
          return { status: false, message: `Failed to retrieve content for URL "${url}": ${error.message}` };
        }
      })
    );

    return { status: true, message: 'Webpage text content retrieved successfully.', data: results };
  } catch (error: any) {
    return { status: false, message: `Error: ${error.message}` };
  }
};
