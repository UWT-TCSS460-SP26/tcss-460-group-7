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

const buildImageUrl = (path: string | null) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
};

const formatTVDetailsResponse = (data: TMDBTVResponse) => {
  return {
    id: data.id,
    title: data.name,
    genre: data.genres.map((g) => g.name).join(', '),
    year: data.first_air_date ? data.first_air_date.slice(0, 4) : 'Unknown',
    episodes: data.number_of_episodes,
    seasons: data.number_of_seasons,
    summary: data.overview,
    poster_url: buildImageUrl(data.poster_path),
  };
};

export const getTVDetails = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: 'The path parameter "id" is required and must contain a TMDB TV show ID.',
    });
  }

  try {
    // Fetch from TMDB using Bearer Token
    const result = await fetch(`https://api.themoviedb.org/3/tv/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        accept: 'application/json',
      },
    });

    const data = (await result.json()) as TMDBTVResponse;

    if (!result.ok) {
      return res.status(result.status).json(data);
    }

    // Transform the data
    const formattedTVDetail = formatTVDetailsResponse(data);

    res.json(formattedTVDetail);
  } catch (_error) {
    res.status(502).json({
      error: 'The API could not reach TMDB while fetching TV show details.',
    });
  }
};
