import request from 'supertest';
import { app } from '../src/app';

type MockFetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

const mockFetchResponse = (body: unknown, status = 200): MockFetchResponse => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const tvShow = (overrides = {}) => ({
  id: 1,
  name: 'Breaking Bad',
  overview: 'A chemistry teacher starts a new life.',
  first_air_date: '2008-01-20',
  poster_path: '/poster.jpg',
  vote_average: 8.9,
  popularity: 100,
  ...overrides,
});

describe('Popular TV Routes', () => {
  const originalToken = process.env.TMDB_API_TOKEN;

  beforeEach(() => {
    process.env.TMDB_API_TOKEN = 'test-token';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.TMDB_API_TOKEN = originalToken;
  });

  // --- Success ---
  it('GET /proxy/tv/popular - returns formatted popular TV shows', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({
        page: 1,
        total_pages: 10,
        total_results: 200,
        results: [tvShow()],
      }) as Awaited<ReturnType<typeof fetch>>
    );

    const response = await request(app).get('/proxy/tv/popular');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      page: 1,
      totalPages: 10,
      totalResults: 200,
      results: [
        {
          id: 1,
          name: 'Breaking Bad',
          overview: 'A chemistry teacher starts a new life.',
          firstAirDate: '2008-01-20',
          posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
          voteAverage: 8.9,
          popularity: 100,
        },
      ],
    });
  });

  // --- Missing Token ---
  it('GET /proxy/tv/popular - returns 500 when TMDB_API_TOKEN is missing', async () => {
    delete process.env.TMDB_API_TOKEN;

    const response = await request(app).get('/proxy/tv/popular');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'TMDB_API_TOKEN is not configured' });
  });

  // --- TMDB Error ---
  it('GET /proxy/tv/popular - returns TMDB error status when TMDB request fails', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        mockFetchResponse({ status_message: 'Invalid API key' }, 401) as Awaited<
          ReturnType<typeof fetch>
        >
      );

    const response = await request(app).get('/proxy/tv/popular');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 401, message: 'TMDB search request had failed' });
  });

  // --- Null Poster ---
  it('GET /proxy/tv/popular - returns null posterUrl when poster_path is null', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({
        page: 1,
        total_pages: 1,
        total_results: 1,
        results: [tvShow({ poster_path: null })],
      }) as Awaited<ReturnType<typeof fetch>>
    );

    const response = await request(app).get('/proxy/tv/popular');

    expect(response.status).toBe(200);
    expect(response.body.results[0].posterUrl).toBeNull();
  });
});
