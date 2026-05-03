import express from 'express';
import request from 'supertest';
import { getMediaWithReviews } from '../src/controllers/Front_End_API/mediaWithReviews';
import { prisma } from '../src/lib/prisma';

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    rating: {
      findMany: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

type MockFetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

const createApp = () => {
  const app = express();
  app.get('/v1/media/:mediaType/:id', getMediaWithReviews);
  return app;
};

const mockFetchResponse = (body: unknown, status = 200): MockFetchResponse => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

describe('Media With Reviews Controller', () => {
  const originalFetch = global.fetch;
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TMDB_API_TOKEN = 'test_api_token';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('GET /v1/media/movie/:id returns enriched movie metadata with community stats', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({
        id: 550,
        title: 'Fight Club',
        genres: [{ id: 18, name: 'Drama' }],
        release_date: '1999-10-15',
        overview: 'A ticking-time-bomb insomniac and a slippery soap salesman...',
        poster_path: '/pB8BM79JsS0Zv9Uv00pYI0mhaZ5.jpg',
      }) as Awaited<ReturnType<typeof fetch>>
    );

    (prisma.rating.findMany as jest.Mock).mockResolvedValue([{ rating: 4 }, { rating: 5 }]);
    (prisma.review.findMany as jest.Mock).mockResolvedValue([
      {
        id: 12,
        authorId: 3,
        header: 'Worth it',
        content: 'Really strong performances.',
        upvotes: 4,
        downvotes: 0,
        createdAt: new Date('2026-05-01T00:00:00.000Z'),
        author: {
          id: 3,
          username: 'kassie',
          display_name: 'Kassie',
        },
      },
    ]);
    (prisma.review.count as jest.Mock).mockResolvedValue(1);

    const response = await request(app).get('/v1/media/movie/550');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      mediaType: 'movie',
      metadata: {
        id: 550,
        title: 'Fight Club',
        genre: 'Drama',
        year: '1999',
        summary: 'A ticking-time-bomb insomniac and a slippery soap salesman...',
        poster_url: 'https://image.tmdb.org/t/p/w500/pB8BM79JsS0Zv9Uv00pYI0mhaZ5.jpg',
      },
      community: {
        averageRating: 4.5,
        ratingCount: 2,
        reviewCount: 1,
      },
      recentReviews: [
        {
          id: 12,
          authorId: 3,
          header: 'Worth it',
          content: 'Really strong performances.',
          upvotes: 4,
          downvotes: 0,
          createdAt: '2026-05-01T00:00:00.000Z',
          author: {
            id: 3,
            username: 'kassie',
            display_name: 'Kassie',
          },
        },
      ],
    });
  });

  it('GET /v1/media/tv/:id returns enriched TV metadata and null aggregate when unrated', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse({
        id: 246,
        name: 'Avatar: The Last Airbender',
        genres: [{ id: 16, name: 'Animation' }],
        first_air_date: '2005-02-21',
        number_of_episodes: 61,
        number_of_seasons: 3,
        overview: 'A young Avatar must bring peace to the world.',
        poster_path: '/avatar.jpg',
      }) as Awaited<ReturnType<typeof fetch>>
    );

    (prisma.rating.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.review.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.review.count as jest.Mock).mockResolvedValue(0);

    const response = await request(app).get('/v1/media/tv/246');

    expect(response.status).toBe(200);
    expect(response.body.community).toEqual({
      averageRating: null,
      ratingCount: 0,
      reviewCount: 0,
    });
    expect(response.body.metadata).toMatchObject({
      id: 246,
      title: 'Avatar: The Last Airbender',
      genre: 'Animation',
      year: '2005',
      episodes: 61,
      seasons: 3,
    });
    expect(response.body.recentReviews).toEqual([]);
  });

  it('GET /v1/media/:mediaType/:id returns 400 for invalid media type', async () => {
    const response = await request(app).get('/v1/media/book/550');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'mediaType must be movie or tv' });
  });

  it('GET /v1/media/:mediaType/:id returns 400 for invalid id', async () => {
    const response = await request(app).get('/v1/media/movie/0');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'id must be a positive integer' });
  });

  it('GET /v1/media/:mediaType/:id passes TMDB errors through', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        mockFetchResponse(
          { status_message: 'The resource you requested could not be found.' },
          404
        ) as Awaited<ReturnType<typeof fetch>>
      );

    const response = await request(app).get('/v1/media/movie/999999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status_message: 'The resource you requested could not be found.',
    });
  });

  it('GET /v1/media/:mediaType/:id returns 502 on fetch failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const response = await request(app).get('/v1/media/movie/550');

    expect(response.status).toBe(502);
    expect(response.body).toEqual({ error: 'Failed to build enriched media response' });
  });
});
