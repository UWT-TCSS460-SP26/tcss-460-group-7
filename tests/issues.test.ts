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
    userToken = jwt.sign({ sub: 2, email: 'user@dev.local', role: 2 }, process.env.JWT_SECRET);
    adminToken = jwt.sign({ sub: 1, email: 'admin@dev.local', role: 1 }, process.env.JWT_SECRET);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 2, role: 2 });
  });

  describe('POST /v1/issues', () => {
    it('should create a new issue successfully without authentication', async () => {
      const mockIssue = {
        id: 1,
        title: 'Bug title',
        description: 'Bug description',
        reproSteps: 'Step 1...',
        reporterContact: 'tester@example.com',
        status: 'UNSOLVED',
        createdAt: new Date().toISOString(),
        authorId: null,
      };
      (prisma.issue.create as jest.Mock).mockResolvedValue(mockIssue);

      const payload = {
        title: 'Bug title',
        description: 'Bug description',
        reproSteps: 'Step 1...',
        reporterContact: 'tester@example.com',
      };

      const response = await request(app).post('/v1/issues').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockIssue);
      expect(prisma.issue.create).toHaveBeenCalledWith({
        data: {
          ...payload,
          authorId: undefined, // undefined because no user in request
        },
      });
    });

    it('should return 400 Bad Request if title or description is missing', async () => {
      const response = await request(app).post('/v1/issues').send({ title: 'Only title' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid bug report format');
      expect(response.body.details).toContainEqual(
        expect.objectContaining({ path: ['description'] })
      );
    });

    it('should return 400 Bad Request if title is empty string', async () => {
      const response = await request(app)
        .post('/v1/issues')
        .send({ title: '   ', description: 'Some description' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid bug report format');
    });
  });

  describe('PATCH /v1/issues/:id/status', () => {
    it('should allow an admin to update the status', async () => {
      const mockUpdatedIssue = {
        id: 1,
        status: 'IN_PROGRESS',
      };
      (prisma.issue.update as jest.Mock).mockResolvedValue(mockUpdatedIssue);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, role: 1 });

      const response = await request(app)
        .patch('/v1/issues/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('IN_PROGRESS');
      expect(prisma.issue.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'IN_PROGRESS' },
      });
    });

    it('should return 403 Forbidden for a regular user', async () => {
      const response = await request(app)
        .patch('/v1/issues/1/status')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'FIXED' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });

    it('should return 400 Bad Request for an invalid status', async () => {
      const response = await request(app)
        .patch('/v1/issues/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid status update');
    });

    it('should return 404 Not Found if issue does not exist', async () => {
      const { Prisma } = jest.requireActual('@prisma/client');
      (prisma.issue.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record to update not found', {
          code: 'P2025',
          clientVersion: 'x.x.x',
        })
      );
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, role: 1 });

      const response = await request(app)
        .patch('/v1/issues/999/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'FIXED' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Issue not found');
    });
  });
});
