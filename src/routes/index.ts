import { Router } from 'express';
import { statusRouter } from './heartbeat';
import { protectedRoutes } from './protected';
import { proxyRouter} from './proxy';

const routes = Router();
// Heartbeat router
routes.use(statusRouter);
// Protected router (authentication routes)
routes.use(protectedRoutes);
// All proxy routes (search, movie details, TV details)
routes.use(proxyRouter);

export { routes };
