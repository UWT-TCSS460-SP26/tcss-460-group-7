import { Router } from 'express';
import { requireAuth, requireRole, optionalAuth } from '../../middleware/requireAuth';
import {
  validateCreateIssue,
  validateGetIssueQuery,
  validateIssueId,
  validateUpdateIssue,
  validateUpdateIssueStatus,
} from '../../middleware/database/issues';
import {
  createIssue,
  deleteIssue,
  getIssue,
  updateIssue,
  updateIssueStatus,
} from '../../controllers/database/issues';

const issuesRouter = Router();

// Authenticated users (role 1) can only get the bug reports.
issuesRouter.get('/', requireAuth, requireRole(1), validateGetIssueQuery, getIssue);

// Anyone can submit bug reports, but we capture the user if they are logged in
issuesRouter.post('/', optionalAuth, validateCreateIssue, createIssue);
issuesRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole(1),
  validateIssueId,
  validateUpdateIssueStatus,
  updateIssueStatus
);
issuesRouter.patch('/:id', requireAuth, validateIssueId, validateUpdateIssue, updateIssue);
issuesRouter.delete('/:id', requireAuth, validateIssueId, deleteIssue);

export { issuesRouter };
