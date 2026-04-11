import { Router } from 'express';
import { getGreeting } from '../controllers/greetingDuyHung';

const greetingDuyHung = Router();

greetingDuyHung.get('/hello/users/DuyHung', getGreeting);

export { greetingDuyHung };
