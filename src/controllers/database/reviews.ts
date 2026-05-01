// Controllers for the users domain. Teammates: add review.ts and rating.ts in this folder.
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

// POST /reviews — create a new review. Requires auth.
export const createReview = async (req: Request, res: Response): Promise<void> => {
  const authorId = req.user!.sub;
  const { content, header, title_id } = req.body as {
    content: string;
    header?: string;
    title_id: number;
  };

  try {
    const review = await prisma.review.create({
      data: {
        authorId,
        content,
        header,
        title_id,
      },
    });
    res.status(201).json(review);
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        res.status(409).json({ error: 'You have already reviewed this title' });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// GET /review — fetch all reviews, paginated with optional filters. Requires auth and admin role (1).

const ALLOWED_SORT_FIELDS = ['id', 'authorId', 'title_id', 'createdAt', 'upvotes', 'downvotes'];
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

// GET /reviews/title/:title_id — fetch all reviews for a movie, paginated.
export const getReviewsByTitleId = async (req: Request, res: Response): Promise<void> => {
  const title_id = Number(req.params.title_id);
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { title_id },
        include: {
          author: {
            select: {
              id: true,
              display_name: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: { title_id },
      }),
    ]);

    res.status(200).json({
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to retrieve reviews for this movie' });
  }
};

export const getAllReviews = async (request: Request, response: Response): Promise<void> => {
  const page = Math.max(1, Number(request.query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(request.query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  const sort = ALLOWED_SORT_FIELDS.includes(String(request.query.sort))
    ? String(request.query.sort)
    : 'createdAt';
  const order = request.query.order === 'desc' ? 'desc' : 'asc';
  const { id } = request.query;
  const where = {
    ...(id ? { id: Number(id) } : {}),
  };
  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
      }),
      prisma.review.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    response.json({
      data: reviews,
      pagination: { page, limit, total, totalPages },
    });
  } catch (_error) {
    response.status(500).json({ error: 'Failed to retrieve reviews' });
  }
};

// GET /review/:id — fetch a user by their id. Public, no auth required.
export const getReviewById = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }
  res.status(200).json(review);
};

// PUT /reviews/:id — update a review. Requires auth; users can only update their own reviews.
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  const reviewId = Number(req.params.id);

  const { content, header } = req.body as {
    content?: string;
    header?: string;
  };

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (existingReview.authorId !== req.user!.sub) {
      res.status(403).json({ error: 'You can only update your own reviews' });
      return;
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        content,
        header,
      },
    });

    res.status(200).json(updatedReview);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// DELETE /reviews/:id — delete a review. Requires auth; users can delete their own review, admins can delete any review.
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  const reviewId = Number(req.params.id);
  const isAdmin = req.user!.role === 1;

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (existingReview.authorId !== req.user!.sub && !isAdmin) {
      res.status(403).json({ error: 'You can only delete your own reviews' });
      return;
    }

    const deletedReview = await prisma.review.delete({
      where: { id: reviewId },
    });

    res.status(200).json(deletedReview);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// POST /reviews/:id/upvote — Increment the upvote count of a review
export const upvoteReview = async (req: Request, res: Response): Promise<void> => {
  const reviewId = Number(req.params.id);

  try {
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        upvotes: { increment: 1 },
      },
    });
    res.status(200).json(updatedReview);
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        res.status(404).json({ error: 'Review not found' });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to upvote review' });
  }
};

// POST /reviews/:id/downvote — Increment the downvote count of a review
export const downvoteReview = async (req: Request, res: Response): Promise<void> => {
  const reviewId = Number(req.params.id);

  try {
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        downvotes: { increment: 1 },
      },
    });
    res.status(200).json(updatedReview);
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        res.status(404).json({ error: 'Review not found' });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to downvote review' });
  }
};

// POST /reviews/:id/remove-upvote — Decrement the upvote count of a review
export const removeUpvoteReview = async (req: Request, res: Response): Promise<void> => {
  const reviewId = Number(req.params.id);

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    if (existingReview.upvotes <= 0) {
      res.status(400).json({ error: 'Upvotes cannot be negative' });
      return;
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        upvotes: { decrement: 1 },
      },
    });
    res.status(200).json(updatedReview);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to remove upvote' });
  }
};

// POST /reviews/:id/remove-downvote — Decrement the downvote count of a review
export const removeDownvoteReview = async (req: Request, res: Response): Promise<void> => {
  const reviewId = Number(req.params.id);

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    if (existingReview.downvotes <= 0) {
      res.status(400).json({ error: 'Downvotes cannot be negative' });
      return;
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        downvotes: { decrement: 1 },
      },
    });
    res.status(200).json(updatedReview);
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        res.status(404).json({ error: 'Review not found' });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to remove downvote' });
  }
};
