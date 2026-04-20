import { Router } from 'express';
import { searchRouter } from './searchTv';
import { getMovieDetailsRouter } from './getMovieDetails';
import { getTVDetailsRouter } from './getTVDetails';

const proxyRouter = Router();

// Proxy routes
proxyRouter.use('/proxy', searchRouter);

// get movie details route
proxyRouter.use('/proxy', getMovieDetailsRouter);

// get TV details route
proxyRouter.use('/proxy', getTVDetailsRouter);

export { proxyRouter };
