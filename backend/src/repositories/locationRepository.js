import { prisma } from '../config/prisma.js';

export const locationRepository = {
  list: () => prisma.location.findMany({ where: { deletedAt: null } }),
  findById: (id) => prisma.location.findFirst({ where: { id, deletedAt: null } }),
  create: (data) => prisma.location.create({ data }),
  update: (id, data) => prisma.location.update({ where: { id }, data }),
  softDelete: (id) => prisma.location.update({ where: { id }, data: { deletedAt: new Date() } })
};
