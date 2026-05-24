import { eventService } from '../services/eventService.js';

export const eventController = {
  list: async (req, res) => res.json(await eventService.list(req.query)),
  byId: async (req, res) => res.json(await eventService.findById(req.params.id, req.user?.sub)),
  create: async (req, res) => {
    const data = { ...req.body, image: req.file ? `/uploads/${req.file.filename}` : undefined };
    res.status(201).json(await eventService.create(data));
  },
  update: async (req, res) => {
    const data = { ...req.body, image: req.file ? `/uploads/${req.file.filename}` : undefined };
    res.json(await eventService.update(req.params.id, data));
  },
  delete: async (req, res) => res.json(await eventService.delete(req.params.id)),
  ranking: async (_req, res) => res.json(await eventService.ranking())
};
