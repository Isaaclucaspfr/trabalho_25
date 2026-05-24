import { Router } from 'express';
import { eventController } from '../controllers/eventController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/eventos', asyncHandler(eventController.ranking));

export default router;
