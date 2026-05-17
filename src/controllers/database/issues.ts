import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

/* POST issues to report */
export const createIssue = async (request: Request, response: Response): Promise<void> => {
  try {
    const { title, description, reporterName, reproSteps, reporterContact, priority } =
      request.body as {
        title: string;
        description: string;
        reporterName: string;
        reproSteps?: string | null;
        reporterContact: string;
        priority?: number;
      };
    const authorId = request.user?.id;
    const normalizedPriority = priority ?? 2;

    const issue = await prisma.issue.create({
      data: {
        priority: normalizedPriority,
        title,
        description,
        reporterName,
        reproSteps,
        reporterContact,
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

/**
 * GET issue reports
 */
export const getIssue = async (request: Request, response: Response): Promise<void> => {
  try {
    const priority =
      typeof request.query.priority === 'string' ? Number(request.query.priority) : undefined;

    const issues = await prisma.issue.findMany({
      where: priority !== undefined ? { priority } : {},
      include: {
        author: {
          select: {
            id: true,
            username: true,
            display_name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    response.status(200).json(issues);
  } catch (_error) {
    response.status(500).json({
      error: 'The server could not retrieve the issue list.',
    });
  }
};

/**
 * PATCH issue report
 */
export const updateIssue = async (request: Request, response: Response): Promise<void> => {
  const issueId = Number(request.params.id);
  const isAdmin = request.user!.role === 1;
  const { title, description, reporterName, reproSteps, reporterContact, priority } =
    request.body as {
      title?: string;
      description?: string;
      reporterName?: string;
      reproSteps?: string | null;
      reporterContact?: string;
      priority?: number;
    };

  try {
    const existingIssue = await prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!existingIssue) {
      response.status(404).json({ error: 'No issue was found for the provided ID.' });
      return;
    }

    if (existingIssue.authorId !== request.user!.id && !isAdmin) {
      response.status(403).json({
        error: 'You are only allowed to update issues that you created unless you are an admin.',
      });
      return;
    }

    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(reporterName !== undefined ? { reporterName } : {}),
        ...(reproSteps !== undefined ? { reproSteps } : {}),
        ...(reporterContact !== undefined ? { reporterContact } : {}),
        ...(priority !== undefined ? { priority } : {}),
      },
    });

    response.status(200).json(updatedIssue);
  } catch (_error) {
    response.status(500).json({
      error: 'The server could not update the issue.',
    });
  }
};

/**
 * PATCH issue status
 */
export const updateIssueStatus = async (request: Request, response: Response): Promise<void> => {
  const issueId = Number(request.params.id);
  const { status } = request.body as {
    status: 'UNSOLVED' | 'IN_PROGRESS' | 'FIXED';
  };

  try {
    const existingIssue = await prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!existingIssue) {
      response.status(404).json({ error: 'No issue was found for the provided ID.' });
      return;
    }

    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: { status },
    });

    response.status(200).json(updatedIssue);
  } catch (_error) {
    response.status(500).json({
      error: 'The server could not update the issue status.',
    });
  }
};

/**
 * DELETE issue report
 */
export const deleteIssue = async (request: Request, response: Response): Promise<void> => {
  const issueId = Number(request.params.id);
  const isAdmin = request.user!.role === 1;

  try {
    const existingIssue = await prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!existingIssue) {
      response.status(404).json({ error: 'No issue was found for the provided ID.' });
      return;
    }

    if (existingIssue.authorId !== request.user!.id && !isAdmin) {
      response.status(403).json({
        error: 'You are only allowed to delete issues that you created unless you are an admin.',
      });
      return;
    }

    const deletedIssue = await prisma.issue.delete({
      where: { id: issueId },
    });

    response.status(200).json(deletedIssue);
  } catch (_error) {
    response.status(500).json({
      error: 'The server could not delete the issue.',
    });
  }
};
