import { Router } from 'express';
import {
  createRating,
  deleteRating,
  getAllUserRating,
  getRatingByUserIdMovieId,
  getRatingsBTitleId,
  updateUsersRating,
} from '../../controllers/database/rating';
import { requireAuth } from '../../middleware/requireAuth';
import {
  validateCreateOrUpdateRating,
  validateDeleteRating,
  validateRatingsByTitleId,
  validateUserRatingLookup,
  validateUserRatingsPagination,
} from '../../middleware/validation';

const ratingsRouter = Router();

ratingsRouter.use(requireAuth);

ratingsRouter.post('/:title_id', ...validateCreateOrUpdateRating, createRating);
ratingsRouter.get('/title/:title_id', ...validateRatingsByTitleId, getRatingsBTitleId);
ratingsRouter.get(
  '/user/:authorId/title/:title_id',
  ...validateUserRatingLookup,
  getRatingByUserIdMovieId
);
ratingsRouter.patch('/:title_id', ...validateCreateOrUpdateRating, updateUsersRating);
ratingsRouter.get('/user/:authorId', ...validateUserRatingsPagination, getAllUserRating);
ratingsRouter.delete('/:title_id', ...validateDeleteRating, deleteRating);

export { ratingsRouter };
