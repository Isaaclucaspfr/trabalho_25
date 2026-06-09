import { Router } from 'express';
import { contactController } from '../controllers/controlador-contato.js';
import { validate } from '../middlewares/intermediario-validar-requisicao.js';
import { asyncHandler } from '../utils/manipulador-rota-assincrona.js';
import { contactMessageSchema } from '../validators/esquemas-contato.js';

const router = Router();

router.post('/messages', validate(contactMessageSchema), asyncHandler(contactController.create));

export default router;
