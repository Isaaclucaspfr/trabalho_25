import { verifyAccessToken } from '../utils/gerenciador-token.js';
import { AppError } from '../utils/erro-aplicacao.js';

export function authMiddleware(req, _res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) throw new AppError('Token ausente', 401);
  const token = auth.split(' ')[1];
  req.user = verifyAccessToken(token);
  next();
}
