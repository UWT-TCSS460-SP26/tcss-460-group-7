import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const issueIdSchema = z.object({
  id: z.coerce.number().int().positive('issue id must be a positive integer'),
});

const createIssueSchema = z.object({
  title: z.string().trim().min(1, 'issue title must be filled out'),
  description: z.string().trim().min(1, 'issue description must be filled out'),
  reporterName: z.string().trim().min(1, 'reporter name must be filled out'),
  reproSteps: z.string().trim().min(1, 'repro steps must not be empty').nullable().optional(),
  reporterContact: z.string().trim().min(1, 'reporter contact must be filled out'),
  priority: z.number().int().min(0).max(2).optional(),
});

const updateIssueSchema = z
  .object({
    title: z.string().trim().min(1, 'issue title must be filled out').optional(),
    description: z.string().trim().min(1, 'issue description must be filled out').optional(),
    reporterName: z.string().trim().min(1, 'reporter name must be filled out').optional(),
    reproSteps: z.string().trim().min(1, 'repro steps must not be empty').nullable().optional(),
    reporterContact: z.string().trim().min(1, 'reporter contact must be filled out').optional(),
    priority: z.number().int().min(0).max(2).optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.reporterName !== undefined ||
      data.reproSteps !== undefined ||
      data.reporterContact !== undefined ||
      data.priority !== undefined,
    {
      message: 'At least one issue field must be provided.',
    }
  );

const updateIssueStatusSchema = z.object({
  status: z.enum(['UNSOLVED', 'IN_PROGRESS', 'FIXED']),
});

const getIssueQuerySchema = z.object({
  priority: z.coerce.number().int().min(0).max(2).optional(),
});

export const validateIssueId = (req: Request, res: Response, next: NextFunction): void => {
  const result = issueIdSchema.safeParse(req.params);
  if (!result.success) {
    res.status(400).json({ error: 'The issue ID in the path must be a positive integer.' });
    return;
  }
  next();
};

export const validateCreateIssue = (req: Request, res: Response, next: NextFunction): void => {
  const result = createIssueSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'The bug report payload is missing required fields or contains invalid values.',
      details: z.treeifyError(result.error),
    });
    return;
  }
  next();
};

export const validateUpdateIssue = (req: Request, res: Response, next: NextFunction): void => {
  const result = updateIssueSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'The issue update payload contains invalid values.',
      details: z.treeifyError(result.error),
    });
    return;
  }
  next();
};

export const validateGetIssueQuery = (req: Request, res: Response, next: NextFunction): void => {
  const result = getIssueQuerySchema.safeParse(req.query);
  if (!result.success) {
    res.status(400).json({
      error: 'The issue query parameters are missing required fields or contain invalid values.',
      details: z.treeifyError(result.error),
    });
    return;
  }
  next();
};

export const validateUpdateIssueStatus = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const result = updateIssueStatusSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'The issue status update payload contains invalid values.',
      details: z.treeifyError(result.error),
    });
    return;
  }
  next();
};
