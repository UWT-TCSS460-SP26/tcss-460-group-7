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

  describe('GET /v1/issues', () => {
    it('should return all issues for an admin user', async () => {
      const mockIssues = [
        {
          id: 1,
          priority: 2,
          authorId: 2,
          content: 'General bug report.',
          createdAt: new Date().toISOString(),
          author: {
            id: 2,
            username: 'user',
            display_name: 'User',
            email: 'user@dev.local',
          },
        },
      ];
      (prisma.issue.findMany as jest.Mock).mockResolvedValue(mockIssues);

      const response = await request(app)
        .get('/v1/issues')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockIssues);
      expect(prisma.issue.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          author: {
            select: {
              id: true,
              username: true,
              display_name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should filter issues by priority for an admin user', async () => {
      const mockIssues = [
        {
          id: 2,
          priority: 1,
          authorId: 2,
          content: 'Critical bug report.',
          createdAt: new Date().toISOString(),
          author: {
            id: 2,
            username: 'user',
            display_name: 'User',
            email: 'user@dev.local',
          },
        },
      ];
      (prisma.issue.findMany as jest.Mock).mockResolvedValue(mockIssues);

      const response = await request(app)
        .get('/v1/issues?priority=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockIssues);
      expect(prisma.issue.findMany).toHaveBeenCalledWith({
        where: { priority: 1 },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              display_name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return 400 Bad Request for an invalid priority filter', async () => {
      const response = await request(app)
        .get('/v1/issues?priority=4')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'The issue query parameters are missing required fields or contain invalid values.'
      );
    });

    it('should return 403 Forbidden for a non-admin user', async () => {
      const response = await request(app)
        .get('/v1/issues')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /v1/issues', () => {
    it('should create a new issue successfully for an authenticated user', async () => {
      const mockIssue = {
        id: 1,
        priority: 2,
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
          priority: 2,
          authorId: 2,
          content: 'The search bar is overlapping with the header on mobile.',
        },
      });
    });

    it('should create a new issue successfully for an admin (since role 1 <= 2)', async () => {
      const mockIssue = {
        id: 2,
        priority: 2,
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

    it('should create a new issue with an explicit priority', async () => {
      const mockIssue = {
        id: 3,
        priority: 1,
        authorId: 2,
        content: 'Critical bug report.',
        createdAt: new Date().toISOString(),
      };
      (prisma.issue.create as jest.Mock).mockResolvedValue(mockIssue);

      const response = await request(app)
        .post('/v1/issues')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Critical bug report.', priority: 1 });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockIssue);
      expect(prisma.issue.create).toHaveBeenCalledWith({
        data: {
          priority: 1,
          authorId: 2,
          content: 'Critical bug report.',
        },
      });
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

    it('should return 400 Bad Request if priority is outside the allowed range', async () => {
      const response = await request(app)
        .post('/v1/issues')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Some bug', priority: 3 });

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

  describe('PATCH /v1/issues/:id', () => {
    it('should let the issue author update their own issue', async () => {
      const existingIssue = {
        id: 1,
        priority: 2,
        authorId: 2,
        content: 'Old content',
        createdAt: new Date().toISOString(),
      };
      const updatedIssue = {
        ...existingIssue,
        priority: 1,
        content: 'Updated content',
      };
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue(existingIssue);
      (prisma.issue.update as jest.Mock).mockResolvedValue(updatedIssue);

      const response = await request(app)
        .patch('/v1/issues/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Updated content', priority: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedIssue);
      expect(prisma.issue.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          content: 'Updated content',
          priority: 1,
        },
      });
    });

    it('should let an admin update any issue', async () => {
      const existingIssue = {
        id: 2,
        priority: 2,
        authorId: 99,
        content: 'Original content',
        createdAt: new Date().toISOString(),
      };
      const updatedIssue = {
        ...existingIssue,
        content: 'Admin updated content',
      };
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue(existingIssue);
      (prisma.issue.update as jest.Mock).mockResolvedValue(updatedIssue);

      const response = await request(app)
        .patch('/v1/issues/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: 'Admin updated content' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedIssue);
    });

    it('should return 403 when a non-admin tries to update another users issue', async () => {
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue({
        id: 3,
        priority: 2,
        authorId: 99,
        content: 'Someone else issue',
        createdAt: new Date().toISOString(),
      });

      const response = await request(app)
        .patch('/v1/issues/3')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Attempted update' });

      expect(response.status).toBe(403);
      expect(prisma.issue.update).not.toHaveBeenCalled();
    });

    it('should return 404 when the issue to update does not exist', async () => {
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .patch('/v1/issues/999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Attempted update' });

      expect(response.status).toBe(404);
    });

    it('should return 400 for an invalid issue id', async () => {
      const response = await request(app)
        .patch('/v1/issues/not-a-number')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Attempted update' });

      expect(response.status).toBe(400);
    });

    it('should return 400 for an invalid update payload', async () => {
      const response = await request(app)
        .patch('/v1/issues/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ priority: 5 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('The issue update payload contains invalid values.');
    });
  });

  describe('DELETE /v1/issues/:id', () => {
    it('should let the issue author delete their own issue', async () => {
      const existingIssue = {
        id: 1,
        priority: 2,
        authorId: 2,
        content: 'Issue to delete',
        createdAt: new Date().toISOString(),
      };
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue(existingIssue);
      (prisma.issue.delete as jest.Mock).mockResolvedValue(existingIssue);

      const response = await request(app)
        .delete('/v1/issues/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(existingIssue);
      expect(prisma.issue.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should let an admin delete any issue', async () => {
      const existingIssue = {
        id: 2,
        priority: 1,
        authorId: 99,
        content: 'Admin delete target',
        createdAt: new Date().toISOString(),
      };
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue(existingIssue);
      (prisma.issue.delete as jest.Mock).mockResolvedValue(existingIssue);

      const response = await request(app)
        .delete('/v1/issues/2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(existingIssue);
    });

    it('should return 403 when a non-admin tries to delete another users issue', async () => {
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue({
        id: 3,
        priority: 2,
        authorId: 99,
        content: 'Someone else issue',
        createdAt: new Date().toISOString(),
      });

      const response = await request(app)
        .delete('/v1/issues/3')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(prisma.issue.delete).not.toHaveBeenCalled();
    });

    it('should return 404 when the issue to delete does not exist', async () => {
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/v1/issues/999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 for an invalid issue id', async () => {
      const response = await request(app)
        .delete('/v1/issues/not-a-number')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
    });
  });
});
