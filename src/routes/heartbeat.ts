import { Router } from 'express';

const statusRouter = Router();

const message: string = 'Status: OK';
statusRouter.get('/status', (_request, response) => {
  if (response.status(200)) {
    response.status(200).json({ message: message });
    // console.log('Status: OK');
  }
});

export { statusRouter };
