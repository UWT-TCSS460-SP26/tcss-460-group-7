import request from 'supertest';
import { app } from '../src/app';

describe('Heartbeat Route', () => {
  it('GET /health - returns the status of the client', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Status: OK');
  });

  it('POST /health - returns 404 for unsupported methods', async () => {
    const response = await request(app).post('/health');

    expect(response.status).toBe(404);
  });

  it('PUT /health - returns 404 for unsupported methods', async () => {
    const response = await request(app).put('/health');

    expect(response.status).toBe(404);
  });

  it('GET /status - returns 404 because only /health is supported', async () => {
    const response = await request(app).get('/status');

    expect(response.status).toBe(404);
  });

  it('GET /missing-health - returns 404 for unknown routes', async () => {
    const response = await request(app).get('/missing-health');

    expect(response.status).toBe(404);
  });
});
