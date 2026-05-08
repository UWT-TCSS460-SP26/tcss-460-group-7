import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/requireAuth';
import {
  validateCreateIssue,
  validateGetIssueQuery,
  validateIssueId,
  validateUpdateIssue,
} from '../../middleware/database/issues';
import { createIssue, deleteIssue, getIssue, updateIssue } from '../../controllers/database/issues';

const issuesRouter = Router();

// Authenticated users (role 1) can only get the bug reports.
issuesRouter.get('/', requireAuth, requireRole(1), validateGetIssueQuery, getIssue);

// Authenticated users (role 2 or higher) can submit bug reports
issuesRouter.post('/', requireAuth, validateCreateIssue, createIssue);
issuesRouter.patch('/:id', requireAuth, validateIssueId, validateUpdateIssue, updateIssue);
issuesRouter.delete('/:id', requireAuth, validateIssueId, deleteIssue);

export { issuesRouter };
