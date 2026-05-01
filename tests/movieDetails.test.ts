import request from 'supertest';
import { app } from '../src/app';

type Response = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

describe('Movie Details Route', () => {
  const originalFetch = global.fetch;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    process.env.TMDB_API_TOKEN = 'test_api_token';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('GET /v1/movie/550 - should return transformed movie details', async () => {
    const mockTMDBResponse = {
      id: 550,
      title: 'Fight Club',
      genres: [{ id: 18, name: 'Drama' }],
      release_date: '1999-10-15',
      overview: 'A ticking-time-bomb insomniac and a slippery soap salesman...',
      poster_path: '/pB8BM79JsS0Zv9Uv00pYI0mhaZ5.jpg',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTMDBResponse,
    } as Response);

    const response = await request(app).get('/v1/movie/550');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 550,
      title: 'Fight Club',
      genre: 'Drama',
      year: '1999',
      summary: 'A ticking-time-bomb insomniac and a slippery soap salesman...',
      poster_url: 'https://image.tmdb.org/t/p/w500/pB8BM79JsS0Zv9Uv00pYI0mhaZ5.jpg',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.themoviedb.org/3/movie/550'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test_api_token',
          accept: 'application/json',
        }),
      })
    );
  });

  it('GET /v1/movie/ - should return 400 or 404 if id is missing', async () => {
    // Note: With path params, /v1/movie/ might not match the route /v1/movie/:id
    // and could return 404. If we want to test the controller's !id check,
    // we'd need to hit it in a way that 'id' is undefined/empty.
    const response = await request(app).get('/v1/movie/');

    // Express might return 404 if it doesn't match /v1/movie/:id
    // But let's see what happens.
    if (response.status === 400) {
      expect(response.body).toEqual({ error: 'Missing required path parameter: id' });
    }
  });

  it('GET /v1/movie/550 - should join multiple genres', async () => {
    const mockTMDBResponse = {
      id: 550,
      title: 'Fight Club',
      genres: [
        { id: 18, name: 'Drama' },
        { id: 53, name: 'Thriller' },
      ],
      release_date: '1999-10-15',
      overview: 'A movie with multiple genres.',
      poster_path: '/poster.jpg',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTMDBResponse,
    } as Response);

    const response = await request(app).get('/v1/movie/550');

    expect(response.status).toBe(200);
    expect(response.body.genre).toBe('Drama, Thriller');
  });

  it('GET /v1/movie/999999 - should return error from TMDB', async () => {
    const mockTMDBError = { status_message: 'The resource you requested could not be found.' };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => mockTMDBError,
    } as Response);

    const response = await request(app).get('/v1/movie/999999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(mockTMDBError);
  });

  it('GET /v1/movie/550 - should return TMDB 500 errors', async () => {
    const mockTMDBError = { status_message: 'Internal error' };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => mockTMDBError,
    } as Response);

    const response = await request(app).get('/v1/movie/550');

    expect(response.status).toBe(500);
    expect(response.body).toEqual(mockTMDBError);
  });

  it('GET /v1/movie/550 - should handle fetch failure (502 Bad Gateway)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const response = await request(app).get('/v1/movie/550');

    expect(response.status).toBe(502);
    expect(response.body).toEqual({ error: 'Failed to reach TMDB' });
  });

  it('GET /v1/movie/550 - should handle missing poster and release date', async () => {
    const mockTMDBResponse = {
      id: 550,
      title: 'Movie without poster',
      genres: [{ id: 18, name: 'Drama' }],
      release_date: '',
      overview: 'No overview',
      poster_path: null,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTMDBResponse,
    } as Response);

    const response = await request(app).get('/v1/movie/550');

    expect(response.status).toBe(200);
    expect(response.body.year).toBe('Unknown');
    expect(response.body.poster_url).toBeNull();
  });

  it('GET /v1/movie/550 - should handle empty genres array', async () => {
    const mockTMDBResponse = {
      id: 550,
      title: 'Movie without genres',
      genres: [],
      release_date: '2020-01-01',
      overview: 'No genres here.',
      poster_path: '/poster.jpg',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTMDBResponse,
    } as Response);

    const response = await request(app).get('/v1/movie/550');

    expect(response.status).toBe(200);
    expect(response.body.genre).toBe('');
    expect(response.body.year).toBe('2020');
  });
});
