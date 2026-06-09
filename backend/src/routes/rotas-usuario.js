import { Router } from 'express';
import { userController } from '../controllers/controlador-usuario.js';
import { authMiddleware } from '../middlewares/intermediario-autenticar-requisicao.js';
import { upload } from '../middlewares/intermediario-enviar-arquivo.js';
import { validate } from '../middlewares/intermediario-validar-requisicao.js';
import { updateProfileSchema } from '../validators/esquemas-usuario.js';
import { asyncHandler } from '../utils/manipulador-rota-assincrona.js';

const router = Router();
router.use(authMiddleware);
router.get('/me', asyncHandler(userController.me));
router.put('/me', validate(updateProfileSchema), asyncHandler(userController.updateMe));
router.post('/me/avatar', upload.single('avatar'), asyncHandler(userController.uploadAvatar));
router.get('/favorites', asyncHandler(userController.favorites));
router.post('/favorites/:eventId', asyncHandler(userController.toggleFavorite));

export default router;
