import { Request, Response } from 'express';

const BASE_URL = 'https://api.themoviedb.org/3/tv/popular';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// TMDB tv show
type TMDBTVShow = {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  poster_path: string | null;
  vote_average: number;
  popularity: number;
};

// TMDB response
type TMDBTVResponse = {
  page: number;
  results: TMDBTVShow[];
  total_pages: number;
  total_results: number;
};

// New schema tv show
type TVSummary = {
  id: number;
  name: string;
  overview: string;
  firstAirDate: string;
  posterUrl: string | null;
  voteAverage: number;
  popularity: number;
};

// New schema response
type PopularTVResponse = {
  page: number;
  totalPages: number;
  totalResults: number;
  results: TVSummary[];
};

const formatTVShows = (data: TMDBTVResponse): PopularTVResponse => ({
  page: data.page,
  totalPages: data.total_pages,
  totalResults: data.total_results,
  results: data.results.map((show) => ({
    id: show.id,
    name: show.name,
    overview: show.overview,
    firstAirDate: show.first_air_date,
    posterUrl: show.poster_path ? `${TMDB_IMAGE_BASE_URL}${show.poster_path}` : null,
    voteAverage: show.vote_average,
    popularity: show.popularity,
  })),
});

export const getPopularTV = async (req: Request, res: Response) => {
  const lang = (req.query.language as string) ?? 'en-US';
  const page = (req.query.page as string) ?? '1';
  const adult = (req.query.include_adult as string) ?? 'false';

  const result = await fetch(`${BASE_URL}?language=${lang}&page=${page}&include_adult=${adult}`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
      accept: 'application/json',
    },
  });

  if (!result.ok) {
    return res.status(result.status).json({
      error: result.status,
      message: 'TMDB could not retrieve the list of popular TV shows.',
    });
  }

  const data = (await result.json()) as TMDBTVResponse;
  return res.status(200).json(formatTVShows(data));
};
