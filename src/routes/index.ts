import { Router } from 'express';
import { statusRouter } from './heartbeat';
import { protectedRoutes } from './protected';
import { proxyRoutes } from './proxy';
import { usersRouter } from './database/users';
import { reviewsRouter } from './database/reviews';
import { ratingsRouter } from './database/ratings';

const routes = Router();

// Heartbeat router
routes.use(statusRouter);

// Protected router (authentication routes)
routes.use(protectedRoutes);

// Search query routes
routes.use(proxyRoutes);

// User routes
routes.use('/users', usersRouter);

// Review routes
routes.use('/reviews', reviewsRouter);

// Rating routes
routes.use('/v1/ratings', ratingsRouter);

export { routes };
