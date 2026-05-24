import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { dashboardController } from '../controllers/dashboardController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/metrics', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(dashboardController.metrics));

export default router;
