import { platformService } from '../services/servico-plataforma.js';

export const platformController = {
  stats: async (_req, res) => res.json(await platformService.stats())
};

