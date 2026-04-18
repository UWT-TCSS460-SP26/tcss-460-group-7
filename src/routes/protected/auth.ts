import { Router } from 'express';
import { requireEnvVar } from '../../middleware/validation';
import {
  getRequestToken,
  validateRequestToken,
  getSessionId,
} from '../../controllers/TMDB_Proxy/auth';

const authRouter = Router();

//Validates that the env file is setup correctly.
authRouter.use(requireEnvVar('TMDB_API_KEY'));

//Authorization routes.
authRouter.get('/auth/request-token', getRequestToken);
authRouter.get('/auth/login', validateRequestToken);
authRouter.post('/auth/session', getSessionId);

export { authRouter };
