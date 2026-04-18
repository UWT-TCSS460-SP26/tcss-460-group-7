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

  try {
    // Fetch from TMDB
    const result = await fetch(
      `
      https://api.themoviedb.org/3/movie/${Id}?`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
          accept: 'application/json',
        },
      }
    );
    const data = (await result.json()) as TMDBMovieResponse; // get data assign type to TMDBMovieResponse
    if (!result.ok) return res.status(result.status).json(data); // if not ok return stat code
    const formattedMovieDetail = formatMovieDetailsResponse(data); // format the data

    res.json(formattedMovieDetail);
  } catch (error) {
    res.status(502).json({ error: 'Failed to reach TMDB' });
  }
};
