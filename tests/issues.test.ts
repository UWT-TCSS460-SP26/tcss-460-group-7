import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

jest.mock('../src/middleware/requireAuth', () => jest.requireActual('./__mocks__/requireAuth'));
jest.mock('../src/lib/prisma', () => jest.requireActual('./__mocks__/libPrisma'));

const { issuesRouter } = jest.requireActual(
  '../src/routes/database/issues'
) as typeof import('../src/routes/database/issues');
const { prisma } = jest.requireMock('../src/lib/prisma') as typeof import('../src/lib/prisma');

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/v1/issues', issuesRouter);
  return app;
};

const app = createApp();

describe('Issues API Endpoints', () => {
  let userToken: string;
  let adminToken: string;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    // role: 2 is User, role: 1 is Admin
    userToken = jwt.sign({ sub: 2, email: 'user@dev.local', role: 2 }, process.env.JWT_SECRET);
    adminToken = jwt.sign({ sub: 1, email: 'admin@dev.local', role: 1 }, process.env.JWT_SECRET);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 2, role: 2 });
  });

  describe('POST /v1/issues', () => {
    it('should create a new issue successfully for an authenticated user', async () => {
      const mockIssue = {
        id: 1,
        authorId: 2,
        content: 'The search bar is overlapping with the header on mobile.',
        createdAt: new Date().toISOString(),
      };
      (prisma.issue.create as jest.Mock).mockResolvedValue(mockIssue);

      const response = await request(app)
        .post('/v1/issues')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'The search bar is overlapping with the header on mobile.' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockIssue);
      expect(prisma.issue.create).toHaveBeenCalledWith({
        data: {
          authorId: 2,
          content: 'The search bar is overlapping with the header on mobile.',
        },
      });
    });

    it('should create a new issue successfully for an admin (since role 1 <= 2)', async () => {
      const mockIssue = {
        id: 2,
        authorId: 1,
        content: 'Admin reporting a bug.',
        createdAt: new Date().toISOString(),
      };
      (prisma.issue.create as jest.Mock).mockResolvedValue(mockIssue);

      const response = await request(app)
        .post('/v1/issues')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: 'Admin reporting a bug.' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockIssue);
    });

    it('should return 400 Bad Request if content is missing', async () => {
      const response = await request(app)
        .post('/v1/issues')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'The bug report payload is missing required fields or contains invalid values.'
      );
    });

    it('should return 400 Bad Request if content is empty string', async () => {
      const response = await request(app)
        .post('/v1/issues')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'The bug report payload is missing required fields or contains invalid values.'
      );
    });

    it('should return 401 Unauthorized if token is missing', async () => {
      const response = await request(app).post('/v1/issues').send({ content: 'Some bug' });

      expect(response.status).toBe(401);
    });
  });
});
