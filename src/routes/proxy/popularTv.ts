import { Router } from 'express';
import { requireEnvVar } from '../../middleware/validation';
import { getPopularTV } from '../../controllers/TMDB_Proxy/popularTv';

const popularTVRouter = Router();

popularTVRouter.use(requireEnvVar('TMDB_API_TOKEN'));

popularTVRouter.get('/tv/popular', getPopularTV);

export { popularTVRouter };
