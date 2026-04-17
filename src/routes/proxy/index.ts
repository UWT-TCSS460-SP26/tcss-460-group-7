import { Router } from 'express';
import { searchRouter } from './searchTv';

const searchTvRoutes = Router();

searchTvRoutes.use('/proxy', searchRouter);

export { searchTvRoutes };
