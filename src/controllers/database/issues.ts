import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

/* POST issues to report */
export const createIssue = async (request: Request, response: Response): Promise<void> => {
  try {
    const { title, description, reproSteps, reporterContact } = request.body;
    const authorId = request.user?.id;
    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        reproSteps,
        reporterContact,
        authorId,
      },
    });
    response.status(201).json(issue);
  } catch (_error) {response.status(500).json({ error: 'Internal server error' });}
};

/*PATCH /issues/:id/status — Update the status of an issue */
export const updateIssueStatus = async (req: Request, res: Response): Promise<void> => {
  const issueId = Number(req.params.id);
  const { status } = req.body;
  try {
    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: { status },
    });
    res.status(200).json(updatedIssue);
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        res.status(404).json({ error: 'Issue not found' });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to update issue status' });
  }
};
