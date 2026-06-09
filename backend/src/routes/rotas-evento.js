import { Router } from 'express';
import { eventController } from '../controllers/controlador-evento.js';
import { authMiddleware } from '../middlewares/intermediario-autenticar-requisicao.js';
import { roleMiddleware } from '../middlewares/intermediario-autorizar-perfil.js';
import { upload } from '../middlewares/intermediario-enviar-arquivo.js';
import { eventSchema } from '../validators/esquemas-evento.js';
import { validate } from '../middlewares/intermediario-validar-requisicao.js';
import { asyncHandler } from '../utils/manipulador-rota-assincrona.js';

const router = Router();

router.get('/', asyncHandler(eventController.list));
router.get('/:id', asyncHandler(eventController.byId));
router.post('/', authMiddleware, roleMiddleware('ADMIN'), upload.single('image'), validate(eventSchema), asyncHandler(eventController.create));
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), upload.single('image'), asyncHandler(eventController.update));
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(eventController.delete));

export default router;
