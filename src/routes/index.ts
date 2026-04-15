import { Router } from 'express';
import { statusRouter } from './heartbeat';
import { protectedRoutes } from './protected';

const routes = Router();
// Heartbeat router
routes.use(statusRouter);

routes.use(protectedRoutes);

export { routes };
