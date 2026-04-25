// Controllers for the users domain. Teammates: add review.ts and rating.ts in this folder.
import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

// POST /users — create a new user. display_name is optional and stored as null if not provided.
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { username, email, display_name } = req.body as {
    username: string;
    email: string;
    display_name?: string;
  };

  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        display_name: display_name ?? null,
        role: 2,
      },
    });
    res.status(201).json(user);
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'username or email already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// GET /users — fetch all users, paginated with optional filters. Requires auth and admin role (1).
// Query params: page (default 1), limit (default 20), username, email, role.
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  //filter system
  const where: Record<string, any> = {};
  if (req.query.username)
    where.username = { contains: req.query.username as string, mode: 'insensitive' };
  if (req.query.email) where.email = { contains: req.query.email as string, mode: 'insensitive' };
  if (req.query.role) where.role = Number(req.query.role);

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({ where, skip, take: limit }),
    prisma.user.count({ where }),
  ]);

  res.status(200).json({
    data: users,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};

// GET /users/:id — fetch a user by their id. Public, no auth required.
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.status(200).json(user);
};

// PUT /users/:id — update display_name. Requires auth; users can only update their own account.
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { display_name } = req.body as { display_name?: string };

  if (req.user!.sub !== id) {
    res.status(403).json({ error: 'You can only update your own account' });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { display_name },
    });
    res.status(200).json(user);
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// DELETE /users/:id — delete a user. Requires auth; users can delete their own account, admins can delete anyone.
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const isAdmin = req.user!.role === 1;
  const isSelf = req.user!.sub === id;

  if (!isAdmin && !isSelf) {
    res.status(403).json({ error: 'You can only delete your own account' });
    return;
  }

  try {
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User deleted' });
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
