import request from 'supertest';
import { app } from '../src/app';

describe('Movie Details Route', () => {
  const originalFetch = global.fetch;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    process.env.TMDB_API_KEY = 'test_api_key';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('GET /movie/details?Id=550 - should return transformed movie details', async () => {
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

    const response = await request(app).get('/movie/details?Id=550');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 550,
      title: 'Fight Club',
      genre: 'Drama',
      year: '1999-10-15',
      summary: 'A ticking-time-bomb insomniac and a slippery soap salesman...',
      poster_url: 'https://image.tmdb.org/t/p/w500/pB8BM79JsS0Zv9Uv00pYI0mhaZ5.jpg',
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.themoviedb.org/3/movie/550')
    );
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('api_key=test_api_key'));
  });

  it('GET /movie/details?Id=999999 - should return error from TMDB', async () => {
    const mockTMDBError = { status_message: 'The resource you requested could not be found.' };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => mockTMDBError,
    } as Response);

    const response = await request(app).get('/movie/details?Id=999999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(mockTMDBError);
  });

  it('GET /movie/details?Id=550 - should handle fetch failure (502 Bad Gateway)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const response = await request(app).get('/movie/details?Id=550');

    expect(response.status).toBe(502);
    expect(response.body).toEqual({ error: 'Failed to reach TMDB' });
  });

  it('GET /movie/details?Id=550 - should handle missing poster and release date', async () => {
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

    const response = await request(app).get('/movie/details?Id=550');

    expect(response.status).toBe(200);
    expect(response.body.year).toBe('Unknown');
    expect(response.body.poster_url).toBeNull();
  });

  /*
   * --- JEST FUNCTIONS EXPLAINED ---
   * .mockResolvedValueOnce() : Fakes a successful async response (Promise.resolve)
   *  for the very next time the mock is called. Allows faking API data without real network calls.
   *
   * .mockRejectedValueOnce() : Fakes an async crash or network error (Promise.reject)
   *  for the next call. Useful for testing error handling (catch blocks).
   *
   * .toHaveBeenCalledWith()  : Asserts that your code actually called the mock function
   * with specific arguments (e.g., making sure the fetch URL is correct).
   *
   * expect.stringContaining(): Used inside assertions when you only care that a string contains
   * a specific piece of text, rather than matching the whole exact string.
   */
});
