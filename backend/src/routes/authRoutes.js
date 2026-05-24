import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { forgotPasswordSchema, loginSchema, refreshSchema, registerSchema } from '../validators/authValidator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh));
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));

export default router;
