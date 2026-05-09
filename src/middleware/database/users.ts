import { Request, Response, NextFunction } from 'express';

// Validates :id param is a valid number. Used on GET, PUT, DELETE /users/:id.
export const validateUserId = (req: Request, res: Response, next: NextFunction): void => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'The user ID in the path must be a positive integer.' });
    return;
  }
  next();
};

// Validates body for POST /users — username and email required, display_name optional.
export const validateCreateUser = (req: Request, res: Response, next: NextFunction): void => {
  const { username, email, display_name } = (req.body ?? {}) as {
    username?: string;
    email?: string;
    display_name?: string;
  };

  if (!username || typeof username !== 'string' || username.trim() === '') {
    res
      .status(400)
      .json({ error: 'The request body must include a non-empty string for "username".' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ error: 'The request body must include a valid email address.' });
    return;
  }

  if (
    display_name !== undefined &&
    (typeof display_name !== 'string' || display_name.trim() === '')
  ) {
    res.status(400).json({ error: 'If provided, "display_name" must be a non-empty string.' });
    return;
  }

  next();
};

// Validates body for PUT /users/:id — display_name must be present and non-empty.
export const validateUpdateUser = (req: Request, res: Response, next: NextFunction): void => {
  const { display_name } = (req.body ?? {}) as { display_name?: string };

  if (!display_name || typeof display_name !== 'string' || display_name.trim() === '') {
    res
      .status(400)
      .json({ error: 'The request body must include a non-empty string for "display_name".' });
    return;
  }

  next();
};
