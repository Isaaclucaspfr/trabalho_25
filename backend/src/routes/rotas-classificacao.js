import { Router } from 'express';
import { eventController } from '../controllers/controlador-evento.js';
import { asyncHandler } from '../utils/manipulador-rota-assincrona.js';

const router = Router();
router.get('/eventos', asyncHandler(eventController.ranking));

export default router;
