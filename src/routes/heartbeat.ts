import { Request, Response, Router } from 'express';

const statusRouter = Router();

const message: string = 'Status: OK';
const sendStatus = (_request: Request, response: Response) => {
  response.status(200).json({ message });
};

statusRouter.get('/health', sendStatus);

export { statusRouter };
