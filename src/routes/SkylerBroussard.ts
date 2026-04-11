import { Router } from 'express';
import { getGreeting } from '../controllers/SkylerBroussard';

const SkylerRouter = Router();

SkylerRouter.get('/hello/users/Skyler', getGreeting);

export { SkylerRouter };