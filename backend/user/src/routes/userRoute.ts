import express from 'express';
import { userController } from '../controllers/userController';
import { validateUserInput, validateUserUpdateInput, validateLoginInput, validateGoogleAuthInput } from '../middleware/validateUserInput';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', validateUserInput, asyncHandler(userController.createUser));
router.post('/login', validateLoginInput, asyncHandler(userController.loginUser));
router.get('/:_id', authMiddleware, asyncHandler(userController.getUserById));
router.put('/:_id', authMiddleware, validateUserUpdateInput, asyncHandler(userController.updateUser));
router.delete('/:_id', authMiddleware, asyncHandler(userController.deleteUser));
router.post('/google-login', validateGoogleAuthInput, asyncHandler(userController.googleLogin));
router.post('/google-signup', validateGoogleAuthInput, asyncHandler(userController.googleSignup));

export default router;