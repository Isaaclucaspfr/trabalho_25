import { userService } from '../services/servico-usuario.js';

export const userController = {
  me: async (req, res) => res.json(await userService.me(req.user.sub)),
  updateMe: async (req, res) => res.json(await userService.updateMe(req.user.sub, req.body)),
  uploadAvatar: async (req, res) => res.json(await userService.updateMe(req.user.sub, { avatar: `/uploads/${req.file.filename}` })),
  favorites: async (req, res) => res.json(await userService.favorites(req.user.sub)),
  toggleFavorite: async (req, res) => res.json(await userService.toggleFavorite(req.user.sub, req.params.eventId))
};
