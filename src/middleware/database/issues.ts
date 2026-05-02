import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const createIssueSchema = z.object({
  content: z.string().trim().min(1, 'bug must be filled out'),
});

export const validateCreateIssue = (req: Request, res: Response, next: NextFunction): void => {
  const result = createIssueSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid request body please check format', details: result.error.format() });
    return;
  }
  next();
};
