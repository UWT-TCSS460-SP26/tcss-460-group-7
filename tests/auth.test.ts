import request from 'supertest';
import { app } from '../src/app';

describe('Authorization Route testing', () => {
  const originalApiKey = process.env.TMDB_API_KEY;

  beforeEach(() => {
    process.env.TMDB_API_KEY = 'test-api-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        expires_at: '2026-04-15 01:23:45 UTC',
        request_token: 'mock-request-token',
      }),
    } as Awaited<ReturnType<typeof fetch>>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.TMDB_API_KEY = originalApiKey;
  });

  it('GET /proxy/auth/request-token - returns the temporary token used for logging in a user', async () => {
    const response = await request(app).get('/proxy/auth/request-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.request_token).toBe('mock-request-token');
  });

  it('GET /proxy/auth/request-token/bad-path - returns 404 for an invalid request-token route', async () => {
    const response = await request(app).get('/proxy/auth/request-token/bad-path');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Route not found');
  });

  it('GET /proxy/auth/login - redirects the user to TMDB login when request_token is provided', async () => {
    const response = await request(app)
      .get('/proxy/auth/login')
      .query({ request_token: 'mock-request-token' });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(
      'https://www.themoviedb.org/authenticate/mock-request-token'
    );
  });

  it('GET /proxy/auth/login - returns 400 when request_token is missing', async () => {
    const response = await request(app).get('/proxy/auth/login');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Valid request token is required');
  });

  it('GET /proxy/auth/login/bad-path - returns 404 for an invalid login route', async () => {
    const response = await request(app).get('/proxy/auth/login/bad-path');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Route not found');
  });

  it('POST /proxy/auth/session - returns the session_id for an approved request token', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        session_id: 'mock-session-id',
      }),
    } as Awaited<ReturnType<typeof fetch>>);

    const response = await request(app)
      .post('/proxy/auth/session')
      .query({ request_token: 'approved-request-token' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ session_id: 'mock-session-id' });
  });

  it('POST /proxy/auth/session - returns 400 when request_token is missing', async () => {
    const response = await request(app).post('/proxy/auth/session');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Valid request token is required');
  });

  it('POST /proxy/auth/session/bad-path - returns 404 for an invalid session route', async () => {
    const response = await request(app).post('/proxy/auth/session/bad-path');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Route not found');
  });
});
