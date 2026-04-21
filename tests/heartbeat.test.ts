import request from 'supertest';
import { app } from '../src/app';

describe('Heartbeat Route', () => {
  it('GET /status - returns the status of the client', async () => {
    const response = await request(app).get('/status');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Status: OK');
  });

  it('POST /status - returns 404 for unsupported methods', async () => {
    const response = await request(app).post('/status');

    expect(response.status).toBe(404);
  });

  it('PUT /status - returns 404 for unsupported methods', async () => {
    const response = await request(app).put('/status');

    expect(response.status).toBe(404);
  });

  it('GET /missing-status - returns 404 for unknown routes', async () => {
    const response = await request(app).get('/missing-status');

    expect(response.status).toBe(404);
  });
});
