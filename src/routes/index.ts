import { Router } from 'express';
import { statusRouter } from './heartbeat';
import { getMovieDetailsRouter } from './getMovieDetails';
import { getTVDetailsRouter } from './getTVDetails';
import { protectedRoutes } from './protected';
import { searchTvRoutes } from './proxy';

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
