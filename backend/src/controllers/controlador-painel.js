import { dashboardService } from '../services/servico-painel.js';

export const dashboardController = {
  metrics: async (_req, res) => res.json(await dashboardService.metrics())
};
