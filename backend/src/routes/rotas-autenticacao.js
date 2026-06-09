import { Router } from 'express';
import { authController } from '../controllers/controlador-autenticacao.js';
import { validate } from '../middlewares/intermediario-validar-requisicao.js';
import { forgotPasswordSchema, loginSchema, refreshSchema, registerSchema } from '../validators/esquemas-autenticacao.js';
import { asyncHandler } from '../utils/manipulador-rota-assincrona.js';

const router = Router();
router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh));
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));

export default router;
