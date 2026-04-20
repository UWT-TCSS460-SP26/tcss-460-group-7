import { Router } from 'express';
import { requireEnvVar } from '../../middleware/validation';
import { getPopularMovies } from '../../controllers/TMDB_Proxy/popularMovies';

const popularMoviesRouter = Router();

popularMoviesRouter.use(requireEnvVar('TMDB_API_TOKEN'));
popularMoviesRouter.get('/movies/popular', getPopularMovies);

export { popularMoviesRouter };
