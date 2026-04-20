// controllers/getMovieDetails.ts
import { Request, Response } from 'express';

type TMDBMovieResponse = {
  id: number;
  title: string;
  genres: { id: number; name: string }[];
  release_date: string;
  overview: string;
  poster_path: string | null;
};

const buildImageUrl = (path: string | null) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
};

const formatMovieDetailsResponse = (data: TMDBMovieResponse) => {
  return {
    id: data.id,
    title: data.title,
    genre: data.genres.map((g) => g.name).join(', '),
    year: data.release_date ? data.release_date : 'Unknown',
    summary: data.overview,
    poster_url: buildImageUrl(data.poster_path),
  };
};

export const getMovieDetails = async (req: Request, res: Response) => {
  const { Id } = req.query;

  if (!Id) {
    return res.status(400).json({ error: 'Missing required query parameter: Id' });
  }

  try {
    // Fetch from TMDB using Bearer Token
    const result = await fetch(`https://api.themoviedb.org/3/movie/${Id}`, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        accept: 'application/json',
      },
    });

    const data = (await result.json()) as TMDBMovieResponse;
    if (!result.ok) return res.status(result.status).json(data);

    const formattedMovieDetail = formatMovieDetailsResponse(data);

    res.json(formattedMovieDetail);
  } catch (_error) {
    res.status(502).json({ error: 'Failed to reach TMDB' });
  }
};
