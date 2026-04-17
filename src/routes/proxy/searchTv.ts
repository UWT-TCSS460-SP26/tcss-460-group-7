import { Router } from 'express';
import { requireEnvVar } from '../../middleware/validation';

import {
  getSearchedTVTitle,
  getSearchedTVGenre,
  getSearchedTVCast,
} from '../../controllers/TMDB_Proxy/searchTv';

const searchRouter = Router();

searchRouter.use(requireEnvVar('TMDB_API_TOKEN'));

searchRouter.get('/tv/search/title', getSearchedTVTitle);
searchRouter.get('/tv/search/genre', getSearchedTVGenre);
searchRouter.get('/tv/search/cast', getSearchedTVCast);

export { searchRouter };
