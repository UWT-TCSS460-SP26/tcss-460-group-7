import { Router } from 'express';
import {
    validateMediaIdSchema,
    validateMediaTypeSchema
} from '../../middleware/Front_End_API/mediaWithReviews';

import {
    getMediaWithReviews
} from '../../controllers/Front_End_API/mediaWithReviews';

const mediaReviewDataRouter = Router();

mediaReviewDataRouter.get('/:mediaType/:id', validateMediaTypeSchema, validateMediaIdSchema, getMediaWithReviews);

export { mediaReviewDataRouter };
