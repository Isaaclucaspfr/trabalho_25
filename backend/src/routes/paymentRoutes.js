import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { checkoutSchema, paymentWebhookSchema } from '../validators/paymentValidator.js';

const router = Router();

router.post('/webhook', validate(paymentWebhookSchema), asyncHandler(paymentController.webhook));
router.post('/process', authMiddleware, validate(checkoutSchema), asyncHandler(paymentController.process));

export default router;

