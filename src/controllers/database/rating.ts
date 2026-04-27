import { Request, Response } from 'express';
import { prisma } from '@/prisma';
import { Prisma } from '@prisma/client';

/**
 * Create a new rating
 *
 * Requires authorId, TitleId and rating integer
 */
export const createRating = async (request: Request, response: Response) => {
  const authorId = request.user!.sub;
  const title_id = Number(request.params.title_id);
  const { rating } = request.body;

  try {
    const titleRating = await prisma.rating.create({
      data: { authorId, title_id, rating },
      include: { author: { select: { id: true, display_name: true } } },
    });
    response.status(201).json({ data: titleRating });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        try {
          const updatedRating = await prisma.rating.update({
            where: {
              authorId_title_id: {
                authorId,
                title_id,
              },
            },
            data: { rating },
            include: { author: { select: { id: true, display_name: true } } },
          });

          response.json({ data: updatedRating });
        } catch (_error) {
          response.status(400).json({ error: 'Failed to update rating' });
        }
      } else {
        response
          .status(500)
          .json({ error: "Something happened and could'nt reach the server to update" });
      }
      return;
    }

    response
      .status(500)
      .json({ error: "Something happened and could'nt reach the server to update" });
  }
};

/**
 * Get all of the users ratings in the database for a specific movie
 *
 * Requires titleId
 */
export const getRatingsBTitleId = async (request: Request, response: Response) => {
  const title_id = Number(request.params.title_id);

  try {
    const ratings = await prisma.rating.findMany({
      where: { title_id },
      include: { author: { select: { id: true, display_name: true } } },
    });

    if (ratings.length === 0) {
      response.status(404).json({ error: 'The movie has no ratings.' });
      return;
    }
    response.json({ data: ratings });
  } catch (_error) {
    response.status(500).json({ error: 'Failed to retrieve movie rating' });
  }
};

/**
 *
 * Get a specific users rating for a title
 *
 * Requires authorId and titleId
 */
export const getRatingByUserIdMovieId = async (request: Request, response: Response) => {
  const authorId = Number(request.params.authorId);
  const title_id = Number(request.params.title_id);

  try {
    const rating = await prisma.rating.findUnique({
      where: {
        authorId_title_id: {
          authorId,
          title_id,
        },
      },
      include: { author: { select: { id: true, display_name: true } } },
    });

    if (!rating) {
      response.status(404).json({
        error: 'The user had not made a rating for the title',
      });
      return;
    }

    response.status(200).json({ data: rating });
  } catch (_error) {
    response.status(500).json({ error: 'There was an error with the server' });
  }
};

/**
 * Get all of the ratings made by a specific user
 *
 * Requires authorId, titleId, new Rating
 */
export const updateUsersRating = async (request: Request, response: Response) => {
  const authorId = request.user!.sub;
  const title_id = Number(request.params.title_id);
  const { rating } = request.body;

  try {
    const updatedRating = await prisma.rating.update({
      where: {
        authorId_title_id: {
          authorId,
          title_id,
        },
      },
      data: { rating },
      include: { author: { select: { id: true, display_name: true } } },
    });

    if (!updatedRating) {
      response.status(404).json({ error: 'rating not found' });
    }

    response.json({ data: updatedRating });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      response.status(404).json({ error: 'rating not found' });
      return;
    }

    response.status(500).json({ error: 'There was a server error' });
  }
};

/**
 * Gets all the ratings made by a user
 *
 * Requires authorId
 */
export const getAllUserRating = async (request: Request, response: Response) => {
  const authorId = Number(request.params.authorId);
  const page = Number(request.query.page ?? 1);
  const pageSize = 10;

  if (!Number.isInteger(authorId) || authorId <= 0) {
    response.status(400).json({ error: 'A valid authorId is required' });
    return;
  }

  if (!Number.isInteger(page) || page <= 0) {
    response.status(400).json({ error: 'Page must be a positive integer' });
    return;
  }

  try {
    const totalRatings = await prisma.rating.count({
      where: { authorId },
    });

    const ratings = await prisma.rating.findMany({
      where: { authorId },
      include: {
        author: { select: { id: true, display_name: true } },
      },
      orderBy: { id: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    response.status(200).json({
      data: ratings,
      pagination: {
        page,
        pageSize,
        totalRatings,
        totalPages: Math.ceil(totalRatings / pageSize),
      },
    });
  } catch (_error) {
    response.status(500).json({ error: 'There was a server error' });
  }
};

/**
 * Deletes a movie rating made by the user
 *
 * Requires UserId and MovieId
 */
export const deleteRating = async (request: Request, response: Response) => {
  const title_id = Number(request.params.title_id);
  const { sub: authorId } = request.user!;

  if (!Number.isInteger(title_id) || title_id <= 0) {
    response.status(400).json({ error: 'A valid title_id is required' });
    return;
  }

  try {
    const deletedRating = await prisma.rating.delete({
      where: {
        authorId_title_id: {
          authorId,
          title_id,
        },
      },
      include: { author: { select: { id: true, display_name: true } } },
    });

    response.status(200).json({ data: deletedRating });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      response.status(404).json({ error: 'Rating not found' });
      return;
    }

    response.status(500).json({ error: 'There was a server error' });
  }
};
