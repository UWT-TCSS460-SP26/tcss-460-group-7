import { Request, Response } from 'express';

export const getRequestToken = async (_request: Request, response: Response) => {
  const apikey = process.env.TMDB_API_KEY;
  const requestUrl = 'https://api.themoviedb.org/3/authentication/token/new';

  if (!apikey || apikey.length <= 0) {
    response.status(500).json({ error: 'A valid API key is required.' });
    return;
  }

  try {
    const result = await fetch(`${requestUrl}?api_key=${apikey}`);
    const request_token = (await result.json()) as Record<string, unknown>;

    if (!result.ok) {
      response.status(result.status).json({
        error: 'Authentication token returned invalid from the server',
      });
      return;
    }
    response.json(request_token);
  } catch (_error) {
    response.status(502).json({ error: 'Failed to reach TMDB service' });
  }
};

export const validateRequestToken = async (request: Request, response: Response) => {
  const requestToken = request.query.request_token as string;

  if (!requestToken || typeof requestToken !== 'string') {
    response.status(400).json({ error: 'Valid request token is required' });
    return;
  }

  const redirectUrl = `https://www.themoviedb.org/authenticate/`;

  try {
    response.redirect(`${redirectUrl}${requestToken}`);
  } catch (_error) {
    response.status(502).json({ error: 'Failed to reach TMDB service' });
  }
};

export const getSessionId = async (request: Request, response: Response) => {
  const create_session_url = 'https://api.themoviedb.org/3/authentication/session/new';

  const apikey = process.env.TMDB_API_KEY;

  const requestToken = request.query.request_token as string;

  if (!requestToken || typeof requestToken !== 'string') {
    response.status(400).json({ error: 'Valid request token is required' });
    return;
  }

  if (!apikey) {
    response.status(500).json({ error: 'TMDB API key is invalid' });
    return;
  }

  try {
    const sessionResponse = await fetch(`${create_session_url}?api_key=${apikey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request_token: requestToken,
      }),
    });

    const session_data = (await sessionResponse.json()) as Record<string, unknown>;

    if (!sessionResponse.ok) {
      response.status(sessionResponse.status).json(session_data);
      return;
    }

    response.json({ session_id: session_data.session_id });
  } catch (_error) {
    response.status(502).json({ error: 'Failed to reach TMDB services' });
  }
};
