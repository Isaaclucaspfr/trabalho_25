import { albumService } from '../services/servico-album.js';

export const albumController = {
  trending: async (_req, res) => res.json(await albumService.trending())
};

