import { Router } from 'express';
import { paymentController } from '../controllers/controlador-pagamento.js';
import { authMiddleware } from '../middlewares/intermediario-autenticar-requisicao.js';
import { validate } from '../middlewares/intermediario-validar-requisicao.js';
import { asyncHandler } from '../utils/manipulador-rota-assincrona.js';
import { checkoutSchema, paymentWebhookSchema } from '../validators/esquemas-pagamento.js';

const router = Router();

router.post('/webhook', validate(paymentWebhookSchema), asyncHandler(paymentController.webhook));
router.post('/process', authMiddleware, validate(checkoutSchema), asyncHandler(paymentController.process));

export default router;

