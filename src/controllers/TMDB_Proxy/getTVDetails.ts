// controllers/getTVDetails.ts
import { Request, Response } from 'express';

type TMDBTVResponse = {
  id: number;
  name: string;
  genres: { id: number; name: string }[];
  first_air_date: string;
  number_of_episodes: number;
  number_of_seasons: number;
  overview: string;
  poster_path: string | null;
};

const formatTVDetailsResponse = (data: TMDBTVResponse) => {
  return {
    id: data.id,
    title: data.name,
    genre: data.genres.map((g) => g.name).join(', '),
    year: data.first_air_date ? data.first_air_date : 'Unknown',
    episodes: data.number_of_episodes,
    seasons: data.number_of_seasons,
    summary: data.overview,
    poster_url: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
  };
};

export const getTVDetails = async (req: Request, res: Response) => {
  const { Id } = req.query;

  try {
    // Fetch from TMDB
    const result = await fetch(`https://api.themoviedb.org/3/tv/${Id}?api_key=${process.env.TMDB_API_KEY}`);
    
    const data = (await result.json()) as TMDBTVResponse; // get data assign type to TMDBTVResponse

    if (!result.ok) return res.status(result.status).json(data);

    // Transform the data
    const formattedTVDetail = formatTVDetailsResponse(data);

    res.json(formattedTVDetail);
  } catch (error) {
    res.status(502).json({ error: 'Failed to reach TMDB' });
  }
};
