import { Router } from 'express';
import { searchRouter } from './searchTv';
import { popularTVRouter } from './popularTv';
import { popularMoviesRouter } from './popularMovies';

// renamed as index will contain all proxy routes - skyler
const proxyRoutes = Router();

proxyRoutes.use('/v1', searchRouter);
proxyRoutes.use('/v1', popularTVRouter);
proxyRoutes.use('/v1', popularMoviesRouter);

export { proxyRoutes };
import { getMovieDetailsRouter } from './getMovieDetails';
import { getTVDetailsRouter } from './getTVDetails';

const proxyRouter = Router();

// Proxy routes
proxyRouter.use('/v1', searchRouter);

// get movie details route
proxyRouter.use('/v1', getMovieDetailsRouter);

// get TV details route
proxyRouter.use('/v1', getTVDetailsRouter);

export { proxyRouter };
