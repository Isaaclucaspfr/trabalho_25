import { Router } from 'express';
import { albumController } from '../controllers/albumController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/trending', asyncHandler(albumController.trending));

export default router;

