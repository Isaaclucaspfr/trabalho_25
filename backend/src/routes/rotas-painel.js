import { Router } from 'express';
import { authMiddleware } from '../middlewares/intermediario-autenticar-requisicao.js';
import { roleMiddleware } from '../middlewares/intermediario-autorizar-perfil.js';
import { dashboardController } from '../controllers/controlador-painel.js';
import { asyncHandler } from '../utils/manipulador-rota-assincrona.js';

const router = Router();
router.get('/metrics', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(dashboardController.metrics));

export default router;
