import { prisma } from '../config/cliente-banco-dados.js';

export const ticketRepository = {
  create: (data) => prisma.ticket.create({ data }),
  findById: (id) => prisma.ticket.findUnique({ where: { id }, include: { event: true } }),
  update: (id, data) => prisma.ticket.update({ where: { id }, data }),
  myTickets: (userId) => prisma.ticket.findMany({ where: { userId }, include: { event: true }, orderBy: { createdAt: 'desc' } })
};
