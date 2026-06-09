import { prisma } from '../config/cliente-banco-dados.js';

export const eventRepository = {
  findById: (id) => prisma.event.findFirst({ where: { id, deletedAt: null }, include: { location: true, artists: { include: { artist: true } }, _count: { select: { favorites: true, tickets: true, views: true } } } }),
  create: (data) => prisma.event.create({ data }),
  update: (id, data) => prisma.event.update({ where: { id }, data }),
  softDelete: (id) => prisma.event.update({ where: { id }, data: { deletedAt: new Date() } })
};
