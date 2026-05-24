import { Router } from 'express';
import { contactController } from '../controllers/contactController.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { contactMessageSchema } from '../validators/contactValidator.js';

const router = Router();

router.post('/', validate(contactMessageSchema), asyncHandler(contactController.create));

export default router;

