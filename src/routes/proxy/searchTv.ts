import { Router } from 'express';
import { requireEnvVar } from '../../middleware/validation';

import {
  getSearchedTVTitle,
  getSearchedTVGenre,
  getSearchedTVCast,
} from '../../controllers/TMDB_Proxy/searchTv';

const searchTvShowRouter = Router();

searchTvShowRouter.use(requireEnvVar('TMDB_API_TOKEN'));

searchTvShowRouter.get('/tv/search/title', getSearchedTVTitle);
searchTvShowRouter.get('/tv/search/genre', getSearchedTVGenre);
searchTvShowRouter.get('/tv/search/cast', getSearchedTVCast);

export { searchTvShowRouter };
