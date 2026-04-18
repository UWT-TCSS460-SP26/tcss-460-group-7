import { Request, Response, NextFunction } from 'express';

export const requireEnvVar = (key: string) => {
  return (_request: Request, response: Response, next: NextFunction) => {
    if (!process.env[key]) {
      response.status(500).json({ error: `${key} is not configured` });
      return;
    }
    next();
  };
};
