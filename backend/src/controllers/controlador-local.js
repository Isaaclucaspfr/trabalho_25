import { locationService } from '../services/servico-local.js';

export const locationController = {
  list: async (_req, res) => res.json(await locationService.list()),
  byId: async (req, res) => res.json(await locationService.byId(req.params.id)),
  create: async (req, res) => res.status(201).json(await locationService.create(req.body)),
  update: async (req, res) => res.json(await locationService.update(req.params.id, req.body)),
  delete: async (req, res) => res.json(await locationService.delete(req.params.id))
};
