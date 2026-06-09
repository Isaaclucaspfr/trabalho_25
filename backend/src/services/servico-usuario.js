import { prisma } from '../config/cliente-banco-dados.js';
import { userRepository } from '../repositories/repositorio-usuario.js';

export const userService = {
  me: (id) => userRepository.findById(id),
  updateMe: (id, data) => userRepository.update(id, data),

  async toggleFavorite(userId, eventId) {
    const found = await prisma.favorite.findUnique({ where: { userId_eventId: { userId, eventId } } });
    if (found) {
      await prisma.favorite.delete({ where: { userId_eventId: { userId, eventId } } });
      return { favorited: false };
    }
    await prisma.favorite.create({ data: { userId, eventId } });
    return { favorited: true };
  },

  favorites: (userId) => prisma.favorite.findMany({ where: { userId }, include: { event: true } })
};
