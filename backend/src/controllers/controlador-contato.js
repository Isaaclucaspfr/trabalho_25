import { contactService } from '../services/servico-contato.js';

export const contactController = {
  create: async (req, res) => res.status(201).json(await contactService.createMessage(req.body, req.user?.sub))
};

