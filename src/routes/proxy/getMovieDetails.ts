import { Router } from 'express';
import { getMovieDetails } from '../../controllers/TMDB_Proxy/getMovieDetails';

const getMovieDetailsRouter = Router();
getMovieDetailsRouter.get('/movie/details', getMovieDetails);

export { getMovieDetailsRouter };
