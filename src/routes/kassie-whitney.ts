import { Router } from 'express';
import { getGreeting } from '../controllers/kassie-whitney';

const kassieRouter = Router();

kassieRouter.get('/hello/users/kassie', getGreeting);

export { kassieRouter };
