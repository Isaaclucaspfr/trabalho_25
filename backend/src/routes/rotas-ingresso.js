import { Router } from 'express';
import { authMiddleware } from '../middlewares/intermediario-autenticar-requisicao.js';
import { ticketController } from '../controllers/controlador-ingresso.js';
import { validate } from '../middlewares/intermediario-validar-requisicao.js';
import { reserveTicketSchema, ticketActionSchema } from '../validators/esquemas-ingresso.js';
import { asyncHandler } from '../utils/manipulador-rota-assincrona.js';
import { checkoutSchema } from '../validators/esquemas-pagamento.js';

const router = Router();
router.use(authMiddleware);
router.post('/reserve', validate(reserveTicketSchema), asyncHandler(ticketController.reserve));
router.post('/checkout', validate(checkoutSchema), asyncHandler(ticketController.checkout));
router.post('/pay', validate(ticketActionSchema), asyncHandler(ticketController.pay));
router.post('/cancel', validate(ticketActionSchema), asyncHandler(ticketController.cancel));
router.get('/my', asyncHandler(ticketController.my));

export default router;
