import { Router } from 'express';
import { locationController } from '../controllers/locationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { locationSchema } from '../validators/locationValidator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(locationController.list));
router.get('/:id', asyncHandler(locationController.byId));
router.post('/', authMiddleware, roleMiddleware('ADMIN'), validate(locationSchema), asyncHandler(locationController.create));
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(locationController.update));
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(locationController.delete));

export default router;
