# Sprint Narrative

    * API is not a passthrough

    * Every response must be transformed into our own schema and documented in our openAPI spec.

    * FrontEnd should not have any reference to TMBD api

    * Raw TMDB JSON coming out of our API is not
        acceptable

    * MVP:
        By the end of this sprint, your API proxies TMDB data for both movies and TV shows — search, details, and popular browsing — all through endpoints your team designed. Every response is transformed into your own documented schema (not raw TMDB JSON). Your OpenAPI spec covers all new endpoints, your test suite verifies them, and your TMDB API key is nowhere in your source code.

    * TMBD Documentation:
        https://developer.themoviedb.org/reference/intro/getting-started

### Frontend Development:

    * Search for TV shows so that "I can display search results with poster images and key metadata".
        - API proxies this to TMDB:
            * Minimum support -> searching by title
            * Other suport -> searching by:
                - Genre
                - cast
                - crew
                - runtime
                - trailers
                - similar titles
                - production companies

    * Retrieve details about a specific movie so that "I can display a rich content page with poster art, metadata, and synopsis"
        - Given a TV show identifier, return enough data to build a full detail page:
            * Minimum support:
                - Poster image
                - first air date
                - Synopsis

            * Other Support:
                - Number of seasons
                - Epsiode counts
                - networks instead of studios
                - ongoing vs ended status

    * Retrieve popular movies so that "I can feature trending content for users"
        - We decide on how to define "popular" and what data to return.
        - We generate our own schema.

    * Retrieve pupular TV shows so that "I can feature trending content for users"
        - We define "popular" and what ata to return.
        - Our own schema

    * Generate OpenAPI documentation for every endpoint so that "I can integrate without reading source code"

    * Create automated tests for every end point so that "I can trust that the API behaves as documented.
        - Every endpoint has tests using Jest and Supertest. Tests verify both success responses and error handling.
        - Test suit should run with `npm test` and pass cleanly

    * TMDB API key needs to be stored securely so that it's never exposed in source code or client responses.
        - Store the API key in .env variable. Must never appear in a commit, a response body, or your OpenAPI docs.

### Deliverables:

    * API serves movie search, movie details, and popular movies through your own endpoints
    * API serves TV show search, TV show details, and popular TV shows through your own endpoints
    * All responses are transformed into your own schema (no raw TMDB JSON)
    * OpenAPI documentation at /api-docs covers all new endpoints with response shapes
    * Automated test suite covers all endpoints (success and error cases)
    * TMDB API key is not committed to the repository
    * API is deployed and responds at your public URL
    * All team members have committed to the repository
    * Meeting minutes document updated with sprint planning and any ceremonies

# Possible Proxy Side Example:

```
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // local dev only; Render uses its own env vars

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  throw new Error("Missing TMDB_API_KEY environment variable");
}

app.use(cors());
app.use(express.json());

type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
};

type TmdbPopularResponse = {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
};

app.get("/api/movies/popular", async (_req: Request, res: Response) => {
  try {
    const response = await fetch("https://api.themoviedb.org/3/movie/popular?language=en-US&page=1", {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_API_KEY}`
      }
    });

    const data = (await response.json()) as TmdbPopularResponse | { status_message?: string };

    if (!response.ok) {
      return res.status(response.status).json({
        error: "TMDB request failed",
        details: data
      });
    }

    return res.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

app.get("/api/search/movie", async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(400).json({ error: "Missing query parameter: q" });
    }

    const url = new URL("https://api.themoviedb.org/3/search/movie");
    url.searchParams.set("query", query);
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("language", "en-US");
    url.searchParams.set("page", "1");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_API_KEY}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "TMDB search failed",
        details: data
      });
    }

    return res.json(data);
  } catch (error) {
    console.error("Search proxy error:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

# What to do after authenticating user:

- Make a guest authentication system as well

- Use sessiong_id to get users account data:
  - Favorites
  - Watchlist
  - Ratings
  - Account States
  - Account details tied to logged-in user

- Start developing API for queries.
