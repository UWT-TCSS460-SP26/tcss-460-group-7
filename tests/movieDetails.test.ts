import request from 'supertest';
import { app } from '../src/app';

describe('Movie Details Route', () => {
  it('GET /movie/details?Id=550 - should return movie details', async () => {
    // This is currently expected to fail based on my analysis of the route definition
    const response = await request(app).get('/movie/details?Id=550');
    expect(response.status).not.toBe(404);
  });
});
