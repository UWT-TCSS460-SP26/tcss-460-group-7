import { Router } from 'express';
import { searchTvShowRouter } from './searchTv';
import { searchMovieRouter } from './searchMovie';
import { popularTVRouter } from './popularTv';
import { popularMoviesRouter } from './popularMovies';
import { getMovieDetailsRouter } from './getMovieDetails';
import { getTVDetailsRouter } from './getTVDetails';

const proxyRoutes = Router();

proxyRoutes.use('/v1', searchTvShowRouter);
proxyRoutes.use('/v1', searchMovieRouter);
proxyRoutes.use('/v1', popularTVRouter);
proxyRoutes.use('/v1', popularMoviesRouter);
proxyRoutes.use('/v1', getTVDetailsRouter);
proxyRoutes.use('/v1', getMovieDetailsRouter);

export { proxyRoutes };
