import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;
const DEFAULT_MIN_COUNT = 3;

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

type AggregateRow = {
  title_id: bigint;
  media_type: string;
  avg_rating: string;
  rating_count: bigint;
};

const buildImageUrl = (path: string | null) => (path ? `${TMDB_IMAGE_BASE}${path}` : null);

const fetchTmdbMetadata = async (
  mediaType: string,
  titleId: number
): Promise<TmdbMovieDetails | TmdbTvDetails | null> => {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) return null;

  const url =
    mediaType === 'movie'
      ? `https://api.themoviedb.org/3/movie/${titleId}`
      : `https://api.themoviedb.org/3/tv/${titleId}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as TmdbMovieDetails | TmdbTvDetails;
  } catch {
    return null;
  }
};

const formatMetadata = (mediaType: string, data: TmdbMovieDetails | TmdbTvDetails) => {
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

export const getTopRated = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit) || DEFAULT_LIMIT));
  const minCount = Math.max(1, Number(req.query.minCount) || DEFAULT_MIN_COUNT);
  const offset = (page - 1) * limit;

  try {
    const [rows, countResult] = await Promise.all([
      prisma.$queryRaw<AggregateRow[]>`
        SELECT title_id, media_type, AVG(rating) AS avg_rating, COUNT(*) AS rating_count
        FROM ratings
        WHERE media_type IS NOT NULL
        GROUP BY title_id, media_type
        HAVING COUNT(*) >= ${minCount}
        ORDER BY avg_rating DESC, rating_count DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      prisma.$queryRaw<[{ total: bigint }]>`
        SELECT COUNT(*) AS total
        FROM (
          SELECT title_id
          FROM ratings
          WHERE media_type IS NOT NULL
          GROUP BY title_id, media_type
          HAVING COUNT(*) >= ${minCount}
        ) AS filtered
      `,
    ]);

    const total = Number(countResult[0].total);

    const enriched = await Promise.all(
      rows.map(async (row, index) => {
        const titleId = Number(row.title_id);
        const raw = await fetchTmdbMetadata(row.media_type, titleId);
        return {
          rank: offset + index + 1,
          title_id: titleId,
          media_type: row.media_type,
          avgRating: Number(Number(row.avg_rating).toFixed(2)),
          ratingCount: Number(row.rating_count),
          metadata: raw ? formatMetadata(row.media_type, raw) : null,
        };
      })
    );

    res.status(200).json({
      data: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (_error) {
    res.status(500).json({ error: 'The server could not retrieve the top-rated list.' });
  }
};
