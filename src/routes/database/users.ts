import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/requireAuth';
import {
  validateUserId,
  validateCreateUser,
  validateUpdateUser,
} from '../../middleware/database/users';
import {
  //
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../../controllers/database/user';

const usersRouter = Router();

usersRouter.post('/', validateCreateUser, createUser);
usersRouter.get('/', requireAuth, requireRole(1), getAllUsers);
usersRouter.get('/:id', validateUserId, getUserById);
usersRouter.put('/:id', validateUserId, requireAuth, validateUpdateUser, updateUser);
usersRouter.delete('/:id', validateUserId, requireAuth, deleteUser);

export { usersRouter };
