import { Router } from 'express';
import { searchRouter } from './searchTv';
import { popularTVRouter } from './popularTv';
import { popularMoviesRouter } from './popularMovies';

// renamed as index will contain all proxy routes - skyler
const proxyRoutes = Router();

proxyRoutes.use('/proxy', searchRouter);
proxyRoutes.use('/proxy', popularTVRouter);
proxyRoutes.use('/proxy', popularMoviesRouter);

export { proxyRoutes };
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
