import { artistService } from '../services/servico-artista.js';

export const artistController = {
  list: async (_req, res) => res.json(await artistService.list()),
  trending: async (_req, res) => res.json(await artistService.trending()),
  byId: async (req, res) => res.json(await artistService.byId(req.params.id)),
  create: async (req, res) => res.status(201).json(await artistService.create({ ...req.body, image: req.file ? `/uploads/${req.file.filename}` : undefined })),
  update: async (req, res) => res.json(await artistService.update(req.params.id, { ...req.body, image: req.file ? `/uploads/${req.file.filename}` : undefined })),
  delete: async (req, res) => res.json(await artistService.delete(req.params.id))
};
