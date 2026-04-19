import request from 'supertest';
import { app } from '../src/app';

type Response = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

describe('TV Details Route', () => {
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

  it('GET /tv/details?Id=246 - should return transformed tv details for Avatar: The Last Airbender', async () => {
    const mockTMDBResponse = {
      id: 246,
      name: 'Avatar: The Last Airbender',
      genres: [
        { id: 10759, name: 'Action & Adventure' },
        { id: 16, name: 'Animation' },
        { id: 10762, name: 'Kids' },
      ],
      first_air_date: '2005-02-21',
      number_of_episodes: 61,
      number_of_seasons: 3,
      overview:
        'In a war-torn world of elemental magic, a young boy reawakens to undertake a dangerous mystic quest to fulfill his destiny as the Avatar, and bring peace to the world.',
      poster_path: '/cZ0d3rtvX5s1bUu3Wej2p3m2g2Y.jpg',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTMDBResponse,
    } as Response);

    const response = await request(app).get('/tv/details?Id=246');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 246,
      title: 'Avatar: The Last Airbender',
      genre: 'Action & Adventure, Animation, Kids',
      year: '2005-02-21',
      episodes: 61,
      seasons: 3,
      summary:
        'In a war-torn world of elemental magic, a young boy reawakens to undertake a dangerous mystic quest to fulfill his destiny as the Avatar, and bring peace to the world.',
      poster_url: 'https://image.tmdb.org/t/p/w500/cZ0d3rtvX5s1bUu3Wej2p3m2g2Y.jpg',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.themoviedb.org/3/tv/246'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test_api_token',
          accept: 'application/json',
        }),
      })
    );
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

  it('GET /tv/details?Id=246 - should handle fetch failure (502 Bad Gateway)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const response = await request(app).get('/tv/details?Id=246');

    expect(response.status).toBe(502);
    expect(response.body).toEqual({ error: 'Failed to reach TMDB' });
  });

  it('GET /tv/details?Id=246 - should handle missing poster and release date', async () => {
    const mockTMDBResponse = {
      id: 246,
      name: 'TV Show without poster',
      genres: [{ id: 18, name: 'Drama' }],
      first_air_date: '',
      number_of_episodes: 10,
      number_of_seasons: 1,
      overview: 'No overview',
      poster_path: null,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTMDBResponse,
    } as Response);

    const response = await request(app).get('/tv/details?Id=246');

    expect(response.status).toBe(200);
    expect(response.body.year).toBe('Unknown');
    expect(response.body.poster_url).toBeNull();
  });

  it('GET /tv/details?Id=246 - should handle empty genres array', async () => {
    const mockTMDBResponse = {
      id: 246,
      name: 'TV Show with no genres',
      genres: [], // Empty genres array
      first_air_date: '2022-01-01',
      number_of_episodes: 1,
      number_of_seasons: 1,
      overview: 'An overview.',
      poster_path: '/poster.jpg',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTMDBResponse,
    } as Response);

    const response = await request(app).get('/tv/details?Id=246');

    expect(response.status).toBe(200);
    expect(response.body.genre).toBe(''); // Expect an empty string
  });
});
