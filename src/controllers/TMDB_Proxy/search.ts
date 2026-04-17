import { Request, Response } from 'express';

const GENRE: Record<string, number> = {
  action:28,
  comedy:35,
  horror:27,
  adventure: 12,
  animation: 16,
  crime: 80,
  documentary:99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  science_fiction: 878,
  sci_fi:878,
  tv_movie: 10770,
  thriller:53,
  war:10752,
  western:37,
  action_adventure:10759,
  kids:10762,
  news:10764,
  reality:10764,
  sci_fi_fantasy:10765,
  science_fiction_fantasy:10765,
  soap:10766,
  talk:10767,
  war_politics:10768,
};

/**
 * query with title={insert movie title}
 * 
 * @param request Movie title
 * @param response error code 200, 400
 * @returns Json data of the movie.
 */
export const getSearchedMovieTitle = async (request: Request, response: Response) => {
  const title = request.query.title as string;

  if(typeof title != 'string' || title == null || title.trim() === '') {
    return response.status(400).json({
      error: 400,
      message: 'Missing required query parameter'
    });
  }

  const result = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        accept: 'application/json',
      },
    }
  );

  if(!result.ok) {
    return response.status(result.status).json({
      error: result.status,
      message: 'TMDB search request had failed'
    });
  }

  const data = await result.json();

  return response.status(200).json(data);
};


/**
 * query with ?genre={enter genre}
 * 
 * query with page number ?genre={enter genre}&page=1
 * 
 * @param request genre of the movie and/or (optional) the page number 
 * @param response status code 200, 400, 404
 * @returns A list of movies with the given genre
 */
export const getSearchedMovieGenre = async (request: Request, response: Response) => {
  const genre = request.query.genre as string;

  const page = Number(request.query.page ?? 1);

  if(typeof genre != 'string' || genre === null || genre.trim() === '') {
      return response.status(400).json({
        error: 400,
        message: 'invalid genre format'
      });
  }

  if(page <= 0 || !Number.isInteger(page)) {
    return response.status(400).json({
      error:400,
      message:'invalid page number'
    });
  }

  const genreCode = GENRE[genre.toLowerCase().replace(/\s+/g, '_')];

  if(!genreCode) {
    return response.status(404).json({
      error: 404,
      message: 'Genre not found'
    });
  }

  const result = await fetch(
    `https://api.themoviedb.org/3/discover/movie?with_genres=${genreCode}&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        accept: 'application/json',
      },
    }
  );

  if(!result.ok) {
    return response.status(result.status).json({
      error:result.status,
      message:"TMDB search request had failed"
    });
  }

  const data = await result.json();

  return response.status(200).json(data);
}


/**
 * query with ?cast={enter the actors name}
 * 
 * query with page number ?cast={enter the actors name}&page=1
 * 
 * @param request actors name and/or (optional) page number
 * @param response staatus code 200, 400
 * @returns a list of movies that the cast memeber is in
 */
export const getSearchedMovieCast = async (request:Request, response:Response) => {

  const cast = request.query.cast as string;

  const page = Number(request.query.page ?? 1);

  if(page <= 0 || !Number.isInteger(page)) {
    return response.status(400).json({
      error:400,
      message:'invalid page number'
    });
  }

  if(typeof cast != 'string' || cast.trim() === '' || cast === null) {
    return response.status(400).json({
        error: 400,
        message: 'invalid cast format'
      });
  }

  const castIdResult = await fetch(
    `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(cast)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        accept: 'application/json',
      },
    }
  );

  if(!castIdResult.ok) {
    return response.status(castIdResult.status).json({
      error:castIdResult,
      message: "TMDB search request had failed"
    });
  }

  const castData = await castIdResult.json() as {
    results: {id: number} [];
  };

  if(castData.results.length === 0) {
    return response.status(404).json({
      error:404,
      message: 'Cast member not found'
    });
  }

  const castId = castData.results[0].id;
  

  const castMovieResult = await fetch(
    `https://api.themoviedb.org/3/discover/movie?with_cast=${castId}&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        accept: 'application/json',
      },
    }
  );

  if(!castMovieResult.ok) {
    return response.status(castMovieResult.status).json({
      error:castMovieResult.status,
      message: "TMDB failed to search for casts movie"
    });
  }

  const data = await castMovieResult.json();

  return response.status(200).json(data);
}