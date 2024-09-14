import express from 'express';
import { userController } from '../controllers/userController';
import { validateUserInput, validateUserUpdateInput, validateLoginInput, validateGoogleAuthInput } from '../middleware/validateUserInput';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', validateUserInput, asyncHandler(userController.createUser));
router.post('/login', validateLoginInput, asyncHandler(userController.loginUser));
router.get('/:id', authMiddleware, asyncHandler(userController.getUserById));
router.put('/:id', authMiddleware, validateUserUpdateInput, asyncHandler(userController.updateUser));
router.delete('/:id', authMiddleware, asyncHandler(userController.deleteUser));
router.post('/google-auth', validateGoogleAuthInput, asyncHandler(userController.googleAuth));

export default router;