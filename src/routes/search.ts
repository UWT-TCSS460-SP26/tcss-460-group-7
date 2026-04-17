import { Router } from 'express';
import { requireEnvVar } from '../middleware/validation';

import{
    getSearchedMovieTitle, 
    
} from '../controllers/TMDB_Proxy/search';

const searchRouter = Router();

searchRouter.use(requireEnvVar('TMDB_API_TOKEN'));

searchRouter.get('/movie/search', getSearchedMovieTitle);

export {searchRouter};