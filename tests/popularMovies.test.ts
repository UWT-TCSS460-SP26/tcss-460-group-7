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
  it('GET /v1/movies/popular - returns formatted popular movies', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({
        page: 1,
        total_pages: 10,
        total_results: 200,
        results: [movie()],
      }) as Awaited<ReturnType<typeof fetch>>
    );

    const response = await request(app).get('/v1/movies/popular');

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

  it('GET /v1/movies/popular - forwards language, page, and region query params', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({
        page: 3,
        total_pages: 10,
        total_results: 200,
        results: [],
      }) as Awaited<ReturnType<typeof fetch>>
    );

    const response = await request(app)
      .get('/v1/movies/popular')
      .query({ language: 'es-MX', page: '3', region: 'MX' });

    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/movie/popular?language=es-MX&page=3&region=MX',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
          accept: 'application/json',
        },
      })
    );
    expect(response.body).toMatchObject({
      page: 3,
      totalPages: 10,
      totalResults: 200,
      results: [],
    });
  });

  it('GET /v1/movies/popular - uses default language and page when query params are omitted', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({
        page: 1,
        total_pages: 1,
        total_results: 0,
        results: [],
      }) as Awaited<ReturnType<typeof fetch>>
    );

    const response = await request(app).get('/v1/movies/popular');

    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1',
      expect.any(Object)
    );
  });

  it('GET /v1/movies/popular - formats multiple movie results', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({
        page: 1,
        total_pages: 1,
        total_results: 2,
        results: [
          movie({ id: 1, title: 'Inception' }),
          movie({
            id: 2,
            title: 'Interstellar',
            release_date: '2014-11-07',
            poster_path: '/interstellar.jpg',
          }),
        ],
      }) as Awaited<ReturnType<typeof fetch>>
    );

    const response = await request(app).get('/v1/movies/popular');

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(2);
    expect(response.body.results[1]).toMatchObject({
      id: 2,
      title: 'Interstellar',
      releaseDate: '2014-11-07',
      posterUrl: 'https://image.tmdb.org/t/p/w500/interstellar.jpg',
    });
  });

  // --- Missing Token ---
  it('GET /v1/movies/popular - returns 500 when TMDB_API_TOKEN is missing', async () => {
    delete process.env.TMDB_API_TOKEN;

    const response = await request(app).get('/v1/movies/popular');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'The server is missing required configuration for TMDB_API_TOKEN.',
    });
  });

  // --- TMDB Error ---
  it('GET /v1/movies/popular - returns TMDB error status when TMDB request fails', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        mockFetchResponse({ status_message: 'Invalid API key' }, 401) as Awaited<
          ReturnType<typeof fetch>
        >
      );

    const response = await request(app).get('/v1/movies/popular');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 401,
      message: 'TMDB could not retrieve the list of popular movies.',
    });
  });

  it('GET /v1/movies/popular - returns 503 when TMDB is unavailable', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        mockFetchResponse({ status_message: 'Service unavailable' }, 503) as Awaited<
          ReturnType<typeof fetch>
        >
      );

    const response = await request(app).get('/v1/movies/popular');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: 503,
      message: 'TMDB could not retrieve the list of popular movies.',
    });
  });

  // --- Null Poster ---
  it('GET /v1/movies/popular - returns null posterUrl when poster_path is null', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({
        page: 1,
        total_pages: 1,
        total_results: 1,
        results: [movie({ poster_path: null })],
      }) as Awaited<ReturnType<typeof fetch>>
    );

    const response = await request(app).get('/v1/movies/popular');

    expect(response.status).toBe(200);
    expect(response.body.results[0].posterUrl).toBeNull();
  });
});
