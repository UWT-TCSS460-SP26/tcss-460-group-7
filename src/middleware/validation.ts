import { Request, Response, NextFunction } from 'express';

export const requireEnvVar = (key: string) => {
  return (_request: Request, response: Response, next: NextFunction) => {
    if (!process.env[key]) {
      response.status(500).json({
        error: `The server is missing required configuration for ${key}.`,
      });
      return;
    }
    next();
  };
};

const isPositiveInteger = (value: unknown): boolean => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return false;
  }

  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0;
};

const isInteger = (value: unknown): boolean => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return false;
  }

  return Number.isInteger(Number(value));
};

export const requirePositiveIntegerParam = (key: string) => {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!isPositiveInteger(request.params[key])) {
      response.status(400).json({
        error: `The path parameter "${key}" must be a positive integer.`,
      });
      return;
    }

    next();
  };
};

export const requirePositiveIntegerBody = (key: string) => {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!isPositiveInteger(request.body?.[key])) {
      response.status(400).json({
        error: `The request body field "${key}" must be a positive integer.`,
      });
      return;
    }

    next();
  };
};

export const requireIntegerBody = (key: string) => {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!isInteger(request.body?.[key])) {
      response.status(400).json({
        error: `The request body field "${key}" must be an integer.`,
      });
      return;
    }

    next();
  };
};

export const requirePositiveIntegerQuery = (key: string) => {
  return (request: Request, response: Response, next: NextFunction) => {
    const queryValue = request.query[key];

    if (queryValue === undefined) {
      next();
      return;
    }

    if (!isPositiveInteger(queryValue)) {
      response.status(400).json({
        error: `The query parameter "${key}" must be a positive integer.`,
      });
      return;
    }

    next();
  };
};

export const validateCreateOrUpdateRating = [
  requirePositiveIntegerParam('title_id'),
  requireIntegerBody('rating'),
];

export const validateRatingsByTitleId = [requirePositiveIntegerParam('title_id')];

export const validateUserRatingLookup = [
  requirePositiveIntegerParam('authorId'),
  requirePositiveIntegerParam('title_id'),
];

export const validateUserRatingsPagination = [
  requirePositiveIntegerParam('authorId'),
  requirePositiveIntegerQuery('page'),
];

export const validateDeleteRating = [requirePositiveIntegerParam('title_id')];
