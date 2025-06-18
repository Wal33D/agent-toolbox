jest.mock('axios');
const axios = require('axios');
const { searchGoogle } = require('../functions/searchGoogle/googleWebSearch.ts');

const mockedAxios = /** @type {jest.Mocked<typeof axios>} */ (axios);

describe('searchGoogle', () => {
  beforeEach(() => {
    process.env.SCALE_SERP_API_KEY = 'key';
    process.env.NODE_ENV = 'test';
    mockedAxios.get.mockResolvedValue({
      data: {
        organic_results: [
          {
            title: 'Example',
            link: 'https://example.com',
            domain: 'example.com',
            displayed_link: 'example.com',
            snippet: 'Result',
          },
        ],
        search_metadata: { pages: [{ engine_url: 'engine', json_url: 'json' }] },
      },
    });
  });

  test('returns search results', async () => {
    const result = await searchGoogle({ method: 'GET', query: { searchTerm: 'test' } });
    expect(result).toEqual(
      expect.objectContaining({
        status: true,
        data: expect.objectContaining({ searchUrl: 'engine' }),
      }),
    );
  });
});

