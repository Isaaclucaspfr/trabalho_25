import { prisma } from '../config/prisma.js';

export const userRepository = {
  findByEmail: (email) => prisma.user.findFirst({ where: { email, deletedAt: null } }),
  findById: (id) => prisma.user.findFirst({ where: { id, deletedAt: null } }),
  create: (data) => prisma.user.create({ data }),
  update: (id, data) => prisma.user.update({ where: { id }, data })
};
