import { Router } from 'express';
import { statusRouter } from './heartbeat';


const routes = Router();
// Heartbeat router
routes.use(statusRouter);

// Delete later

export { routes };
