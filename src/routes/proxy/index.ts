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
