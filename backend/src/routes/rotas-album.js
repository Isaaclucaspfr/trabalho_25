import { Router } from 'express';
import { albumController } from '../controllers/controlador-album.js';
import { asyncHandler } from '../utils/manipulador-rota-assincrona.js';

const router = Router();

router.get('/trending', asyncHandler(albumController.trending));

export default router;

