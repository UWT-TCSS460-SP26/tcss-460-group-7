import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const createIssueSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  reproSteps: z.string().trim().optional(),
  reporterContact: z.string().trim().optional(),
});

export const validateCreateIssue = (req: Request, res: Response, next: NextFunction): void => {
  const result = createIssueSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Invalid bug report format',
      details: result.error.issues.map((e) => ({ path: e.path, message: e.message })),
    });
    return;
  }
  next();
};

const updateIssueStatusSchema = z.object({
  status: z.enum(['UNSOLVED', 'IN_PROGRESS', 'FIXED']),
});

export const validateUpdateIssueStatus = (req: Request, res: Response, next: NextFunction): void => {
  const result = updateIssueStatusSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Invalid status update',
      details: result.error.issues.map((e) => ({ path: e.path, message: e.message })),
    });
    return;
  }
  next();
};
