import { Router } from 'express';
import { ratingsRouter } from '../database/ratings';

const protectedRoutes = Router();

protectedRoutes.use('/v1/ratings', ratingsRouter);

export { protectedRoutes };
