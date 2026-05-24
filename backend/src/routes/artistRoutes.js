import { Router } from 'express';
import { artistController } from '../controllers/artistController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { artistSchema } from '../validators/artistValidator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(artistController.list));
router.get('/trending', asyncHandler(artistController.trending));
router.get('/:id', asyncHandler(artistController.byId));
router.post('/', authMiddleware, roleMiddleware('ADMIN'), upload.single('image'), validate(artistSchema), asyncHandler(artistController.create));
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), upload.single('image'), asyncHandler(artistController.update));
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(artistController.delete));

export default router;
