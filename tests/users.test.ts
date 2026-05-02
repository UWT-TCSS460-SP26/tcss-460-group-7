import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const TEST_SECRET = 'test-secret';

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

afterEach(() => {
  jest.clearAllMocks();
});

// Mint tokens directly — no dev-login calls in tests
const mintToken = (sub: number, role: number) =>
  jwt.sign({ sub, email: 'test@dev.local', role }, TEST_SECRET);

const userToken = mintToken(1, 2);
const adminToken = mintToken(99, 1);

const mockUser = {
  id: 1,
  username: 'stardust42',
  email: 'stardust42@dev.local',
  display_name: null,
  role: 2,
};

// ─── POST /users ────────────────────────────────────────────────────────────

describe('POST /v1/users', () => {
  it('creates a user and returns 201', async () => {
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app).post('/v1/users').send({
      username: 'stardust42',
      email: 'stardust42@dev.local',
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ username: 'stardust42' });
  });

  it('stores display_name when provided', async () => {
    const userWithDisplay = { ...mockUser, display_name: 'Stardust' };
    (prisma.user.create as jest.Mock).mockResolvedValue(userWithDisplay);

    const res = await request(app).post('/v1/users').send({
      username: 'stardust42',
      email: 'stardust42@dev.local',
      display_name: 'Stardust',
    });

    expect(res.status).toBe(201);
    expect(res.body.display_name).toBe('Stardust');
  });

  it('returns 400 when username is missing', async () => {
    const res = await request(app).post('/v1/users').send({ email: 'test@dev.local' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app).post('/v1/users').send({ username: 'stardust42' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is invalid', async () => {
    const res = await request(app).post('/v1/users').send({
      username: 'stardust42',
      email: 'notanemail',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when display_name is an empty string', async () => {
    const res = await request(app).post('/v1/users').send({
      username: 'stardust42',
      email: 'stardust42@dev.local',
      display_name: '   ',
    });
    expect(res.status).toBe(400);
  });

  it('returns 409 when username or email already exists', async () => {
    (prisma.user.create as jest.Mock).mockRejectedValue({ code: 'P2002' });

    const res = await request(app).post('/v1/users').send({
      username: 'stardust42',
      email: 'stardust42@dev.local',
    });

    expect(res.status).toBe(409);
  });
});

// ─── GET /users ─────────────────────────────────────────────────────────────

describe('GET /v1/users', () => {
  it('returns paginated users for admin', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([[mockUser], 1]);

    const res = await request(app).get('/v1/users').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ data: [mockUser], total: 1, page: 1 });
  });

  it('returns 401 when no token provided', async () => {
    const res = await request(app).get('/v1/users');
    expect(res.status).toBe(401);
  });

  it('returns 403 when regular user tries to get all users', async () => {
    const res = await request(app).get('/v1/users').set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('respects page and limit query params', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([[], 0]);

    const res = await request(app)
      .get('/v1/users?page=2&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ page: 2, limit: 5 });
  });

  it('filters by role', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([[mockUser], 1]);

    const res = await request(app)
      .get('/v1/users?role=2')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

// ─── GET /users/:id ──────────────────────────────────────────────────────────

describe('GET /v1/users/:id', () => {
  it('returns a user by id', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app).get('/v1/users/1');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, username: 'stardust42' });
  });

  it('returns 404 when user does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/v1/users/999');

    expect(res.status).toBe(404);
  });

  it('returns 400 when id is not a number', async () => {
    const res = await request(app).get('/v1/users/abc');
    expect(res.status).toBe(400);
  });
});

// ─── PUT /users/:id ──────────────────────────────────────────────────────────

describe('PUT /v1/users/:id', () => {
  it('updates display_name and returns 200', async () => {
    const updated = { ...mockUser, display_name: 'New Name' };
    (prisma.user.update as jest.Mock).mockResolvedValue(updated);

    const res = await request(app)
      .put('/v1/users/1')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ display_name: 'New Name' });

    expect(res.status).toBe(200);
    expect(res.body.display_name).toBe('New Name');
  });

  it('returns 401 when no token provided', async () => {
    const res = await request(app).put('/v1/users/1').send({ display_name: 'New Name' });
    expect(res.status).toBe(401);
  });

  it('returns 403 when updating another user', async () => {
    const res = await request(app)
      .put('/v1/users/2')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ display_name: 'New Name' });

    expect(res.status).toBe(403);
  });

  it('returns 400 when display_name is missing', async () => {
    const res = await request(app)
      .put('/v1/users/1')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 404 when user does not exist', async () => {
    (prisma.user.update as jest.Mock).mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .put('/v1/users/1')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ display_name: 'New Name' });

    expect(res.status).toBe(404);
  });

  it('returns 400 when id is not a number', async () => {
    const res = await request(app)
      .put('/v1/users/abc')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ display_name: 'New Name' });

    expect(res.status).toBe(400);
  });
});

// ─── DELETE /users/:id ───────────────────────────────────────────────────────

describe('DELETE /v1/users/:id', () => {
  it('allows a user to delete their own account', async () => {
    (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app)
      .delete('/v1/users/1')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });

  it('allows admin to delete any account', async () => {
    (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app)
      .delete('/v1/users/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('returns 401 when no token provided', async () => {
    const res = await request(app).delete('/v1/users/1');
    expect(res.status).toBe(401);
  });

  it('returns 403 when deleting another user as non-admin', async () => {
    const res = await request(app)
      .delete('/v1/users/2')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 404 when user does not exist', async () => {
    (prisma.user.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .delete('/v1/users/1')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
  });

  it('returns 400 when id is not a number', async () => {
    const res = await request(app)
      .delete('/v1/users/abc')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
  });
});
