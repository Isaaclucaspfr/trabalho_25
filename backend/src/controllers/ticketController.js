import { ticketService } from '../services/ticketService.js';

export const ticketController = {
  reserve: async (req, res) => res.status(201).json(await ticketService.reserve(req.user.sub, req.body.eventId, req.body.quantity)),
  checkout: async (req, res) => res.status(201).json(await ticketService.checkout(req.user.sub, req.body)),
  pay: async (req, res) => res.json(await ticketService.pay(req.user.sub, req.body.ticketId)),
  cancel: async (req, res) => res.json(await ticketService.cancel(req.user.sub, req.body.ticketId)),
  my: async (req, res) => res.json(await ticketService.my(req.user.sub))
};
