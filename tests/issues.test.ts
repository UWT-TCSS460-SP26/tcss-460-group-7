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

  describe('GET /v1/issues', () => {
    it('returns all issues for an admin user', async () => {
      const mockIssues = [
        {
          id: 1,
          priority: 2,
          title: 'General bug report',
          description: 'General bug report details.',
          reporterName: 'Jordan Kim',
          reproSteps: null,
          reporterContact: 'jordan@example.com',
          status: 'UNSOLVED',
          authorId: 2,
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

    it('filters issues by priority for an admin user', async () => {
      const mockIssues = [
        {
          id: 2,
          priority: 1,
          title: 'Critical bug report',
          description: 'Critical bug report details.',
          reporterName: 'Jordan Kim',
          reproSteps: '1. Open page. 2. Observe crash.',
          reporterContact: 'user@dev.local',
          status: 'IN_PROGRESS',
          authorId: 2,
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

    it('returns 400 for an invalid priority filter', async () => {
      const response = await request(app)
        .get('/v1/issues?priority=4')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'The issue query parameters are missing required fields or contain invalid values.'
      );
    });

    it('returns 403 for a non-admin user', async () => {
      const response = await request(app)
        .get('/v1/issues')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });
  });

  describe('POST /v1/issues', () => {
    it('creates a new public issue report without authentication', async () => {
      const mockIssue = {
        id: 1,
        priority: 2,
        title: 'Mobile Header Bug',
        description: 'The search bar is overlapping with the header on mobile.',
        reporterName: 'Jordan Kim',
        reproSteps: '1. Open on iPhone 13. 2. Look at header.',
        reporterContact: 'tester@example.com',
        status: 'UNSOLVED',
        authorId: null,
        createdAt: new Date().toISOString(),
      };
      (prisma.issue.create as jest.Mock).mockResolvedValue(mockIssue);

      const payload = {
        title: 'Mobile Header Bug',
        description: 'The search bar is overlapping with the header on mobile.',
        reporterName: 'Jordan Kim',
        reproSteps: '1. Open on iPhone 13. 2. Look at header.',
        reporterContact: 'tester@example.com',
      };

      const response = await request(app).post('/v1/issues').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockIssue);
      expect(prisma.issue.create).toHaveBeenCalledWith({
        data: {
          priority: 2,
          title: payload.title,
          description: payload.description,
          reporterName: payload.reporterName,
          reproSteps: payload.reproSteps,
          reporterContact: payload.reporterContact,
          authorId: undefined,
        },
      });
    });

    it('creates a new issue with an explicit priority', async () => {
      const mockIssue = {
        id: 2,
        priority: 1,
        title: 'Critical bug report',
        description: 'Critical bug report details.',
        reporterName: 'Jordan Kim',
        reproSteps: null,
        reporterContact: 'jordan@example.com',
        status: 'UNSOLVED',
        authorId: null,
        createdAt: new Date().toISOString(),
      };
      (prisma.issue.create as jest.Mock).mockResolvedValue(mockIssue);

      const response = await request(app).post('/v1/issues').send({
        title: 'Critical bug report',
        description: 'Critical bug report details.',
        reporterName: 'Jordan Kim',
        reporterContact: 'jordan@example.com',
        priority: 1,
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockIssue);
      expect(prisma.issue.create).toHaveBeenCalledWith({
        data: {
          priority: 1,
          title: 'Critical bug report',
          description: 'Critical bug report details.',
          reporterName: 'Jordan Kim',
          reproSteps: undefined,
          reporterContact: 'jordan@example.com',
          authorId: undefined,
        },
      });
    });

    it('returns 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/v1/issues')
        .send({ description: 'Some description' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'The bug report payload is missing required fields or contains invalid values.'
      );
    });

    it('returns 400 when reporter name or contact is blank', async () => {
      const response = await request(app).post('/v1/issues').send({
        title: 'Mobile Header Bug',
        description: 'The search bar is overlapping with the header on mobile.',
        reporterName: '   ',
        reporterContact: '',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'The bug report payload is missing required fields or contains invalid values.'
      );
    });

    it('accepts unauthenticated submissions by design', async () => {
      const mockIssue = {
        id: 3,
        priority: 2,
        title: 'Mobile Header Bug',
        description: 'The search bar is overlapping with the header on mobile.',
        reporterName: 'Jordan Kim',
        reproSteps: null,
        reporterContact: 'jordan@example.com',
        status: 'UNSOLVED',
        authorId: null,
        createdAt: new Date().toISOString(),
      };
      (prisma.issue.create as jest.Mock).mockResolvedValue(mockIssue);

      const response = await request(app).post('/v1/issues').send({
        title: 'Mobile Header Bug',
        description: 'The search bar is overlapping with the header on mobile.',
        reporterName: 'Jordan Kim',
        reporterContact: 'jordan@example.com',
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockIssue);
    });
  });

  describe('PATCH /v1/issues/:id/status', () => {
    it('allows an admin to update the status', async () => {
      const existingIssue = {
        id: 1,
        priority: 2,
        title: 'Bug report',
        description: 'Bug report details.',
        reporterName: 'Jordan Kim',
        reproSteps: null,
        reporterContact: 'jordan@example.com',
        status: 'UNSOLVED',
        authorId: 2,
        createdAt: new Date().toISOString(),
      };
      const mockUpdatedIssue = {
        ...existingIssue,
        status: 'IN_PROGRESS',
      };
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue(existingIssue);
      (prisma.issue.update as jest.Mock).mockResolvedValue(mockUpdatedIssue);

      const response = await request(app)
        .patch('/v1/issues/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedIssue);
      expect(prisma.issue.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'IN_PROGRESS' },
      });
    });

    it('returns 400 for an invalid status', async () => {
      const response = await request(app)
        .patch('/v1/issues/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('The issue status update payload contains invalid values.');
    });

    it('returns 403 for a non-admin user', async () => {
      const response = await request(app)
        .patch('/v1/issues/1/status')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'FIXED' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });

    it('returns 404 when the issue does not exist', async () => {
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .patch('/v1/issues/999/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'FIXED' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No issue was found for the provided ID.');
    });
  });

  describe('PATCH /v1/issues/:id', () => {
    it('lets the issue author update their own issue', async () => {
      const existingIssue = {
        id: 1,
        priority: 2,
        title: 'Old title',
        description: 'Old description',
        reporterName: 'Jordan Kim',
        reproSteps: null,
        reporterContact: 'jordan@example.com',
        status: 'UNSOLVED',
        authorId: 2,
        createdAt: new Date().toISOString(),
      };
      const updatedIssue = {
        ...existingIssue,
        title: 'Updated title',
        description: 'Updated description',
        priority: 1,
      };
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue(existingIssue);
      (prisma.issue.update as jest.Mock).mockResolvedValue(updatedIssue);

      const response = await request(app)
        .patch('/v1/issues/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated title',
          description: 'Updated description',
          priority: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedIssue);
      expect(prisma.issue.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: 'Updated title',
          description: 'Updated description',
          priority: 1,
        },
      });
    });

    it('lets an admin update any issue', async () => {
      const existingIssue = {
        id: 2,
        priority: 2,
        title: 'Original title',
        description: 'Original description',
        reporterName: 'Jordan Kim',
        reproSteps: '1. Open page.',
        reporterContact: 'reporter@example.com',
        status: 'UNSOLVED',
        authorId: 99,
        createdAt: new Date().toISOString(),
      };
      const updatedIssue = {
        ...existingIssue,
        reporterContact: 'updated@example.com',
      };
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue(existingIssue);
      (prisma.issue.update as jest.Mock).mockResolvedValue(updatedIssue);

      const response = await request(app)
        .patch('/v1/issues/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reporterContact: 'updated@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedIssue);
      expect(prisma.issue.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          reporterContact: 'updated@example.com',
        },
      });
    });

    it('returns 403 when a non-admin tries to update another users issue', async () => {
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue({
        id: 3,
        priority: 2,
        title: 'Someone else title',
        description: 'Someone else description',
        reporterName: 'Jordan Kim',
        reproSteps: null,
        reporterContact: 'jordan@example.com',
        status: 'UNSOLVED',
        authorId: 99,
        createdAt: new Date().toISOString(),
      });

      const response = await request(app)
        .patch('/v1/issues/3')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Attempted update' });

      expect(response.status).toBe(403);
      expect(prisma.issue.update).not.toHaveBeenCalled();
    });

    it('returns 404 when the issue to update does not exist', async () => {
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .patch('/v1/issues/999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Attempted update' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No issue was found for the provided ID.');
    });

    it('returns 400 for an invalid issue id', async () => {
      const response = await request(app)
        .patch('/v1/issues/not-a-number')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Attempted update' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('The issue ID in the path must be a positive integer.');
    });

    it('returns 400 for an invalid update payload', async () => {
      const response = await request(app)
        .patch('/v1/issues/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ priority: 5 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('The issue update payload contains invalid values.');
    });
  });

  describe('DELETE /v1/issues/:id', () => {
    it('lets the issue author delete their own issue', async () => {
      const existingIssue = {
        id: 1,
        priority: 2,
        title: 'Issue to delete',
        description: 'Issue to delete description',
        reporterName: 'Jordan Kim',
        reproSteps: null,
        reporterContact: 'jordan@example.com',
        status: 'UNSOLVED',
        authorId: 2,
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

    it('lets an admin delete any issue', async () => {
      const existingIssue = {
        id: 2,
        priority: 1,
        title: 'Admin delete target',
        description: 'Admin delete target description',
        reporterName: 'Jordan Kim',
        reproSteps: null,
        reporterContact: 'jordan@example.com',
        status: 'UNSOLVED',
        authorId: 99,
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

    it('returns 403 when a non-admin tries to delete another users issue', async () => {
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue({
        id: 3,
        priority: 2,
        title: 'Someone else issue',
        description: 'Someone else issue description',
        reporterName: 'Jordan Kim',
        reproSteps: null,
        reporterContact: 'jordan@example.com',
        status: 'UNSOLVED',
        authorId: 99,
        createdAt: new Date().toISOString(),
      });

      const response = await request(app)
        .delete('/v1/issues/3')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(prisma.issue.delete).not.toHaveBeenCalled();
    });

    it('returns 404 when the issue to delete does not exist', async () => {
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/v1/issues/999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No issue was found for the provided ID.');
    });

    it('returns 400 for an invalid issue id', async () => {
      const response = await request(app)
        .delete('/v1/issues/not-a-number')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('The issue ID in the path must be a positive integer.');
    });
  });
});
