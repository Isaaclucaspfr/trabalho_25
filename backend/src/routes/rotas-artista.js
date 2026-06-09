import { Router } from 'express';
import { artistController } from '../controllers/controlador-artista.js';
import { authMiddleware } from '../middlewares/intermediario-autenticar-requisicao.js';
import { roleMiddleware } from '../middlewares/intermediario-autorizar-perfil.js';
import { upload } from '../middlewares/intermediario-enviar-arquivo.js';
import { validate } from '../middlewares/intermediario-validar-requisicao.js';
import { artistSchema } from '../validators/esquemas-artista.js';
import { asyncHandler } from '../utils/manipulador-rota-assincrona.js';

const router = Router();
router.get('/', asyncHandler(artistController.list));
router.get('/trending', asyncHandler(artistController.trending));
router.get('/:id', asyncHandler(artistController.byId));
router.post('/', authMiddleware, roleMiddleware('ADMIN'), upload.single('image'), validate(artistSchema), asyncHandler(artistController.create));
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), upload.single('image'), asyncHandler(artistController.update));
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(artistController.delete));

export default router;
