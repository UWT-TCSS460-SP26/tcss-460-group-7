import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/requireAuth';
import { validateCreateIssue, validateUpdateIssueStatus } from '../../middleware/database/issues';
import { createIssue, updateIssueStatus } from '../../controllers/database/issues';

const issuesRouter = Router();
issuesRouter.post('/', validateCreateIssue, createIssue);
issuesRouter.patch('/:id/status', requireAuth, requireRole(1), validateUpdateIssueStatus, updateIssueStatus);

export { issuesRouter };
