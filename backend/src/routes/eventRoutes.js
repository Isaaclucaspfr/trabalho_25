import { Router } from 'express';
import { eventController } from '../controllers/eventController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { eventSchema } from '../validators/eventValidator.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(eventController.list));
router.get('/:id', asyncHandler(eventController.byId));
router.post('/', authMiddleware, roleMiddleware('ADMIN'), upload.single('image'), validate(eventSchema), asyncHandler(eventController.create));
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), upload.single('image'), asyncHandler(eventController.update));
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(eventController.delete));

export default router;
