import { Router } from 'express';
import { getGreeting } from '../controllers/greetingDuyHung';

const greetingDuyHung = Router();

greetingDuyHung.get('/greetingDuyHung', getGreeting);

export { greetingDuyHung };
