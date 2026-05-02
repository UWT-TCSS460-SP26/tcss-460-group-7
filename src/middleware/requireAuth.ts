import { Request, Response, NextFunction } from 'express';
import { expressjwt, GetVerificationKey } from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';
import { prisma } from '../lib/prisma';

export interface AuthenticatedUser {
  sub: string;
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

const jwtCheck = expressjwt({
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH_ISSUER}/.well-known/jwks.json`,
  }) as GetVerificationKey,
  audience: process.env.API_AUDIENCE,
  issuer: process.env.AUTH_ISSUER,
  algorithms: ['RS256'],
});

export const requireAuth = (request: Request, response: Response, next: NextFunction): void => {
  jwtCheck(request, response, async (err) => {
    if (err) {
      response.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    const auth = (request as unknown as { auth: { sub: string } }).auth;
    const dbUser = await prisma.user.findUnique({ where: { id: Number(auth.sub) } });
    if (!dbUser) {
      response.status(401).json({ error: 'User not found' });
      return;
    }
    request.user = { sub: auth.sub, role: dbUser.role };
    next();
  });
};

/**
 * Role gate. Use after requireAuth:
 *
 *   router.delete('/reviews/:id', requireAuth, requireRole(1), handler);
 */
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