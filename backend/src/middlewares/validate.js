import { AppError } from '../utils/appError.js';

export const validate = (schema, field = 'body') => (req, _res, next) => {
  const parsed = schema.safeParse(req[field]);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((i) => i.message).join(', '), 422);
  }
  req[field] = parsed.data;
  next();
};
