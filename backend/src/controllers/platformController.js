import { platformService } from '../services/platformService.js';

export const platformController = {
  stats: async (_req, res) => res.json(await platformService.stats())
};

