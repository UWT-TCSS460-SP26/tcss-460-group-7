import { Router } from 'express';
import { statusRouter } from './heartbeat';
import { getMovieDetailsRouter } from './getMovieDetails';

const routes = Router();
// Heartbeat router
routes.use(statusRouter);

// Delete later
routes.use(getMovieDetailsRouter);

export { routes };
