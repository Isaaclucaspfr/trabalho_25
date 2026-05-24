import { authService } from '../services/authService.js';

export const authController = {
  register: async (req, res) => res.status(201).json(await authService.register(req.body)),
  login: async (req, res) => res.json(await authService.login(req.body.email, req.body.password)),
  refresh: async (req, res) => res.json(await authService.refresh(req.body.refreshToken)),
  forgotPassword: async (req, res) => res.json(await authService.forgotPassword(req.body.email))
};
