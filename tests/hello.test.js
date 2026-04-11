'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const supertest_1 = __importDefault(require('supertest'));
const app_1 = require('../src/app');
describe('Hello Route', () => {
  it('GET /hello — returns greeting message', async () => {
    const response = await (0, supertest_1.default)(app_1.app).get('/hello');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Hello, TCSS 460!');
  });
  it('GET /hello/users/kassie - returns greeting message from Kassie', async () => {
    const response = await (0, supertest_1.default)(app_1.app).get('/hello/users/kassie');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'Hello! My name is Kassie Whitney. I am 33 years old. I am currently a Senior at University of Washington Tacoma! It is nice to meet everyone!'
    );
  });
});
//# sourceMappingURL=hello.test.js.map
