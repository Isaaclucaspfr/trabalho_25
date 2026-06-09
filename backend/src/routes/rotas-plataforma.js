import { Router } from 'express';
import { platformController } from '../controllers/controlador-plataforma.js';
import { asyncHandler } from '../utils/manipulador-rota-assincrona.js';

const router = Router();

router.get('/stats', asyncHandler(platformController.stats));

export default router;
