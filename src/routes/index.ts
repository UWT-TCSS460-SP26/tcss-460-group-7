import { Router } from 'express';
import { statusRouter } from './heartbeat';
import { protectedRoutes } from './protected';
import { proxyRoutes } from './proxy';
import { usersRouter } from './database/users';
import { reviewsRouter } from './database/reviews';
import { ratingsRouter } from './database/ratings';
import { issuesRouter } from './database/issues';
import { mediaReviewDataRouter } from './Front_End_API/mediaWithReviews';

const routes = Router();

// Heartbeat router
routes.use(statusRouter);

// Protected router (authentication routes)
routes.use(protectedRoutes);

// Search query routes
routes.use(proxyRoutes);

// User routes
routes.use('/v1/users', usersRouter);

// Review routes
routes.use('/v1/reviews', reviewsRouter);

// Rating routes
routes.use('/v1/ratings', ratingsRouter);

// Issue routes
routes.use('/v1/issues', issuesRouter);

// Media Reviews routes
routes.use('/v1/media-reviews', mediaReviewDataRouter);

export { routes };
