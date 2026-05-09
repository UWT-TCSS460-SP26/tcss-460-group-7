import { Request, Response } from 'express';

const BASE_URL_MOVIE = 'https://api.themoviedb.org/3/search/movie';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

type TMDBMovie = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  genre_ids: number[];
  poster_path: string | null;
  backdrop_path: string | null;
  popularity: number;
  vote_average: number;
  vote_count: number;
  original_language: string;
};

type TMDBMovieSearchResponse = {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
};

const buildImageUrl = (path: string | null) => {
  return path ? `${TMDB_IMAGE_BASE_URL}${path}` : null;
};

const formatMovieSearchResponse = (data: TMDBMovieSearchResponse) => {
  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    results: data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      overview: movie.overview,
      releaseDate: movie.release_date,
      genreIds: movie.genre_ids,
      popularity: movie.popularity,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      originalLanguage: movie.original_language,
      posterPath: movie.poster_path,
      posterUrl: buildImageUrl(movie.poster_path),
      backdropPath: movie.backdrop_path,
      backdropUrl: buildImageUrl(movie.backdrop_path),
    })),
  };
};

export const getSearchedMovieTitle = async (request: Request, response: Response) => {
  const title = request.query.q as string;

  if (typeof title !== 'string' || title === null || title.trim() === '') {
    return response.status(400).json({
      error: 400,
      message: 'The required query parameter "q" must be a non-empty movie title.',
    });
  }

  const result = await fetch(`${BASE_URL_MOVIE}?query=${encodeURIComponent(title)}`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
      accept: 'application/json',
    },
  });

  if (!result.ok) {
    return response.status(result.status).json({
      error: result.status,
      message: 'TMDB could not complete the movie title search request.',
    });
  }

  const data = (await result.json()) as TMDBMovieSearchResponse;

  return response.status(200).json(formatMovieSearchResponse(data));
};
