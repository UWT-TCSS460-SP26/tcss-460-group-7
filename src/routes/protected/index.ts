import { Router } from 'express';
import { authRouter } from './auth';

const protectedRoutes = Router();

// Week 5: add JWT middleware here
// protectedRoutes.use(verifyJwt);
protectedRoutes.use('/protected', authRouter);

export { protectedRoutes };
