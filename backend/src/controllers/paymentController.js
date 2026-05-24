import { paymentService } from '../services/paymentService.js';

export const paymentController = {
  process: async (req, res) => res.status(201).json(await paymentService.processLegacy(req.user.sub, req.body)),
  webhook: async (req, res) => res.json(await paymentService.handleWebhook(req.headers, req.body))
};

