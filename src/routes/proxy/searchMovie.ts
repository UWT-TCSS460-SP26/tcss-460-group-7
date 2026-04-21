import { Router } from 'express';
import { requireEnvVar } from '../../middleware/validation';
import { getSearchedMovieTitle } from '../../controllers/TMDB_Proxy/searchMovie';

const searchMovieRouter = Router();

searchMovieRouter.use(requireEnvVar('TMDB_API_TOKEN'));

searchMovieRouter.get('/movie/search/title', getSearchedMovieTitle);

export { searchMovieRouter };
