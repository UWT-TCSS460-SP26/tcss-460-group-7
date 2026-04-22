import { Router } from 'express';
import { statusRouter } from './heartbeat';
import { protectedRoutes } from './protected';
import { proxyRoutes } from './proxy';
import devAuthRouter from './devAuth';

const routes = Router();

// Authentication router
routes.use('/auth', devAuthRouter);

// Heartbeat router
routes.use(statusRouter);
// Protected router (authentication routes)
routes.use(protectedRoutes);

// Search query routes
routes.use(proxyRoutes);

export { routes };
