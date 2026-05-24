import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema } from '../validators/userValidator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authMiddleware);
router.get('/me', asyncHandler(userController.me));
router.put('/me', validate(updateProfileSchema), asyncHandler(userController.updateMe));
router.post('/me/avatar', upload.single('avatar'), asyncHandler(userController.uploadAvatar));
router.get('/favorites', asyncHandler(userController.favorites));
router.post('/favorites/:eventId', asyncHandler(userController.toggleFavorite));

export default router;
