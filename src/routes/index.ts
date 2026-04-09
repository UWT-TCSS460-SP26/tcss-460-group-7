import { Router } from 'express';
import { kassieRouter } from './kassie-whitney';
import { statusRouter } from './heartbeat';

const routes = Router();

routes.use(kassieRouter);
routes.use(statusRouter);

export { routes };
