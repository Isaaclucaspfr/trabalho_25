import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';

export function authMiddleware(req, _res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) throw new AppError('Token ausente', 401);
  const token = auth.split(' ')[1];
  req.user = verifyAccessToken(token);
  next();
}
