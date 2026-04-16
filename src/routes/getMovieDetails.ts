import { Router } from 'express';
import { getMovieDetails } from '../controllers/getMovieDetails';

const getMovieDetailsRouter = Router();
getMovieDetailsRouter.get('/movie/details', getMovieDetails);

export { getMovieDetailsRouter };
