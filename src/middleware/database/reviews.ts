import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const reviewIdSchema = z.object({
  id: z.coerce.number().int().positive('review id must be a positive integer'),
});

const reviewTitleSchema = z.object({
  title_id: z.coerce.number().int().positive('title_id must be a positive integer'),
});

const reviewPaginationSchema = z.object({
  page: z.coerce.number().int().positive('page must be a positive integer').optional(),
  limit: z.coerce.number().int().positive('limit must be a positive integer').optional(),
});

const createReviewSchema = z.object({
  title_id: z.number().int('title_id is required and must be an integer'),
  content: z.string().trim().min(1, 'content is required and must be a non-empty string'),
  header: z.string().trim().optional(),
});

const updateReviewSchema = z.object({
  content: z.string().trim().min(1, 'content must be a non-empty string').optional(),
  header: z.string().trim().optional(),
});

// Validates :id param is a valid number. Used on GET, PUT, DELETE /review/:id.
export const validateReviewId = (req: Request, res: Response, next: NextFunction): void => {
  const result = reviewIdSchema.safeParse(req.params);
  if (!result.success) {
    res.status(400).json({ error: 'The review ID in the path must be a positive integer.' });
    return;
  }
  next();
};

export const validateReviewTitlePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const paramResult = reviewTitleSchema.safeParse(req.params);
  if (!paramResult.success) {
    res.status(400).json({ error: 'The title ID in the path must be a positive integer.' });
    return;
  }

  const queryResult = reviewPaginationSchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({
      error: 'One or more pagination query parameters are invalid.',
      details: queryResult.error.format(),
    });
    return;
  }

  next();
};

export const validateCreateReview = (req: Request, res: Response, next: NextFunction): void => {
  const result = createReviewSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'The review payload is missing required fields or contains invalid values.',
      details: result.error.format(),
    });
    return;
  }
  next();
};

export const validateUpdateReview = (req: Request, res: Response, next: NextFunction): void => {
  const result = updateReviewSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'The review update payload contains invalid values.',
      details: result.error.format(),
    });
    return;
  }
  next();
};
