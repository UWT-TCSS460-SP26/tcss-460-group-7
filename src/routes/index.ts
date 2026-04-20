import { Router } from 'express';
import { statusRouter } from './heartbeat';
import { protectedRoutes } from './protected';
import { proxyRoutes } from './proxy';
import { proxyRouter } from './proxy';

const routes = Router();
// Heartbeat router
routes.use(statusRouter);
// Protected router (authentication routes)
routes.use(protectedRoutes);

// Search query routes
routes.use(proxyRoutes);
// All proxy routes (search, movie details, TV details)
routes.use(proxyRouter);

export { routes };
