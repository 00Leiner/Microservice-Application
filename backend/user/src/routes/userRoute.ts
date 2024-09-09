import express from 'express';
import { userController } from '../controllers/userController';
import { validateUserInput, validateUserUpdateInput, validateLoginInput } from '../middleware/validateUserInput';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

router.post('/register', validateUserInput, asyncHandler(userController.createUser));
router.post('/login', validateLoginInput, asyncHandler(userController.loginUser));
router.get('/:id', asyncHandler(userController.getUserById));
router.put('/:id', validateUserUpdateInput, asyncHandler(userController.updateUser));
router.delete('/:id', asyncHandler(userController.deleteUser));

export default router;