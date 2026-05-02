import { Request, Response, NextFunction } from 'express';

// Validates :id param is a valid number. Used on GET, PUT, DELETE /users/:id.
export const validateUserId = (req: Request, res: Response, next: NextFunction): void => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'id must be a positive integer' });
    return;
  }
  next();
};

// Validates body for POST /users — subjectId, username and email required, display_name optional.
export const validateCreateUser = (req: Request, res: Response, next: NextFunction): void => {
  const { subjectId, username, email, display_name } = (req.body ?? {}) as {
    subjectId?: string;
    username?: string;
    email?: string;
    display_name?: string;
  };
//------------------------------TEMPORARY, CHANGE LATER---------------------------------------------------

  if (!subjectId || typeof subjectId !== 'string' || subjectId.trim() === '') {
    res.status(400).json({ error: 'subjectId is required and must be a non-empty string' });
    return;
  }

//--------------------------------------------------------------------------------------------------

  if (!username || typeof username !== 'string' || username.trim() === '') {
    res.status(400).json({ error: 'username is required and must be a non-empty string' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ error: 'a valid email is required' });
    return;
  }

  if (
    display_name !== undefined &&
    (typeof display_name !== 'string' || display_name.trim() === '')
  ) {
    res.status(400).json({ error: 'display_name must be a non-empty string' });
    return;
  }

  next();
};

// Validates body for PUT /users/:id — display_name must be present and non-empty.
export const validateUpdateUser = (req: Request, res: Response, next: NextFunction): void => {
  const { display_name } = (req.body ?? {}) as { display_name?: string };

  if (!display_name || typeof display_name !== 'string' || display_name.trim() === '') {
    res.status(400).json({ error: 'display_name is required and must be a non-empty string' });
    return;
  }

  next();
};
