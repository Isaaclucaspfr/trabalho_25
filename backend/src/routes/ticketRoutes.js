import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ticketController } from '../controllers/ticketController.js';
import { validate } from '../middlewares/validate.js';
import { reserveTicketSchema, ticketActionSchema } from '../validators/ticketValidator.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { checkoutSchema } from '../validators/paymentValidator.js';

const router = Router();
router.use(authMiddleware);
router.post('/reserve', validate(reserveTicketSchema), asyncHandler(ticketController.reserve));
router.post('/checkout', validate(checkoutSchema), asyncHandler(ticketController.checkout));
router.post('/pay', validate(ticketActionSchema), asyncHandler(ticketController.pay));
router.post('/cancel', validate(ticketActionSchema), asyncHandler(ticketController.cancel));
router.get('/my', asyncHandler(ticketController.my));

export default router;
