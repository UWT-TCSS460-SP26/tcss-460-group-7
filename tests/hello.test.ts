import request from 'supertest';
import { app } from '../src/app';

describe('Hello Route', () => {
  it('GET /hello — returns greeting message', async () => {
    const response = await request(app).get('/hello');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Hello, TCSS 460!');
  });
  it('GET /hello/users/kassie - returns greeting message from Kassie', async () => {
    const response = await request(app).get('/hello/users/kassie');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'Hello! My name is Kassie Whitney. I am 33 years old. I am currently a Senior at University of Washington Tacoma! It is nice to meet everyone!'
    );
  });
});
