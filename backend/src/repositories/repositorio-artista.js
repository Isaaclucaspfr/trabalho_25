import { prisma } from '../config/cliente-banco-dados.js';

export const artistRepository = {
  list: () => prisma.artist.findMany({ where: { deletedAt: null } }),
  findById: (id) => prisma.artist.findFirst({ where: { id, deletedAt: null } }),
  create: (data) => prisma.artist.create({ data }),
  update: (id, data) => prisma.artist.update({ where: { id }, data }),
  softDelete: (id) => prisma.artist.update({ where: { id }, data: { deletedAt: new Date() } })
};
