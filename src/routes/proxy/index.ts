import { Router } from 'express';
import { searchRouter } from './searchTv';
import { getMovieDetailsRouter } from './getMovieDetails';
import { getTVDetailsRouter } from './getTVDetails';

const searchTvRoutes = Router();

searchTvRoutes.use('/proxy', searchRouter);
searchTvRoutes.use('/proxy', getMovieDetailsRouter);
searchTvRoutes.use('/proxy', getTVDetailsRouter);

export { searchTvRoutes, getMovieDetailsRouter, getTVDetailsRouter };
