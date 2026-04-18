import request from 'supertest';
import { app } from '../src/app';

describe('TV Details Route', () => {
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

  it('GET /tv/details?Id=1399 - should return transformed tv details', async () => {
    const mockTMDBResponse = {
      id: 1399,
      name: 'Game of Thrones', // Note: TV shows use 'name' instead of 'title' in TMDB
      genres: [
        { id: 10765, name: 'Sci-Fi & Fantasy' },
        { id: 18, name: 'Drama' },
      ],
      release_date: '2011-04-17', // Based on your controller expecting release_date
      number_of_episodes: 73,
      number_of_seasons: 8,
      overview: 'Seven noble families fight for control of the mythical land of Westeros.',
      poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTMDBResponse,
    } as Response);

    const response = await request(app).get('/tv/details?Id=1399');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 1399,
      title: 'Game of Thrones',
      genre: 'Sci-Fi & Fantasy, Drama',
      year: '2011-04-17',
      episodes: 73,
      seasons: 8,
      summary: 'Seven noble families fight for control of the mythical land of Westeros.',
      poster_url: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.themoviedb.org/3/tv/1399')
    );
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('api_key=test_api_key'));
  });

  it('GET /tv/details?Id=999999 - should return error from TMDB', async () => {
    const mockTMDBError = { status_message: 'The resource you requested could not be found.' };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => mockTMDBError,
    } as Response);

    const response = await request(app).get('/tv/details?Id=999999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(mockTMDBError);
  });

  it('GET /tv/details?Id=1399 - should handle fetch failure (502 Bad Gateway)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const response = await request(app).get('/tv/details?Id=1399');

    expect(response.status).toBe(502);
    expect(response.body).toEqual({ error: 'Failed to reach TMDB' });
  });

  it('GET /tv/details?Id=1399 - should handle missing poster and release date', async () => {
    const mockTMDBResponse = {
      id: 1399,
      name: 'TV Show without poster',
      genres: [{ id: 18, name: 'Drama' }],
      release_date: '',
      number_of_episodes: 10,
      number_of_seasons: 1,
      overview: 'No overview',
      poster_path: null,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTMDBResponse,
    } as Response);

    const response = await request(app).get('/tv/details?Id=1399');

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
