import { Router } from 'express';
import { statusRouter } from './heartbeat';
import { getMovieDetailsRouter } from './getMovieDetails';
import { getTVDetailsRouter } from './getTVDetails';

const routes = Router();
// Heartbeat router
routes.use(statusRouter);

// Delete later
routes.use(getMovieDetailsRouter);
routes.use(getTVDetailsRouter)

export { routes };
