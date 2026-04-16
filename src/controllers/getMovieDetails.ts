// controllers/getMovieDetails.ts
import { Request, Response } from 'express';

export const getMovieDetails = async (req: Request, res: Response) => {
  const { Id } = req.query;
  const apiKey = process.env.TMDB_API_KEY; // CHANGE if we have different env var name

  try {
    // Fetch from TMDB
    const result = await fetch(`https://api.themoviedb.org/3/movie/${Id}?api_key=${apiKey}`);
    const data: any = await result.json();

    if (!result.ok) return res.status(result.status).json(data);

    // Transform the data
    const transformedMovie = {
      id: data.id,
      title: data.title,
      genre: data.genres.map((g: any) => g.name).join(', '), // Convert genres array to string the theme json for genres is [{ id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, ...]
      year: data.release_date ? data.release_date : 'Unknown',
      summary: data.overview,
    };

    console.log('DEBUG: info from object literal is called ', transformedMovie); // Debugging log
    res.json(transformedMovie);
  } catch (error) {
    res.status(502).json({ error: 'Failed to reach TMDB' });
  }
};
