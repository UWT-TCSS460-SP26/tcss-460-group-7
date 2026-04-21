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
  original_title: 'Inception',
  overview: 'A thief who steals corporate secrets through dream-sharing technology.',
  release_date: '2010-07-16',
  genre_ids: [28, 878],
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  popularity: 120,
  vote_average: 8.4,
  vote_count: 36000,
  original_language: 'en',
  ...overrides,
});

describe('Movie Search Proxy Routes', () => {
  const originalToken = process.env.TMDB_API_TOKEN;

  beforeEach(() => {
    process.env.TMDB_API_TOKEN = 'test-token';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.TMDB_API_TOKEN = originalToken;
  });

  it('GET /v1/movie/search/title - returns formatted movie metadata with poster images', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({
        page: 1,
        total_pages: 1,
        total_results: 1,
        results: [movie()],
      }) as Awaited<ReturnType<typeof fetch>>
    );

    const response = await request(app).get('/v1/movie/search/title').query({ q: 'inception' });

    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/search/movie?query=inception',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
          accept: 'application/json',
        },
      })
    );
    expect(response.body).toEqual({
      page: 1,
      totalPages: 1,
      totalResults: 1,
      results: [
        {
          id: 1,
          title: 'Inception',
          originalTitle: 'Inception',
          overview: 'A thief who steals corporate secrets through dream-sharing technology.',
          releaseDate: '2010-07-16',
          genreIds: [28, 878],
          popularity: 120,
          voteAverage: 8.4,
          voteCount: 36000,
          originalLanguage: 'en',
          posterPath: '/poster.jpg',
          posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
          backdropPath: '/backdrop.jpg',
          backdropUrl: 'https://image.tmdb.org/t/p/w500/backdrop.jpg',
        },
      ],
    });
  });

  it('GET /v1/movie/search/title - encodes movie title queries', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({
        page: 1,
        total_pages: 1,
        total_results: 0,
        results: [],
      }) as Awaited<ReturnType<typeof fetch>>
    );

    const response = await request(app)
      .get('/v1/movie/search/title')
      .query({ q: 'spider man' });

    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/search/movie?query=spider%20man',
      expect.any(Object)
    );
  });

  it('GET /v1/movie/search/title - returns multiple formatted movie results', async () => {
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
            original_title: 'Interstellar',
            release_date: '2014-11-07',
            poster_path: '/interstellar.jpg',
            backdrop_path: '/interstellar-backdrop.jpg',
          }),
        ],
      }) as Awaited<ReturnType<typeof fetch>>
    );

    const response = await request(app).get('/v1/movie/search/title').query({ q: 'space' });

    expect(response.status).toBe(200);
    expect(response.body.totalResults).toBe(2);
    expect(response.body.results).toHaveLength(2);
    expect(response.body.results[1]).toMatchObject({
      id: 2,
      title: 'Interstellar',
      releaseDate: '2014-11-07',
      posterUrl: 'https://image.tmdb.org/t/p/w500/interstellar.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w500/interstellar-backdrop.jpg',
    });
  });

  it('GET /v1/movie/search/title - returns 500 when TMDB_API_TOKEN is missing', async () => {
    delete process.env.TMDB_API_TOKEN;
    global.fetch = jest.fn();

    const response = await request(app).get('/v1/movie/search/title').query({ q: 'inception' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'TMDB_API_TOKEN is not configured' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('GET /v1/movie/search/title - returns 400 when q is missing', async () => {
    global.fetch = jest.fn();

    const response = await request(app).get('/v1/movie/search/title');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 400,
      message: 'Missing required query parameter',
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('GET /v1/movie/search/title - returns 400 when q is blank', async () => {
    global.fetch = jest.fn();

    const response = await request(app).get('/v1/movie/search/title').query({ q: '   ' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 400,
      message: 'Missing required query parameter',
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('GET /v1/movie/search/title - returns TMDB error statuses', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        mockFetchResponse({ status_message: 'Invalid API key' }, 401) as Awaited<
          ReturnType<typeof fetch>
        >
      );

    const response = await request(app).get('/v1/movie/search/title').query({ q: 'inception' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 401,
      message: 'TMDB search request had failed',
    });
  });

  it('GET /v1/movie/search/title - returns null image URLs when paths are null', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({
        page: 1,
        total_pages: 1,
        total_results: 1,
        results: [movie({ poster_path: null, backdrop_path: null })],
      }) as Awaited<ReturnType<typeof fetch>>
    );

    const response = await request(app).get('/v1/movie/search/title').query({ q: 'inception' });

    expect(response.status).toBe(200);
    expect(response.body.results[0]).toMatchObject({
      posterPath: null,
      posterUrl: null,
      backdropPath: null,
      backdropUrl: null,
    });
  });
});
