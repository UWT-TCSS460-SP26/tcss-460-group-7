import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateCreateIssue } from '../../middleware/database/issues';
import { createIssue } from '../../controllers/database/issues';

const issuesRouter = Router();

// Authenticated users (role 2 or higher) can submit bug reports
issuesRouter.post('/', requireAuth, validateCreateIssue, createIssue);

export { issuesRouter };
