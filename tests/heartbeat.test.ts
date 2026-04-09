import request from 'supertest';
import { app } from '../src/app';

describe('Heartbeat Route', () => {
  it('GET /status - returns the status of the client', async () => {
    const response = await request(app).get('/status');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Status: OK');
  });
});
