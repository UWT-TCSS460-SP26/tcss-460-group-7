import { Request, Response } from 'express';

const BASE_URL = 'https://api.themoviedb.org/3/movie/popular';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// TMDB one movie json structure
type TMDBMovie = {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  popularity: number;
};

// The acutal TMDB response
type TMDBMovieResponse = {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
};

// New schema for movie
type MovieSummary = {
  id: number;
  title: string;
  overview: string;
  releaseDate: string;
  posterUrl: string | null;
  voteAverage: number;
  popularity: number;
};

// New schema for repsonse
type PopularMoviesResponse = {
  page: number;
  totalPages: number;
  totalResults: number;
  results: MovieSummary[];
};

const formatMovies = (data: TMDBMovieResponse): PopularMoviesResponse => ({
  page: data.page,
  totalPages: data.total_pages,
  totalResults: data.total_results,
  results: data.results.map((movie) => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    releaseDate: movie.release_date,
    posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
    voteAverage: movie.vote_average,
    popularity: movie.popularity,
  })),
});

export const getPopularMovies = async (req: Request, res: Response) => {
  const lang = (req.query.language as string) ?? 'en-US';
  const page = (req.query.page as string) ?? '1';
  const region = (req.query.region as string) ?? '';

  const url = region
    ? `${BASE_URL}?language=${lang}&page=${page}&region=${region}`
    : `${BASE_URL}?language=${lang}&page=${page}`;

  const result = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
      accept: 'application/json',
    },
  });

  if (!result.ok) {
    return res.status(result.status).json({
      error: result.status,
      message: 'TMDB search request had failed',
    });
  }

  const data = (await result.json()) as TMDBMovieResponse;
  return res.status(200).json(formatMovies(data));
};
