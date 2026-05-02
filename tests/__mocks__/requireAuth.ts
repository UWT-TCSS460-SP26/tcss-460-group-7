import { Request, Response, NextFunction } from 'express';
import { Buffer } from 'buffer';

// This mock implementation of requireAuth is used in tests to bypass actual authentication logic.
// It simulates a successful authentication by attaching a mock user to the request object.

export interface AuthenticatedUser {
  sub: string;
  id: number;
  role: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Express type augmentation
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const requireAuth = (request: Request, response: Response, next: NextFunction): void => {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    response.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }
  try {
    const token = authHeader.slice(7);
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    request.user = { sub: String(payload.sub), id: Number(payload.sub), role: payload.role };
    next();
  } catch {
    response.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (role: number) => {
  return (request: Request, response: Response, next: NextFunction): void => {
    if (!request.user) {
      response.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (request.user.role !== role) {
      response.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
