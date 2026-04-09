import { Router } from 'express';

const status = Router();

const message: string = 'Status: OK';
status.get('/status', (_request, response) => {
  response.status(200).json({ message: message });
});
