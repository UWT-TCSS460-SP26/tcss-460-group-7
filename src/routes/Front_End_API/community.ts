import { Router } from 'express';
import { getTopRated } from '../../controllers/Front_End_API/community';

const communityRouter = Router();

communityRouter.get('/top-rated', getTopRated);

export { communityRouter };
