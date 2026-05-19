import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/requireAuth';
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

// Admin-only bug report list route.
issuesRouter.get('/', requireAuth, requireRole(1), validateGetIssueQuery, getIssue);

// Public bug report submission route
issuesRouter.post('/', validateCreateIssue, createIssue);

// Admin-only triage routes.
issuesRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole(1),
  validateIssueId,
  validateUpdateIssueStatus,
  updateIssueStatus
);
issuesRouter.patch(
  '/:id',
  requireAuth,
  requireRole(1),
  validateIssueId,
  validateUpdateIssue,
  updateIssue
);
issuesRouter.delete('/:id', requireAuth, requireRole(1), validateIssueId, deleteIssue);

export { issuesRouter };
