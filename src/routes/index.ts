import { Router } from 'express';
import { statusRouter } from './heartbeat';
import { kassieRouter } from './kassie-whitney';
import { SkylerRouter } from './SkylerBroussard'


const routes = Router();
// Heartbeat router
routes.use(statusRouter);

// Delete later
routes.use(kassieRouter);
routes.use(SkylerRouter);

export { routes };
