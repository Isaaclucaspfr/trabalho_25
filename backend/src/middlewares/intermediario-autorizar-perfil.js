import { AppError } from '../utils/erro-aplicacao.js';

export function roleMiddleware(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) throw new AppError('Sem permissao', 403);
    next();
  };
}
