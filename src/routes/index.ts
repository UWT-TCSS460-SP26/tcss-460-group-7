import { Router } from 'express';
import { statusRouter } from './heartbeat';
import { protectedRoutes } from './protected';
import { searchTvRoutes, getMovieDetailsRouter, getTVDetailsRouter} from './proxy';

const routes = Router();
// Heartbeat router
routes.use(statusRouter);
// Protected router (authentication routes)
routes.use(protectedRoutes);
// Movie and TV details routes
routes.use(getMovieDetailsRouter);
routes.use(getTVDetailsRouter);
// Search query routes
routes.use(searchTvRoutes);

export { routes };
