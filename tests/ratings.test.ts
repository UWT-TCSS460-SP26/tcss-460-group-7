import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import type * as RatingController from '../src/controllers/database/rating';
import type { app as ExpressApp } from '../src/app';

jest.mock('../src/middleware/requireAuth', () => jest.requireActual('./__mocks__/requireAuth'));

const mockPrisma = {
  rating: {
    count: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
};

jest.mock('../src/prisma', () => ({ prisma: mockPrisma }));
jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));

const TEST_SECRET = 'test-secret';

let createRating: typeof RatingController.createRating;
let deleteRating: typeof RatingController.deleteRating;
let getAllUserRating: typeof RatingController.getAllUserRating;
let getRatingByUserIdMovieId: typeof RatingController.getRatingByUserIdMovieId;
let getRatingsBTitleId: typeof RatingController.getRatingsBTitleId;
let updateUsersRating: typeof RatingController.updateUsersRating;
let app: typeof ExpressApp;

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
  return Promise.all([import('../src/controllers/database/rating'), import('../src/app')]).then(
    ([ratingController, appModule]) => {
      createRating = ratingController.createRating;
      deleteRating = ratingController.deleteRating;
      getAllUserRating = ratingController.getAllUserRating;
      getRatingByUserIdMovieId = ratingController.getRatingByUserIdMovieId;
      getRatingsBTitleId = ratingController.getRatingsBTitleId;
      updateUsersRating = ratingController.updateUsersRating;
      app = appModule.app;
    }
  );
});

type MockResponse = Response & {
  status: jest.Mock;
  json: jest.Mock;
};

const makeResponse = (): MockResponse => {
  const response = {} as MockResponse;
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response;
};

const makeRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    body: {},
    params: {},
    query: {},
    user: { sub: '7', id: 7, role: 2 },
    ...overrides,
  }) as Request;

const ratingRecord = (overrides = {}) => ({
  id: 1,
  authorId: 7,
  rating: 4,
  title_id: 99,
  author: {
    id: 7,
    display_name: 'Tester',
  },
  ...overrides,
});

const makeToken = (overrides: Partial<{ sub: number; email: string; role: number }> = {}) =>
  jwt.sign(
    {
      sub: 7,
      email: 'tester@example.com',
      role: 2,
      ...overrides,
    },
    TEST_SECRET
  );

describe('Rating Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue({ id: 7, role: 2 });
  });

  describe('createRating', () => {
    it('creates a rating', async () => {
      const request = makeRequest({
        params: { title_id: '99' },
        body: { rating: 4 },
      });
      const response = makeResponse();

      mockPrisma.rating.create.mockResolvedValue(ratingRecord());

      await createRating(request, response);

      expect(mockPrisma.rating.create).toHaveBeenCalledWith({
        data: { authorId: 7, title_id: 99, rating: 4 },
        include: { author: { select: { id: true, display_name: true } } },
      });
      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalledWith({ data: ratingRecord() });
    });

    it('updates when a duplicate rating already exists', async () => {
      const request = makeRequest({
        params: { title_id: '99' },
        body: { rating: 5 },
      });
      const response = makeResponse();

      mockPrisma.rating.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: 'test',
        })
      );
      mockPrisma.rating.update.mockResolvedValue(ratingRecord({ rating: 5 }));

      await createRating(request, response);

      expect(mockPrisma.rating.update).toHaveBeenCalledWith({
        where: {
          authorId_title_id: {
            authorId: 7,
            title_id: 99,
          },
        },
        data: { rating: 5 },
        include: { author: { select: { id: true, display_name: true } } },
      });
      expect(response.json).toHaveBeenCalledWith({ data: ratingRecord({ rating: 5 }) });
    });

    it('returns 400 when duplicate recovery update fails', async () => {
      const request = makeRequest({
        params: { title_id: '99' },
        body: { rating: 5 },
      });
      const response = makeResponse();

      mockPrisma.rating.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: 'test',
        })
      );
      mockPrisma.rating.update.mockRejectedValue(new Error('update failed'));

      await createRating(request, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({ error: 'Failed to update rating' });
    });

    it('returns 500 for unexpected create failures', async () => {
      const request = makeRequest({
        params: { title_id: '99' },
        body: { rating: 4 },
      });
      const response = makeResponse();

      mockPrisma.rating.create.mockRejectedValue(new Error('db down'));

      await createRating(request, response);

      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({
        error: "Something happened and could'nt reach the server to update",
      });
    });
  });

  describe('getRatingsBTitleId', () => {
    it('returns all ratings for a title', async () => {
      const request = makeRequest({ params: { title_id: '99' } });
      const response = makeResponse();

      mockPrisma.rating.findMany.mockResolvedValue([ratingRecord(), ratingRecord({ id: 2 })]);

      await getRatingsBTitleId(request, response);

      expect(mockPrisma.rating.findMany).toHaveBeenCalledWith({
        where: { title_id: 99 },
        include: { author: { select: { id: true, display_name: true } } },
      });
      expect(response.json).toHaveBeenCalledWith({
        data: [ratingRecord(), ratingRecord({ id: 2 })],
      });
    });

    it('returns 404 when a title has no ratings', async () => {
      const request = makeRequest({ params: { title_id: '99' } });
      const response = makeResponse();

      mockPrisma.rating.findMany.mockResolvedValue([]);

      await getRatingsBTitleId(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({ error: 'The movie has no ratings.' });
    });
  });

  describe('getRatingByUserIdMovieId', () => {
    it('returns a single user rating for a title', async () => {
      const request = makeRequest({ params: { authorId: '7', title_id: '99' } });
      const response = makeResponse();

      mockPrisma.rating.findUnique.mockResolvedValue(ratingRecord());

      await getRatingByUserIdMovieId(request, response);

      expect(mockPrisma.rating.findUnique).toHaveBeenCalledWith({
        where: {
          authorId_title_id: {
            authorId: 7,
            title_id: 99,
          },
        },
        include: { author: { select: { id: true, display_name: true } } },
      });
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({ data: ratingRecord() });
    });

    it('returns 404 when the rating does not exist', async () => {
      const request = makeRequest({ params: { authorId: '7', title_id: '99' } });
      const response = makeResponse();

      mockPrisma.rating.findUnique.mockResolvedValue(null);

      await getRatingByUserIdMovieId(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'The user had not made a rating for the title',
      });
    });
  });

  describe('updateUsersRating', () => {
    it('updates a rating', async () => {
      const request = makeRequest({
        params: { title_id: '99' },
        body: { rating: 2 },
      });
      const response = makeResponse();

      mockPrisma.rating.update.mockResolvedValue(ratingRecord({ rating: 2 }));

      await updateUsersRating(request, response);

      expect(mockPrisma.rating.update).toHaveBeenCalledWith({
        where: {
          authorId_title_id: {
            authorId: 7,
            title_id: 99,
          },
        },
        data: { rating: 2 },
        include: { author: { select: { id: true, display_name: true } } },
      });
      expect(response.json).toHaveBeenCalledWith({ data: ratingRecord({ rating: 2 }) });
    });

    it('returns 404 when the rating cannot be found', async () => {
      const request = makeRequest({
        params: { title_id: '99' },
        body: { rating: 2 },
      });
      const response = makeResponse();

      mockPrisma.rating.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('missing', {
          code: 'P2025',
          clientVersion: 'test',
        })
      );

      await updateUsersRating(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({ error: 'rating not found' });
    });
  });

  describe('getAllUserRating', () => {
    it('returns paginated ratings for a user', async () => {
      const request = makeRequest({
        params: { authorId: '7' },
        query: { page: '2' },
      });
      const response = makeResponse();

      mockPrisma.rating.count.mockResolvedValue(12);
      mockPrisma.rating.findMany.mockResolvedValue([
        ratingRecord({ id: 12 }),
        ratingRecord({ id: 11, title_id: 98 }),
      ]);

      await getAllUserRating(request, response);

      expect(mockPrisma.rating.count).toHaveBeenCalledWith({ where: { authorId: 7 } });
      expect(mockPrisma.rating.findMany).toHaveBeenCalledWith({
        where: { authorId: 7 },
        include: {
          author: { select: { id: true, display_name: true } },
        },
        orderBy: { id: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        data: [ratingRecord({ id: 12 }), ratingRecord({ id: 11, title_id: 98 })],
        pagination: {
          page: 2,
          pageSize: 10,
          totalRatings: 12,
          totalPages: 2,
        },
      });
    });

    it('returns 400 when the author id is invalid', async () => {
      const request = makeRequest({ params: { authorId: '0' } });
      const response = makeResponse();

      await getAllUserRating(request, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({ error: 'A valid authorId is required' });
    });

    it('returns 400 when the page is invalid', async () => {
      const request = makeRequest({
        params: { authorId: '7' },
        query: { page: '0' },
      });
      const response = makeResponse();

      await getAllUserRating(request, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({ error: 'Page must be a positive integer' });
    });
  });

  describe('deleteRating', () => {
    it('deletes a rating', async () => {
      const request = makeRequest({ params: { title_id: '99' } });
      const response = makeResponse();

      mockPrisma.rating.delete.mockResolvedValue(ratingRecord());

      await deleteRating(request, response);

      expect(mockPrisma.rating.delete).toHaveBeenCalledWith({
        where: {
          authorId_title_id: {
            authorId: 7,
            title_id: 99,
          },
        },
        include: { author: { select: { id: true, display_name: true } } },
      });
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({ data: ratingRecord() });
    });

    it('returns 400 when the title id is invalid', async () => {
      const request = makeRequest({ params: { title_id: '0' } });
      const response = makeResponse();

      await deleteRating(request, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({ error: 'A valid title_id is required' });
    });

    it('returns 404 when the rating cannot be found', async () => {
      const request = makeRequest({ params: { title_id: '99' } });
      const response = makeResponse();

      mockPrisma.rating.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('missing', {
          code: 'P2025',
          clientVersion: 'test',
        })
      );

      await deleteRating(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({ error: 'Rating not found' });
    });
  });
});

describe('Rating Routes', () => {
  const authHeader = () => ({ Authorization: `Bearer ${makeToken()}` });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue({ id: 7, role: 2 });
  });

  describe('POST /v1/ratings/:title_id', () => {
    it('creates a rating', async () => {
      mockPrisma.rating.create.mockResolvedValue(ratingRecord());

      const response = await request(app)
        .post('/v1/ratings/99')
        .set(authHeader())
        .send({ rating: 4 });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ data: ratingRecord() });
    });

    it('returns 401 without auth', async () => {
      const response = await request(app).post('/v1/ratings/99').send({ rating: 4 });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Missing or malformed Authorization header' });
    });

    it('returns 400 for invalid rating input', async () => {
      const response = await request(app)
        .post('/v1/ratings/99')
        .set(authHeader())
        .send({ rating: 'bad' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'rating must be an integer' });
    });
  });

  describe('GET /v1/ratings/title/:title_id', () => {
    it('returns title ratings', async () => {
      mockPrisma.rating.findMany.mockResolvedValue([ratingRecord()]);

      const response = await request(app).get('/v1/ratings/title/99').set(authHeader());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: [ratingRecord()] });
    });

    it('returns 400 for invalid title_id', async () => {
      const response = await request(app).get('/v1/ratings/title/0').set(authHeader());

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'title_id must be a positive integer' });
    });
  });

  describe('GET /v1/ratings/user/:authorId/title/:title_id', () => {
    it('returns one user rating for one title', async () => {
      mockPrisma.rating.findUnique.mockResolvedValue(ratingRecord());

      const response = await request(app).get('/v1/ratings/user/7/title/99').set(authHeader());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: ratingRecord() });
    });

    it('returns 400 for invalid authorId', async () => {
      const response = await request(app).get('/v1/ratings/user/0/title/99').set(authHeader());

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'authorId must be a positive integer' });
    });
  });

  describe('PATCH /v1/ratings/:title_id', () => {
    it('updates a rating', async () => {
      mockPrisma.rating.update.mockResolvedValue(ratingRecord({ rating: 2 }));

      const response = await request(app)
        .patch('/v1/ratings/99')
        .set(authHeader())
        .send({ rating: 2 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: ratingRecord({ rating: 2 }) });
    });

    it('returns 404 when the rating is missing', async () => {
      mockPrisma.rating.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('missing', {
          code: 'P2025',
          clientVersion: 'test',
        })
      );

      const response = await request(app)
        .patch('/v1/ratings/99')
        .set(authHeader())
        .send({ rating: 2 });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'rating not found' });
    });
  });

  describe('GET /v1/ratings/user/:authorId', () => {
    it('returns paginated ratings', async () => {
      mockPrisma.rating.count.mockResolvedValue(12);
      mockPrisma.rating.findMany.mockResolvedValue([
        ratingRecord({ id: 12 }),
        ratingRecord({ id: 11, title_id: 98 }),
      ]);

      const response = await request(app)
        .get('/v1/ratings/user/7')
        .query({ page: 2 })
        .set(authHeader());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: [ratingRecord({ id: 12 }), ratingRecord({ id: 11, title_id: 98 })],
        pagination: {
          page: 2,
          pageSize: 10,
          totalRatings: 12,
          totalPages: 2,
        },
      });
    });

    it('returns 400 for invalid page', async () => {
      const response = await request(app)
        .get('/v1/ratings/user/7')
        .query({ page: 0 })
        .set(authHeader());

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'page must be a positive integer' });
    });
  });

  describe('DELETE /v1/ratings/:title_id', () => {
    it('deletes a rating', async () => {
      mockPrisma.rating.delete.mockResolvedValue(ratingRecord());

      const response = await request(app).delete('/v1/ratings/99').set(authHeader());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: ratingRecord() });
    });

    it('returns 404 when the rating does not exist', async () => {
      mockPrisma.rating.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('missing', {
          code: 'P2025',
          clientVersion: 'test',
        })
      );

      const response = await request(app).delete('/v1/ratings/99').set(authHeader());

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Rating not found' });
    });
  });
});
