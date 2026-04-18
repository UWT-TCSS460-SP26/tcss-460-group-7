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

const movie = (overrides = {}) => ({
  id: 1,
  title: 'Inception',
  overview: 'A thief who steals corporate secrets.',
  release_date: '2010-07-16',
  poster_path: '/poster.jpg',
  vote_average: 8.8,
  popularity: 95,
  ...overrides,
});

describe('Popular Movies Routes', () => {
  const originalToken = process.env.TMDB_API_TOKEN;

  beforeEach(() => {
    process.env.TMDB_API_TOKEN = 'test-token';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.TMDB_API_TOKEN = originalToken;
  });

  // --- Success ---
  it('GET /proxy/movies/popular - returns formatted popular movies', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({
        page: 1,
        total_pages: 10,
        total_results: 200,
        results: [movie()],
      }) as Awaited<ReturnType<typeof fetch>>
    );

    const response = await request(app).get('/proxy/movies/popular');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      page: 1,
      totalPages: 10,
      totalResults: 200,
      results: [
        {
          id: 1,
          title: 'Inception',
          overview: 'A thief who steals corporate secrets.',
          releaseDate: '2010-07-16',
          posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
          voteAverage: 8.8,
          popularity: 95,
        },
      ],
    });
  });

  // --- Missing Token ---
  it('GET /proxy/movies/popular - returns 500 when TMDB_API_TOKEN is missing', async () => {
    delete process.env.TMDB_API_TOKEN;

    const response = await request(app).get('/proxy/movies/popular');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'TMDB_API_TOKEN is not configured' });
  });

  // --- TMDB Error ---
  it('GET /proxy/movies/popular - returns TMDB error status when TMDB request fails', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({ status_message: 'Invalid API key' }, 401) as Awaited<ReturnType<typeof fetch>>
    );

    const response = await request(app).get('/proxy/movies/popular');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 401, message: 'TMDB search request had failed' });
  });

  // --- Null Poster ---
  it('GET /proxy/movies/popular - returns null posterUrl when poster_path is null', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({
        page: 1,
        total_pages: 1,
        total_results: 1,
        results: [movie({ poster_path: null })],
      }) as Awaited<ReturnType<typeof fetch>>
    );

    const response = await request(app).get('/proxy/movies/popular');

    expect(response.status).toBe(200);
    expect(response.body.results[0].posterUrl).toBeNull();
  });
});
