import { Router } from 'express';
import { statusRouter } from './heartbeat';
import { proxyRoutes } from './proxy';
import { usersRouter } from './database/users';
import { reviewsRouter } from './database/reviews';
import { ratingsRouter } from './database/ratings';
import { issuesRouter } from './database/issues';
import { mediaReviewDataRouter } from './Front_End_API/mediaWithReviews';
import { meRouter } from './Front_End_API/me';
import { communityRouter } from './Front_End_API/community';

const routes = Router();

// Heartbeat router
routes.use(statusRouter);

// Search query routes
routes.use(proxyRoutes);

// Me routes — must be before /v1/users to prevent /:id swallowing /me
routes.use('/v1/users/me', meRouter);

// User routes
routes.use('/v1/users', usersRouter);

// Review routes
routes.use('/v1/reviews', reviewsRouter);

// Rating routes
routes.use('/v1/ratings', ratingsRouter);

// Issue routes
routes.use('/v1/issues', issuesRouter);

// Media Reviews routes
routes.use('/v1/media', mediaReviewDataRouter);

// Community routes
routes.use('/v1/community', communityRouter);

export { routes };
