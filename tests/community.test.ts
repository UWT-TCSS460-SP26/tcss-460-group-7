import express from 'express';
import request from 'supertest';

jest.mock('../src/lib/prisma', () => jest.requireActual('./__mocks__/libPrisma'));

const { communityRouter } = jest.requireActual(
  '../src/routes/Front_End_API/community'
) as typeof import('../src/routes/Front_End_API/community');
const { prisma } = jest.requireMock('../src/lib/prisma') as typeof import('../src/lib/prisma');

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/v1/community', communityRouter);
  return app;
};

const app = createApp();

beforeAll(() => {
  process.env.TMDB_API_TOKEN = 'test-token';
});

afterEach(() => {
  jest.clearAllMocks();
});

const mockTmdbMovie = {
  id: 550,
  title: 'Fight Club',
  genres: [{ id: 18, name: 'Drama' }],
  release_date: '1999-10-15',
  overview: 'An insomniac office worker forms a fight club.',
  poster_path: '/poster.jpg',
};

const aggregateRows = [
  { title_id: BigInt(550), media_type: 'movie', avg_rating: '4.50', rating_count: BigInt(8) },
  { title_id: BigInt(246), media_type: 'tv', avg_rating: '4.00', rating_count: BigInt(5) },
];

describe('GET /v1/community/top-rated', () => {
  it('returns a ranked list enriched with TMDB metadata', async () => {
    (prisma.$queryRaw as jest.Mock)
      .mockResolvedValueOnce(aggregateRows)
      .mockResolvedValueOnce([{ total: BigInt(2) }]);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTmdbMovie,
    });

    const res = await request(app).get('/v1/community/top-rated');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0]).toMatchObject({
      rank: 1,
      title_id: 550,
      media_type: 'movie',
      avgRating: 4.5,
      ratingCount: 8,
      metadata: { id: 550, title: 'Fight Club', genre: 'Drama', year: '1999' },
    });
    expect(res.body.data[1]).toMatchObject({
      rank: 2,
      title_id: 246,
      media_type: 'tv',
    });
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
  });

  it('sets metadata to null when TMDB fails for an item', async () => {
    (prisma.$queryRaw as jest.Mock)
      .mockResolvedValueOnce([aggregateRows[0]])
      .mockResolvedValueOnce([{ total: BigInt(1) }]);

    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) });

    const res = await request(app).get('/v1/community/top-rated');

    expect(res.status).toBe(200);
    expect(res.body.data[0].metadata).toBeNull();
  });

  it('respects the minCount query param', async () => {
    (prisma.$queryRaw as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: BigInt(0) }]);

    global.fetch = jest.fn();

    const res = await request(app).get('/v1/community/top-rated?minCount=10');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('paginates correctly', async () => {
    (prisma.$queryRaw as jest.Mock)
      .mockResolvedValueOnce([aggregateRows[0]])
      .mockResolvedValueOnce([{ total: BigInt(15) }]);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTmdbMovie,
    });

    const res = await request(app).get('/v1/community/top-rated?page=2&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.pagination).toMatchObject({ page: 2, limit: 5, total: 15, totalPages: 3 });
    expect(res.body.data[0].rank).toBe(6);
  });

  it('is public — no token required', async () => {
    (prisma.$queryRaw as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: BigInt(0) }]);

    global.fetch = jest.fn();

    const res = await request(app).get('/v1/community/top-rated');

    expect(res.status).toBe(200);
  });
});
