import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';

type MediaType = 'movie' | 'tv';

type TmdbMovieDetails = {
  id: number;
  title: string;
  genres: { id: number; name: string }[];
  release_date: string;
  overview: string;
  poster_path: string | null;
};

type TmdbTvDetails = {
  id: number;
  name: string;
  genres: { id: number; name: string }[];
  first_air_date: string;
  number_of_episodes: number;
  number_of_seasons: number;
  overview: string;
  poster_path: string | null;
};

type CommunityAggregate = {
  averageRating: number | null;
  ratingCount: number;
  reviewCount: number;
};

type ReviewPreview = {
  id: number;
  authorId: number | null;
  header: string | null;
  content: string | null;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  author: {
    id: number;
    username: string;
    display_name: string | null;
  } | null;
};

type EnrichedMediaResponse = {
  mediaType: MediaType;
  metadata: {
    id: number;
    title: string;
    genre: string;
    year: string;
    summary: string;
    poster_url: string | null;
    episodes?: number;
    seasons?: number;
  };
  community: CommunityAggregate;
  recentReviews: ReviewPreview[];
};

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const buildImageUrl = (path: string | null) => (path ? `${TMDB_IMAGE_BASE_URL}${path}` : null);

const isValidMediaType = (value: string): value is MediaType => value === 'movie' || value === 'tv';

const fetchTmdbDetails = async (mediaType: MediaType, id: number) => {
  const url =
    mediaType === 'movie'
      ? `https://api.themoviedb.org/3/movie/${id}`
      : `https://api.themoviedb.org/3/tv/${id}`;

  const result = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
      accept: 'application/json',
    },
  });

  const data = await result.json();

  if (!result.ok) {
    return { ok: false as const, status: result.status, data };
  }

  return { ok: true as const, data };
};

const formatMetadata = (
  mediaType: MediaType,
  data: TmdbMovieDetails | TmdbTvDetails
): EnrichedMediaResponse['metadata'] => {
  if (mediaType === 'movie') {
    const movie = data as TmdbMovieDetails;

    return {
      id: movie.id,
      title: movie.title,
      genre: movie.genres.map((g) => g.name).join(', '),
      year: movie.release_date ? movie.release_date.slice(0, 4) : 'Unknown',
      summary: movie.overview,
      poster_url: buildImageUrl(movie.poster_path),
    };
  }

  const tv = data as TmdbTvDetails;

  return {
    id: tv.id,
    title: tv.name,
    genre: tv.genres.map((g) => g.name).join(', '),
    year: tv.first_air_date ? tv.first_air_date.slice(0, 4) : 'Unknown',
    summary: tv.overview,
    poster_url: buildImageUrl(tv.poster_path),
    episodes: tv.number_of_episodes,
    seasons: tv.number_of_seasons,
  };
};

const buildCommunityAggregate = (
  ratings: { rating: number }[],
  reviewCount: number
): CommunityAggregate => {
  const ratingCount = ratings.length;

  if (ratingCount === 0) {
    return {
      averageRating: null,
      ratingCount: 0,
      reviewCount,
    };
  }

  const total = ratings.reduce((sum, row) => sum + row.rating, 0);

  return {
    averageRating: Number((total / ratingCount).toFixed(1)),
    ratingCount,
    reviewCount,
  };
};

type MediaWithReviewsParams = {
  mediaType: string;
  id: string;
};

/**
 * Requires media type, and media ID
 */
export const getMediaWithReviews = async (req: Request<MediaWithReviewsParams>, res: Response) => {
  const mediaType = req.params.mediaType;
  const id = Number(req.params.id);
  const recentReviewLimit = 5;

  if (!isValidMediaType(mediaType)) {
    return res.status(400).json({ error: 'mediaType must be movie or tv' });
  }

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  try {
    const tmdbResult = await fetchTmdbDetails(mediaType, id);

    if (!tmdbResult.ok) {
      return res.status(tmdbResult.status).json(tmdbResult.data);
    }

    const [ratings, reviews, reviewCount] = await Promise.all([
      prisma.rating.findMany({
        where: { title_id: id },
        select: { rating: true },
      }),
      prisma.review.findMany({
        where: { title_id: id },
        orderBy: { createdAt: 'desc' },
        take: recentReviewLimit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              display_name: true,
            },
          },
        },
      }),
      prisma.review.count({
        where: { title_id: id },
      }),
    ]);

    const responseBody: EnrichedMediaResponse = {
      mediaType,
      metadata: formatMetadata(mediaType, tmdbResult.data as TmdbMovieDetails | TmdbTvDetails),
      community: buildCommunityAggregate(ratings, reviewCount),
      recentReviews: reviews,
    };

    return res.status(200).json(responseBody);
  } catch (_error) {
    return res.status(502).json({ error: 'Failed to build enriched media response' });
  }
};
