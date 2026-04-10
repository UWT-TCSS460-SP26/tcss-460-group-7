import { Router } from 'express';
import { statusRouter } from './heartbeat';
import { kassieRouter } from './kassie-whitney';

const routes = Router();
// Heartbeat router
routes.use(statusRouter);

// Delete later
routes.use(kassieRouter);

export { routes };
