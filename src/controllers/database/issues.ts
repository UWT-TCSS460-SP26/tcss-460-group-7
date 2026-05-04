import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

/**
 * POST issues to report
 */
export const createIssue = async (request: Request, response: Response): Promise<void> => {
  try {
    const { content } = request.body;
    const authorId = request.user?.id;

    const issue = await prisma.issue.create({
      data: {
        content,
        authorId,
      },
    });

    response.status(201).json(issue);
  } catch (_error) {
    // console.error('Error creating issue:', error);
    response.status(500).json({
      error: 'The server could not submit the bug report.',
    });
  }
};
