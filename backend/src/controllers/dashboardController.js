import { dashboardService } from '../services/dashboardService.js';

export const dashboardController = {
  metrics: async (_req, res) => res.json(await dashboardService.metrics())
};
