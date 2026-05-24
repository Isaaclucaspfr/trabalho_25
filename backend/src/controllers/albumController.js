import { albumService } from '../services/albumService.js';

export const albumController = {
  trending: async (_req, res) => res.json(await albumService.trending())
};

