"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
describe('Heartbeat Route', () => {
    it('GET /status - returns the status of the client', async () => {
        const response = await (0, supertest_1.default)(app_1.app).get('/status');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Status: OK');
    });
});
//# sourceMappingURL=heartbeat.test.js.map