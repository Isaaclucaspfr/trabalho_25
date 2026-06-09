import { Router } from 'express';
import { locationController } from '../controllers/controlador-local.js';
import { authMiddleware } from '../middlewares/intermediario-autenticar-requisicao.js';
import { roleMiddleware } from '../middlewares/intermediario-autorizar-perfil.js';
import { validate } from '../middlewares/intermediario-validar-requisicao.js';
import { locationSchema } from '../validators/esquemas-local.js';
import { asyncHandler } from '../utils/manipulador-rota-assincrona.js';

const router = Router();
router.get('/', asyncHandler(locationController.list));
router.get('/:id', asyncHandler(locationController.byId));
router.post('/', authMiddleware, roleMiddleware('ADMIN'), validate(locationSchema), asyncHandler(locationController.create));
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(locationController.update));
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(locationController.delete));

export default router;
