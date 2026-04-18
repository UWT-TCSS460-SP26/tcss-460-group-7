//getTVDetails
import { Router } from 'express';
import { getTVDetails } from '../../controllers/TMDB_Proxy/getTVDetails';

const getTVDetailsRouter = Router();
getTVDetailsRouter.get('/tv/details', getTVDetails);

export { getTVDetailsRouter };
