import { Router } from 'express';
import { kassieRouter } from './kassie-whitney';

const routes = Router();

routes.use(kassieRouter);

export { routes };
