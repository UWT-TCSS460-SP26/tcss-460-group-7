import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const mediaIdSchema = z.object({
  id: z.coerce.number().int().positive('media id must be a positive integer'),
});

const mediaTypeSchema = z.object({
  mediaType: z.enum(['movie', 'tv']),
});

// Checks if the movie id is valid numeric value.
export const validateMediaIdSchema = (request: Request, response: Response, next: NextFunction) => {
  const result = mediaIdSchema.safeParse(request.params);

  if (!result.success) {
    response.status(400).json({
      error: 'The media ID in the path must be a positive integer.',
    });
    return;
  }
  next();
};

// Checks the mediaType as either movie or tv
export const validateMediaTypeSchema = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const result = mediaTypeSchema.safeParse(request.params);

  if (!result.success) {
    response.status(400).json({
      error: 'The media type in the path must be either "movie" or "tv".',
    });
    return;
  }
  next();
};
