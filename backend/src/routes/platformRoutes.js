import { Router } from 'express';
import { platformController } from '../controllers/platformController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/stats', asyncHandler(platformController.stats));

export default router;

