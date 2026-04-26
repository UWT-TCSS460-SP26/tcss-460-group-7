import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/requireAuth';
import {
  validateReviewId,
  validateCreateReview,
  validateUpdateReview,
} from '../middleware/database_validations/reviews';
import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  upvoteReview,
  downvoteReview,
  removeUpvoteReview,
  removeDownvoteReview,
} from '../controllers/reviews/reviews';

const reviewsRouter = Router();

// Public routes
reviewsRouter.get('/:id', validateReviewId, getReviewById);

// Authenticated routes
reviewsRouter.post('/', requireAuth, validateCreateReview, createReview);
reviewsRouter.get('/', requireAuth, requireRole(1), getAllReviews); // Admin only to see ALL reviews
reviewsRouter.put('/:id', requireAuth, validateReviewId, validateUpdateReview, updateReview);
reviewsRouter.delete('/:id', requireAuth, validateReviewId, deleteReview);

// Voting routes
reviewsRouter.post('/:id/upvote', requireAuth, validateReviewId, upvoteReview);
reviewsRouter.post('/:id/downvote', requireAuth, validateReviewId, downvoteReview);
reviewsRouter.post('/:id/remove-upvote', requireAuth, validateReviewId, removeUpvoteReview);
reviewsRouter.post('/:id/remove-downvote', requireAuth, validateReviewId, removeDownvoteReview);

export { reviewsRouter };
